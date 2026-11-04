import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {PDFDocument,rgb,StandardFonts} from '../vendor/pdf-lib.esm.min.js';
import fontkit from '../vendor/fontkit.es.min.js';
import {drawDocumentBranding} from '../document-branding.js';
const root=new URL('../',import.meta.url),source=readFileSync(new URL('content/simplified-novels/jane-eyre.md',root),'utf8');
const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
const regular=await pdf.embedFont(readFileSync(new URL('document-templates/DejaVuSans.ttf',root)),{subset:true}),bold=await pdf.embedFont(StandardFonts.HelveticaBold),logo=await pdf.embedPng(readFileSync(new URL('document-templates/sb-policy-logo.png',root)));
const width=419.53,height=595.28,left=44,right=width-44,ink=rgb(25/255,60/255,50/255),muted=rgb(.35,.43,.37),lime=rgb(.84,.92,.67);
let page,y;
function nextPage(){page=pdf.addPage([width,height]);y=height-112;page.drawText('Culture Corner · Simplified reading',{x:104,y:height-68,size:8,font:regular,color:muted});return page;}
function lines(text,font,size,max){const words=text.split(/\s+/),rows=[];let row='';for(const word of words){const candidate=row?row+' '+word:word;if(row&&font.widthOfTextAtSize(candidate,size)>max){rows.push(row);row=word;}else row=candidate;}if(row)rows.push(row);return rows;}
function paragraph(text,{size=11.5,font=regular,lineHeight=17.6,color=ink,gap=9}={}){for(const line of lines(text,font,size,right-left)){if(y<72)nextPage();page.drawText(line,{x:left,y,size,font,color});y-=lineHeight;}y-=gap;}
nextPage();y=height-160;page.drawRectangle({x:left,y:height-147,width:76,height:4,color:lime});paragraph('Jane Eyre',{size:34,lineHeight:42,gap:16});paragraph('A simplified retelling',{size:17,lineHeight:25,gap:20});paragraph('Original story by Charlotte Brontë',{size:12,lineHeight:20,gap:20});paragraph('The same journey. Clearer, shorter English.',{size:14,lineHeight:23,gap:20});paragraph('Abridged and retold for Speak Boldly\nIntermediate reading practice',{size:10.5,lineHeight:18,color:muted});
const sections=source.split(/^## /m).slice(1);for(const section of sections){const [heading,...rest]=section.split('\n');nextPage();paragraph(heading,{size:18,font:bold,lineHeight:24,gap:14});for(const text of rest.join('\n').trim().split(/\n\s*\n/)){if(!text.trim())continue;if(heading==='Words to keep'){for(const entry of text.split('\n'))paragraph(entry,{size:11,lineHeight:17,gap:9});}else paragraph(text);}}
await drawDocumentBranding(pdf,{font:regular,logo});
pdf.setTitle('Jane Eyre — Simplified version | Speak Boldly');pdf.setSubject('An abridged modern-English retelling of Charlotte Brontë’s public-domain novel.');pdf.setKeywords(['Jane Eyre','simplified retelling','Culture Corner','English reading']);
if(pdf.getPageCount()>50)throw Error('Simplified novel exceeds 50 pages: '+pdf.getPageCount());
const destination=new URL('novels/simplified/',root);mkdirSync(destination,{recursive:true});const bytes=await pdf.save();writeFileSync(new URL('jane-eyre.pdf',destination),bytes);writeFileSync(new URL('content/simplified-novels/jane-eyre-manifest.json',root),JSON.stringify({id:'1260-simplified',title:'Jane Eyre — Simplified version',originalAuthor:'Charlotte Brontë',pages:pdf.getPageCount(),words:source.split(/\s+/).length,language:'Simplified modern English for intermediate learners',url:'./novels/simplified/jane-eyre.pdf',abridged:true},null,2)+'\n');console.log('Built simplified Jane Eyre: '+pdf.getPageCount()+' pages; '+bytes.length+' bytes.');
