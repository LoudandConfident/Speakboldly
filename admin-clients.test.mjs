import test from 'node:test';import assert from 'node:assert/strict';import {validateClient,clientTotals,removeBrowserClient} from './admin-clients.js';
const sample={name:'Test Client',email:'test@example.com',level:'3',payment:'Unpaid',hours:'1.5',code:'4821',permissions:[]};
test('client input normalizes names/emails and rejects invalid data or duplicate clients',()=>{
 assert.deepEqual(validateClient({...sample,name:' Test Client ',email:' TEST@EXAMPLE.COM '}),{name:'Test Client',email:'test@example.com',level:'3',payment:'Unpaid',amountPaid:0,hours:1.5,code:'4821',permissions:[]});
 for(const input of [{...sample,name:''},{...sample,email:'not-email'},{...sample,level:'invalid'},{...sample,payment:'unknown'},{...sample,hours:'-1'},{...sample,hours:'NaN'},{...sample,hours:'0.001'},{...sample,hours:''}])assert.throws(()=>validateClient(input));
 const clients=[{id:'test-id',...validateClient(sample)}];assert.throws(()=>validateClient(sample,clients));assert.doesNotThrow(()=>validateClient(sample,clients,'test-id'));
});
test('dashboard totals count clients and sum taught hours without floating-point artifacts',()=>{
 assert.deepEqual(clientTotals([]),{clients:0,hours:0});assert.deepEqual(clientTotals([{hours:0.1},{hours:0.2},{hours:1.5}]),{clients:3,hours:1.8});
});

test('client levels accept numbers and named programs while preserving saved legacy records',()=>{
 for(const level of ['1','2','20','E-mail and business writing','Public speaking','Interview training','IELTS'])assert.equal(validateClient({...sample,level}).level,level);
 assert.throws(()=>validateClient({...sample,level:'0'}));
 assert.equal(validateClient({...sample,level:'B1'},[],null,{allowLegacy:true}).level,'B1');
});
test('repeated client names and previously assigned codes are rejected while edits remain valid',()=>{
 const existing={id:'one',...validateClient(sample)};
 assert.throws(()=>validateClient({...sample,name:'Another Learner',email:'other@example.com'},[existing]),/Student Code is already assigned/);
 for(const name of ['TEST CLIENT','  Test   Client  ','test client'])assert.throws(()=>validateClient({...sample,name,code:'5931',email:'other@example.com'},[existing]),/name is already registered/);
 assert.doesNotThrow(()=>validateClient({...sample,name:' TEST CLIENT '},[existing],'one'));
 assert.doesNotThrow(()=>validateClient({...sample,name:'Another Learner',code:'5931',email:'other@example.com'},[existing]));
});

test('deleting a browser client removes their calendar sessions and preserves other clients',()=>{
 const clientKey='speak-boldly-admin-clients-v1',sessionKey='speak-boldly-admin-sessions-v1';
 const data=new Map([[clientKey,JSON.stringify([{id:'one'},{id:'two'}])],[sessionKey,JSON.stringify([{clientId:'one'},{clientId:'two'}])]]);
 const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value),removeItem:key=>data.delete(key)};
 removeBrowserClient(storage,'one');
 assert.deepEqual(JSON.parse(data.get(clientKey)),[{id:'two'}]);
 assert.deepEqual(JSON.parse(data.get(sessionKey)),[{clientId:'two'}]);
});
