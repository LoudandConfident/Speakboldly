import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeStudentContact} from './student-contact.js';
function fixture(responses){
 const send={disabled:false},status={textContent:''},close={},inputHandlers={},sent=[];
 let id=0;const elements={name:{value:'Learner',focus(){}},email:{value:'learner@example.com'},message:{value:'Can you help me practise?'},website:{value:''}};
 const form={elements,querySelector:()=>send,querySelectorAll:()=>Object.values(elements),addEventListener:(event,handler)=>inputHandlers[event]=handler,reportValidity:()=>true,reset(){Object.values(elements).forEach(input=>input.value='');}};
 const dialog={open:false,querySelector:selector=>selector==='form'?form:selector==='[role=status]'?status:close,setAttribute(){},showModal(){this.open=true;},close(){this.open=false;}};
 const win={crypto:{randomUUID:()=> 'request-'+(++id)},setTimeout,clearTimeout,localStorage:{getItem(){throw new Error('Public contact must not use a password gate');}},fetch:async(url,options)=>{sent.push(JSON.parse(options.body));const next=responses.shift();if(next instanceof Error)throw next;return{ok:true,json:async()=>next};}};
 const doc={defaultView:win,body:{append(){}},createElement:()=>dialog,querySelector:selector=>selector==='#portal-contact'?{querySelector:()=>({addEventListener(){}})}:{elements:{endpoint:{defaultValue:'https://example.com/exec'}}}};
 const api=initializeStudentContact(doc);return{api,form,status,send,sent,elements,inputHandlers,dialog};
}
test('contact note opens directly and posts to email backend without a password or mail-app handoff',async()=>{
 const f=fixture([{ok:true,status:'sent'}]);f.api.open();assert.equal(f.dialog.open,true);assert.match(f.dialog.innerHTML,/How can I help you\?/);assert(!/WhatsApp|mailto:|passcode|password/.test(f.dialog.innerHTML));
 await f.form.onsubmit({preventDefault(){}});assert.equal(f.sent[0].action,'studentInstructorContact');assert.equal(f.sent[0].message,f.elements.message.value);assert(!('key' in f.sent[0]));assert.equal(f.send.disabled,true);assert.match(f.status.textContent,/emailed/);
 await f.form.onsubmit({preventDefault(){}});assert.equal(f.sent.length,1);
});
test('failed requests retain their id for retry and never show success before backend acknowledgement',async()=>{
 const f=fixture([new Error('Connection lost'),{ok:true,status:'sent'}]);await f.form.onsubmit({preventDefault(){}});assert.equal(f.send.disabled,false);assert(!/emailed/.test(f.status.textContent));
 await f.form.onsubmit({preventDefault(){}});assert.equal(f.sent[0].requestId,f.sent[1].requestId);assert.match(f.status.textContent,/emailed/);
});
test('a deployment that does not recognise contact requests shows an actionable error',async()=>{
 const f=fixture([{ok:false,error:'Incorrect connection key.'}]);await f.form.onsubmit({preventDefault(){}});assert.match(f.status.textContent,/deploy the updated contact script/);assert.equal(f.send.disabled,false);
});
