import test from 'node:test';import assert from 'node:assert/strict';import {validateClient,clientTotals} from './admin-clients.js';
const sample={name:'Test Client',email:'test@example.com',level:'3',payment:'Unpaid',hours:'1.5',code:'4821',permissions:[]};
test('client input normalizes names/emails and rejects invalid data or duplicate clients',()=>{
 assert.deepEqual(validateClient({...sample,name:' Test Client ',email:' TEST@EXAMPLE.COM '}),{name:'Test Client',email:'test@example.com',level:'3',payment:'Unpaid',hours:1.5,code:'4821',permissions:[]});
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
