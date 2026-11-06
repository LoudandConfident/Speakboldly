import {readFileSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {MONTHLY_NOVELS} from '../novels-catalog.js';
import {PDFDocument} from '../vendor/pdf-lib.esm.min.js';

const root=new URL('../',import.meta.url);
for(const book of MONTHLY_NOVELS){
 const simple=book.simplified;
 if(!simple)throw Error('Missing simplified edition: '+book.title);
 const match=/^\.\/novels\/simplified\/([a-z0-9-]+)\.pdf$/.exec(simple.url);
 if(!match)throw Error('Invalid simplified file path: '+book.title);
 const slug=match[1],source=new URL('content/simplified-novels/'+slug+'.md',root),manifestURL=new URL('content/simplified-novels/'+slug+'-manifest.json',root),pdfURL=new URL(simple.url,root);
 const hash=createHash('sha256').update(readFileSync(source)).digest('hex');
 let manifest=existsSync(manifestURL)?JSON.parse(readFileSync(manifestURL,'utf8')):null;
 if(!existsSync(pdfURL)||!manifest||(manifest.sourceSha256&&manifest.sourceSha256!==hash)){
  execFileSync(process.execPath,[fileURLToPath(new URL('scripts/build-simplified-novel.mjs',root)),slug],{cwd:fileURLToPath(root),stdio:'inherit'});
  manifest=JSON.parse(readFileSync(manifestURL,'utf8'));
 }
 const pdf=await PDFDocument.load(readFileSync(pdfURL)),pages=pdf.getPageCount();
 if(pages<2||pages>50||pages!==simple.pages||pages!==manifest.pages||manifest.id!==simple.id)throw Error('Simplified catalogue/manifest mismatch: '+book.title);
 console.log('Verified '+book.title+': '+pages+' pages.');
}
