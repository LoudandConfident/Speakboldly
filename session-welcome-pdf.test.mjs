import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {PDFDocument,PDFName} from './vendor/pdf-lib.esm.min.js';
import {buildClientNotesPdf} from './notes-pdf.js';
test('welcome illustrations, notes, task and answer fields stay in one PDF',async()=>{
 const logo=readFileSync(new URL('./document-templates/sb-policy-logo.png',import.meta.url));
 const task=await PDFDocument.create();task.addPage([300,400]).drawText('Practise one conversation.');
 const bytes=await buildClientNotesPdf({name:'Example Learner',sessionNumber:3},'Vocabulary: curiosity\nAssignment: practise one conversation.',{
  title:'Session notes',fontBytes:readFileSync(new URL('./document-templates/DejaVuSans.ttf',import.meta.url)),logoBytes:logo,
  welcomeText:'How are you feeling today?\nWhat would you like to practise?',welcomeImages:[{type:'image/png',bytes:logo}],
  taskAttachments:[{type:'application/pdf',name:'Practice.pdf',bytes:await task.save()}]
 });
 const pdf=await PDFDocument.load(bytes);
 assert.match(pdf.getTitle(),/Session notes/);
 assert(pdf.getPageCount()>=3);
 assert.equal(pdf.getForm().getFields().length,1);
 const pictures=pdf.getPages().map(p=>p.node.Resources().lookup(PDFName.of('XObject'))?.keys().length||0);
 assert(pictures.some(count=>count>=2),'welcome illustration and branding must both be embedded');
});
