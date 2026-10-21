import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {buildClientNotesWord} from './word-notes.js';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
export function wordParts(bytes){const buffer=Buffer.from(bytes),parts=new Map();let offset=0;while(buffer.readUInt32LE(offset)===0x04034b50){const size=buffer.readUInt32LE(offset+18),nameLength=buffer.readUInt16LE(offset+26),extra=buffer.readUInt16LE(offset+28),name=buffer.subarray(offset+30,offset+30+nameLength).toString(),start=offset+30+nameLength+extra;parts.set(name,buffer.subarray(start,start+size).toString());offset=start+size;}return parts;}
test('notes produce an editable Word package with escaped text, metadata and footer',()=>{
 const parts=wordParts(buildClientNotesWord({name:'Test Student',level:'2',program:'General English'},'French café & practice <speaking>.\nملاحظات الطالب',{date:'2026-10-13'}));assert(parts.has('[Content_Types].xml'));assert(parts.has('word/document.xml'));assert.match(parts.get('word/document.xml'),/French café &amp; practice &lt;speaking&gt;/);assert.match(parts.get('word/document.xml'),/ملاحظات الطالب/);assert.match(parts.get('word/document.xml'),/Level: 2/);assert.match(parts.get('word/footer1.xml'),/Prepared by Mira Nasser Louis/);assert.match(parts.get('[Content_Types].xml'),/wordprocessingml.document.main/);
});
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': notes email is authenticated, attached and retry-safe',()=>{
 const f=createSheetExamFixture(filename);if(filename==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/EmailActions.gs',import.meta.url),'utf8'),f.context);
 f.context.Utilities.base64Decode=value=>Array.from(Buffer.from(value,'base64'));
 f.context.Utilities.newBlob=(bytes,type,name)=>({bytes,type,name});f.context.Utilities.unzip=blob=>[...wordParts(blob.bytes)].map(([name,text])=>({getName:()=>name,getDataAsString:()=>text}));
 const payload={action:'sendClientEmail',clientId:'student-1',kind:'notes',requestId:'notes-test',docxBase64:Buffer.from(buildClientNotesWord({name:'Test Student'},'Practise speaking.')).toString('base64')};
 assert.equal(f.request(payload).ok,false);assert.equal(f.emails.length,0);
 assert.equal(f.request({...payload,key:'private-test-key',docxBase64:Buffer.from('not Word').toString('base64')}).ok,false);assert.equal(f.emails.length,0);
 const sent=f.request({...payload,key:'private-test-key'});assert.equal(sent.ok,true,sent.error);assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'private@example.com');assert.equal(f.emails[0].subject,'Notes — Speak Boldly');assert.equal(f.emails[0].attachments[0].type,'application/vnd.openxmlformats-officedocument.wordprocessingml.document');assert.match(f.emails[0].attachments[0].name,/Test Student — Level 2 — Notes — .*\.docx/);assert.match(f.emails[0].body,/notes attached/);
 assert.equal(f.request({...payload,key:'private-test-key'}).ok,true);assert.equal(f.emails.length,1);
 assert.equal(f.request({...payload,key:'private-test-key',clientId:'student-2'}).ok,false);
});
test('editable Action plan Word file carries the correct title and client',()=>{const parts=wordParts(buildClientNotesWord({name:'Sara',level:'3'},'Weekly practice: ten minutes a day.',{title:'Action plan',date:'2026-10-21'}));assert.match(parts.get('word/document.xml'),/Speak Boldly — Action plan/);assert.match(parts.get('word/document.xml'),/Sara/);assert.match(parts.get('docProps/core.xml'),/Sara — Action plan/);});
