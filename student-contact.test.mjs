import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
import {createBookingFixture} from './student-booking.test.mjs';
import {learningDocumentCategory} from './learning-document-cards.js';
const note={action:'studentInstructorContact',requestId:'contact-1',name:'Learner',email:'learner@example.com',message:'Can we practise interview introductions?'};
for(const file of ['UnifiedCode.gs','Clients.gs']) {
 const fixture=()=>{const f=createSheetExamFixture(file);if(file==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/StudentContact.gs',import.meta.url),'utf8'),f.context);return f;};
 test(file+': public notes email the fixed instructor address once, with visitor Reply-To',()=>{
  const f=fixture();assert.equal(f.request({...note,to:'other@example.com'}).status,'sent');
  assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'speakboldly16@gmail.com');assert.equal(f.emails[0].replyTo,note.email);assert.match(f.emails[0].body,/interview introductions/);
  assert.equal(f.request(note).status,'sent');assert.equal(f.emails.length,1);assert.equal(f.sheets.get('Instructor requests').rows[1][5],'sent');
  assert.equal(f.request({...note,message:'Changed note'}).ok,false);assert.equal(f.emails.length,1);
 });
 test(file+': invalid notes and quota exhaustion do not send email',()=>{
  const f=fixture();for(const extra of [{email:'invalid'},{name:'Name\nInjected'},{message:''},{website:'spam'}])assert.equal(f.request({...note,...extra}).ok,false);
  f.context.MailApp.getRemainingDailyQuota=()=>0;assert.equal(f.request(note).ok,false);assert.equal(f.emails.length,0);
 });
 test(file+': uncertain delivery stays saved and is never blindly retried',()=>{
  const f=fixture();let attempts=0;f.context.MailApp.sendEmail=()=>{attempts++;throw new Error('Mail transport interrupted');};
  assert.equal(f.request(note).ok,false);assert.equal(f.sheets.get('Instructor requests').rows[1][5],'delivery_unknown');assert.equal(f.request(note).ok,false);assert.equal(attempts,1);
 });
 test(file+': daily limits bound public email sends without affecting retry recovery',()=>{
  const f=fixture();for(let i=0;i<3;i++)assert.equal(f.request({...note,requestId:'limit-'+i}).status,'sent');
  assert.equal(f.request({...note,requestId:'limit-3'}).ok,false);assert.equal(f.request({...note,requestId:'limit-0'}).status,'sent');assert.equal(f.emails.length,3);
 });
 test(file+': public calendar access survives changes to folder passwords',()=>{
  const f=createBookingFixture(file);const login=f.request({action:'studentBookingLogin',public:true});assert.equal(login.ok,true);
  f.context.sbWeeklyPortalPasswords=()=>({passwords:{calendar:'changed-password'}});
  assert.equal(f.request({action:'studentBookingCalendar',token:login.token}).ok,true);assert.equal(f.request({action:'studentBookingCalendar',token:'forged'}).ok,false);
 });
}
test('Activities includes exercise and comprehension documents while Listening remains separate',()=>{
 assert.equal(learningDocumentCategory({section:'exercises',title:'Level 2 — Comprehension'}),'practice');
 assert.equal(learningDocumentCategory({section:'exercises',title:'Level 2 — Grammar exercise'}),'practice');
 assert.equal(learningDocumentCategory({section:'exercises',title:'Level 2 — Listening'}),'listening');
});
