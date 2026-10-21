import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {PDFDocument} from './vendor/pdf-lib.esm.min.js';import {fillTeacherPdf} from './teacher-pdf.js';
const catalog=JSON.parse(readFileSync(new URL('./document-templates/templates.json',import.meta.url)));
const fontBytes=readFileSync(new URL('./document-templates/DejaVuSans.ttf',import.meta.url));
test('all three supplied PDF templates remain editable and agree with their on-screen field coordinates',async()=>{
 assert.deepEqual(Object.keys(catalog),['progress','final','registration']);
 for(const template of Object.values(catalog)){const pdf=await PDFDocument.load(readFileSync(new URL(template.url,import.meta.url)));assert.equal(pdf.getPageCount(),template.pages.length);const names=new Set(pdf.getForm().getFields().map(field=>field.getName()));for(const page of template.pages)for(const field of page.fields){assert(names.has(field.name));assert(field.x>=0&&field.y>=0&&field.x+field.width<=1.001&&field.y+field.height<=1.001);}assert.equal(names.size,template.pages.reduce((sum,page)=>sum+page.fields.length,0));}
 assert.equal(catalog.progress.pages.length,1);assert.equal(catalog.final.pages.length,1);assert.equal(catalog.registration.pages.length,1);
 for(const template of Object.values(catalog))for(const page of template.pages)for(const field of page.fields)assert(!/signature/i.test(field.name));
 const progressFields=catalog.progress.pages.flatMap(page=>page.fields);assert.equal(progressFields.length,13);assert(progressFields.every(field=>!/behavior|attitude|punctual|attendance|participation|homework/i.test(field.name)));
});
test('PDF filling preserves editable values; final exports flatten filled fields for sending',async()=>{
 for(const template of Object.values(catalog)){const bytes=readFileSync(new URL(template.url,import.meta.url)),field=template.pages[0].fields[0],values={[field.name]:'Test Student — French café'};const editable=await PDFDocument.load(await fillTeacherPdf(bytes,values,{fontBytes}));assert.equal(editable.getForm().getTextField(field.name).getText(),values[field.name]);assert.equal(editable.getPageCount(),template.pages.length);const final=await PDFDocument.load(await fillTeacherPdf(bytes,values,{fontBytes,flatten:true}));assert.equal(final.getForm().getFields().length,0);assert.equal(final.getPageCount(),template.pages.length);}
});

test('long report comments are preserved and auto-sized instead of rejected at 100 characters',async()=>{
 const template=catalog.progress,meta=template.pages[0].fields.find(f=>f.multiline),value='The learner speaks clearly and confidently. '.repeat(20),bytes=readFileSync(new URL(template.url,import.meta.url));
 const pdf=await PDFDocument.load(await fillTeacherPdf(bytes,{[meta.name]:value},{fontBytes}));
 const field=pdf.getForm().getTextField(meta.name);assert.equal(field.getText(),value);assert.equal(field.getMaxLength(),undefined);
 const appearance=field.acroField.getDefaultAppearance();const size=Number(appearance.match(/([\d.]+)\s+Tf/)[1]);assert(size>0&&size<8,appearance);
 const final=await PDFDocument.load(await fillTeacherPdf(bytes,{[meta.name]:value},{fontBytes,flatten:true}));assert.equal(final.getForm().getFields().length,0);
});
