import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {PDFDocument} from './vendor/pdf-lib.esm.min.js';
import {buildClientNotesPdf} from './client-notes.js';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
const font=readFileSync(new URL('./document-templates/DejaVuSans.ttf',import.meta.url));
test('notes produce a branded, paginated PDF with client metadata',async()=>{
 const bytes=await buildClientNotesPdf({name:'Test Student',level:'2',program:'General English'},'French café — practise speaking.\n'.repeat(250),font,{date:'2026-10-13'});
 const pdf=await PDFDocument.load(bytes);assert(pdf.getPageCount()>1);assert.equal(pdf.getAuthor(),'Mira Nasser Louis');assert.equal(pdf.getTitle(),'Test Student — Notes');assert.equal(pdf.getForm().getFields().length,0);
});
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': notes email is authenticated, attached and retry-safe',()=>{
 const f=createSheetExamFixture(filename);if(filename==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/EmailActions.gs',import.meta.url),'utf8'),f.context);
 f.context.Utilities.base64Decode=value=>Array.from(Buffer.from(value,'base64'));
 f.context.Utilities.newBlob=(bytes,type,name)=>({bytes,type,name});
 const payload={action:'sendClientEmail',clientId:'student-1',kind:'notes',requestId:'notes-test',pdfBase64:Buffer.from('%PDF-1.7 test').toString('base64')};
 assert.equal(f.request(payload).ok,false);assert.equal(f.emails.length,0);
 assert.equal(f.request({...payload,key:'private-test-key',pdfBase64:Buffer.from('not PDF').toString('base64')}).ok,false);assert.equal(f.emails.length,0);
 const sent=f.request({...payload,key:'private-test-key'});assert.equal(sent.ok,true,sent.error);assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'private@example.com');assert.equal(f.emails[0].subject,'Notes — Speak Boldly');assert.equal(f.emails[0].attachments[0].type,'application/pdf');assert.match(f.emails[0].attachments[0].name,/Test Student — Level 2 — Notes — .*\.pdf/);assert.match(f.emails[0].body,/notes attached/);
 assert.equal(f.request({...payload,key:'private-test-key'}).ok,true);assert.equal(f.emails.length,1);
 assert.equal(f.request({...payload,key:'private-test-key',clientId:'student-2'}).ok,false);
});
