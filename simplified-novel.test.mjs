import test from 'node:test';import assert from 'node:assert/strict';import{readFileSync}from'node:fs';import{PDFDocument}from'./vendor/pdf-lib.esm.min.js';import{MONTHLY_NOVELS}from'./novels-catalog.js';
import {createHash} from 'node:crypto';

test('every Culture Corner book has a complete simplified resource, accurate page count and separate reading identity',async()=>{
 const identities=new Set(),files=new Set();
 for(const book of MONTHLY_NOVELS){
  const simple=book.simplified;assert(simple,'Missing simplified version: '+book.title);
  assert.notEqual(simple.id,book.id);assert(!identities.has(simple.id));identities.add(simple.id);
  assert.notEqual(simple.url,book.url);assert(!files.has(simple.url));files.add(simple.url);
  const slug=/^\.\/novels\/simplified\/([a-z0-9-]+)\.pdf$/.exec(simple.url)?.[1];assert(slug,book.title);
  const source=readFileSync('content/simplified-novels/'+slug+'.md','utf8'),manifest=JSON.parse(readFileSync('content/simplified-novels/'+slug+'-manifest.json','utf8'));
  assert(source.startsWith('# '+book.title+'\n'),book.title);assert(/not the complete original (?:text|novel)/.test(source),book.title);
  assert(source.trim().split(/\s+/).length>=1000,'Retelling is too short: '+book.title);
  assert((source.match(/^## \d+\./gm)||[]).length>=6,'Missing story chapters: '+book.title);
  assert(source.includes('## Words to keep'),'Missing glossary: '+book.title);
  assert.equal(manifest.id,simple.id);assert.equal(manifest.originalAuthor,book.author);assert.equal(manifest.url,simple.url);
  if(manifest.sourceSha256)assert.equal(manifest.sourceSha256,createHash('sha256').update(source).digest('hex'),'Stale PDF source: '+book.title);
  const pdf=await PDFDocument.load(readFileSync(new URL(simple.url,import.meta.url)));
  assert.equal(pdf.getPageCount(),simple.pages,book.title);assert.equal(manifest.pages,simple.pages,book.title);
  assert(simple.pages>=2&&simple.pages<=50,'Page limit: '+book.title);assert(simple.abridged);assert(pdf.getTitle().includes(book.title));
 }
});
test('current simplified novel is a real, separately identified retelling under 50 pages',async()=>{const book=MONTHLY_NOVELS.find(b=>b.id==='1260'),simple=book.simplified;assert(simple);assert.notEqual(simple.id,book.id);assert.notEqual(simple.url,book.url);const pdf=await PDFDocument.load(readFileSync(new URL(simple.url,import.meta.url)));assert.equal(pdf.getPageCount(),simple.pages);assert(simple.pages>10&&simple.pages<=50);assert(simple.abridged);const text=readFileSync('content/simplified-novels/jane-eyre.md','utf8');for(const term of ['Gateshead','Lowood','Helen Burns','Thornfield','Bertha','St John','Ferndean'])assert(text.includes(term));assert(text.includes('abridged')||text.includes('Abridged'));});

test('Pride and Prejudice simplified reading preserves its main story and separate reader identity',async()=>{const book=MONTHLY_NOVELS.find(b=>b.id==='1342'),simple=book.simplified;assert(simple);assert.notEqual(simple.id,book.id);const pdf=await PDFDocument.load(readFileSync(new URL(simple.url,import.meta.url)));assert.equal(pdf.getPageCount(),simple.pages);assert(simple.pages<=50);const text=readFileSync('content/simplified-novels/pride-and-prejudice.md','utf8');for(const term of ['Charlotte','Wickham','Georgiana','Pemberley','Lydia','Gardiner','Jane married Bingley','Elizabeth married Darcy'])assert(text.includes(term),term);assert(text.includes('not the complete original text'));});

test('Emma simplified version is a separate complete abridged reading under 50 pages',async()=>{const book=MONTHLY_NOVELS.find(b=>b.id==='158'),simple=book.simplified;assert(simple);assert.notEqual(simple.id,book.id);const pdf=await PDFDocument.load(readFileSync(new URL(simple.url,import.meta.url)));assert.equal(pdf.getPageCount(),simple.pages);assert(simple.pages>10&&simple.pages<=50);const text=readFileSync('content/simplified-novels/emma.md','utf8');for(const term of ['Robert Martin','Mr Elton','Jane Fairfax','Frank Churchill','Box Hill','Mr Knightley','Emma married Knightley'])assert(text.includes(term),term);assert(text.includes('not the complete original text'));});
