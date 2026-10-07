import test from 'node:test';
import assert from 'node:assert/strict';
import {buildResultEmail,emailResponseStatus} from './placement-email.js';
import {answerKey} from './placement-scoring.js';
test('email includes anonymous marks and estimated level without participant identifiers or answer choices',()=>{
 const record={version:'language-hub-60-v1',attemptId:'test-attempt-123456',submittedAt:'2026-10-07T00:00:00Z',answers:Object.fromEntries(answerKey.map((a,i)=>['q'+(i+1),String(a)])),name:'Never include',email:'private@example.com'};
 const data=buildResultEmail(record);assert.equal(data.Score,'60 / 60');assert.equal(data['Estimated level'],'B2–C1');assert.equal(data['Attempt ID'],record.attemptId);assert.equal(data._subject,'Speak Boldly placement result — B2–C1');assert.ok(!JSON.stringify(data).includes('Never include'));assert.ok(!JSON.stringify(data).includes('private@example.com'));assert.ok(!('answers'in data));
});
test('service acceptance, activation and rejection remain distinct',()=>{
 assert.equal(emailResponseStatus({success:'true',message:'Form successfully submitted.'}),'accepted');
 assert.equal(emailResponseStatus({success:true}),'accepted');
 assert.equal(emailResponseStatus({success:'true',message:'Check your email to activate this form'}),'activation-required');
 assert.equal(emailResponseStatus({success:false,message:'Form is not activated'}),'activation-required');
 assert.throws(()=>emailResponseStatus({success:false,message:'Unable to send'}));assert.throws(()=>emailResponseStatus({}));
});
