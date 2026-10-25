import test from 'node:test';import assert from 'node:assert/strict';import vm from 'node:vm';import {readFileSync} from 'node:fs';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
for(const file of ['UnifiedCode.gs','Clients.gs'])test(file+': Ask your coach sends directly to the fixed coach mailbox and preserves reply-to and retry safety',()=>{
 const f=createSheetExamFixture(file);if(file==='Clients.gs')vm.runInContext(readFileSync('google-sheets/clients/StudentContact.gs','utf8'),f.context);
 const note={action:'studentInstructorContact',requestId:'coach-route-1',name:'Learner',email:'learner@example.com',message:'Please explain this sentence.',to:'untrusted@example.com'};
 assert.equal(f.request(note).status,'sent');assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'askcoach@speakboldly.space');assert.equal(f.emails[0].replyTo,'learner@example.com');assert.equal(f.request(note).status,'sent');assert.equal(f.emails.length,1);
});
