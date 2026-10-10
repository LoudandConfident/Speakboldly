import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {PDFDocument} from 'pdf-lib';import {fillTeacherPdf} from './teacher-pdf.js';
const catalog=JSON.parse(readFileSync(new URL('./document-templates/templates.json',import.meta.url)));
const fontBytes=readFileSync(new URL('./document-templates/DejaVuSans.ttf',import.meta.url));
test('all three supplied PDF templates remain editable and agree with their on-screen field coordinates',async()=>{
 assert.deepEqual(Object.keys(catalog),['progress','final','registration']);
 for(const template of Object.values(catalog)){const pdf=await PDFDocument.load(readFileSync(new URL(template.url,import.meta.url)));assert.equal(pdf.getPageCount(),template.pages.length);const names=new Set(pdf.getForm().getFields().map(field=>field.getName()));for(const page of template.pages)for(const field of page.fields){assert(names.has(field.name));assert(field.x>=0&&field.y>=0&&field.x+field.width<=1.001&&field.y+field.height<=1.001);}assert.equal(names.size,template.pages.reduce((sum,page)=>sum+page.fields.length,0));}
 assert.equal(catalog.progress.pages.length,2);assert(catalog.progress.pages.every(page=>page.width>page.height));assert.equal(catalog.final.pages.length,1);assert.equal(catalog.registration.pages.length,1);
});
test('PDF filling preserves editable values; final exports flatten filled fields for sending',async()=>{
 for(const template of Object.values(catalog)){const bytes=readFileSync(new URL(template.url,import.meta.url)),field=template.pages[0].fields[0],values={[field.name]:'Test Student — French café'};const editable=await PDFDocument.load(await fillTeacherPdf(bytes,values,{fontBytes}));assert.equal(editable.getForm().getTextField(field.name).getText(),values[field.name]);assert.equal(editable.getPageCount(),template.pages.length);const final=await PDFDocument.load(await fillTeacherPdf(bytes,values,{fontBytes,flatten:true}));assert.equal(final.getForm().getFields().length,0);assert.equal(final.getPageCount(),template.pages.length);}
});
