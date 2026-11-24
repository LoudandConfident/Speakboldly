import test from 'node:test';
import assert from 'node:assert/strict';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';

test('confirmation emails separate appointment details and state the standard session range',()=>{
 const {context}=createSheetExamFixture();
 for(const duration of [60,90]){
  const row=['session-1','student-1',2,'2026-11-19','18:00','2026-11-19T16:00:00Z','','pending','','','General English','2','',duration,'General English'];
  const email=context.sbCalendarEmail(['student-1','Monica'],[row]);
  assert.match(email.body,/60–90 minute session/);
  assert.match(email.htmlBody,/Date:<\/strong>/);
  assert.match(email.htmlBody,/Time:<\/strong>/);
  assert.match(email.htmlBody,/line-height:26px/);
  assert.match(email.htmlBody,/padding:20px/);
  assert.match(email.htmlBody,/margin:4px 0 14px/);
  assert.doesNotMatch(email.htmlBody,/<\/td><td/);
  for(const text of [email.body,email.htmlBody])assert.doesNotMatch(text,/reply to this e-?mail|Founded by Mira Nasser Louis/i);
  assert.match(email.htmlBody,/Speak Boldly\. All rights reserved/);
 }
});

test('assessment and longer appointments retain their actual duration',()=>{
 const {context}=createSheetExamFixture();
 for(const duration of [30,120]){
  const row=[];row[10]=duration===30?'Assessment':'In-person sessions';row[13]=duration;
  const detail=context.sbSessionEmailDetails(row);
  assert.match(detail,new RegExp(duration+'-minute session'));
  assert.doesNotMatch(detail,/60–90/);
 }
});
