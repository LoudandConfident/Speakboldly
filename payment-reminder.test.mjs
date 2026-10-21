import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
import {createPaymentReminder} from './payment-reminder.js';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': payment reminders require owner auth, use saved recipient and send once per request',()=>{
 const f=createSheetExamFixture(filename);if(filename==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/EmailActions.gs',import.meta.url),'utf8'),f.context);
 const payload={action:'sendClientEmail',clientId:'student-1',kind:'paymentReminder',requestId:'round-payment',email:'wrong@example.com'};
 assert.equal(f.request(payload).ok,false);assert.equal(f.emails.length,0);
 const first=f.request({...payload,key:'private-test-key'});assert.equal(first.ok,true,first.error);assert.equal(f.emails.length,1);assert.notEqual(f.emails[0].to,payload.email);
 assert.match(f.emails[0].subject,/Payment reminder for new round/);assert.match(f.emails[0].body,/next round/);assert.match(f.emails[0].body,/speakboldly16@gmail.com/);assert.equal(f.emails[0].attachments,undefined);
 assert.equal(f.request({...payload,key:'private-test-key'}).ok,true);assert.equal(f.emails.length,1);
});
class Node{constructor(){this.children=[];}append(...items){this.children.push(...items);}setAttribute(){}}
const doc={createElement:()=>new Node(),defaultView:{crypto:{randomUUID:()=> 'request-1'}}};
test('cancelled reminder sends nothing; retry reuses identity and reports success',async()=>{
 let approved=false,calls=[],fail=true;const ui=createPaymentReminder(doc,()=>({id:'client-1',name:'Sara',email:'sara@example.com'}),()=>true,{connected:()=>true,confirm:async()=>approved,send:async(id,kind,payload)=>{calls.push({id,kind,...payload});if(fail)throw Error('Connection failed');return {recipient:'sara@example.com'};}}),[button,note]=ui.children;
 await button.onclick();assert.equal(calls.length,0);approved=true;await button.onclick();assert.equal(button.disabled,false);assert.match(note.textContent,/Connection failed/);fail=false;await button.onclick();assert.equal(calls[0].requestId,calls[1].requestId);assert.equal(calls[1].kind,'paymentReminder');assert.match(note.textContent,/emailed to sara@example.com/);
});
