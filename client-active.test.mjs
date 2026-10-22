import test from 'node:test';import assert from 'node:assert/strict';import {createSheetExamFixture} from './sheet-exam-fixture.mjs';import {clientTotals,validateClient} from './admin-clients.js';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': only the owner can deactivate and reactivate; client and session data remain intact',()=>{
 const f=createSheetExamFixture(filename),client=f.sheets.get('Clients').rows[1],originalLength=client.length,before=JSON.stringify(client.slice(0,originalLength)),sessions=JSON.stringify(f.sheets.get('Sessions')?.rows),payload={action:'setClientActive',clientId:'student-1',active:false};
 assert.equal(f.request(payload).ok,false);const result=f.request({...payload,key:'private-test-key'});assert.equal(result.ok,true,result.error);assert.equal(client[14],false);assert.equal(JSON.stringify(client.slice(0,originalLength)),before);assert.equal(JSON.stringify(f.sheets.get('Sessions')?.rows),sessions);
 const list=f.request({action:'listClients',key:'private-test-key'});assert.equal(list.ok,true,list.error);assert.equal(list.clients.find(c=>c.id==='student-1').active,false);
 assert.equal(f.request({...payload,active:true,key:'private-test-key'}).ok,true);assert.equal(client[14],true);
 assert.equal(f.request({...payload,clientId:'missing',key:'private-test-key'}).ok,false);
});
test('inactive clients and previous levels do not inflate active count; their taught hours stay in total',()=>{
 const clients=[{id:'one',active:true,hours:2,enrollmentHistory:[{hours:3},{hours:4}]},{id:'two',active:false,hours:5,enrollmentHistory:[{hours:6}]}];assert.deepEqual(clientTotals(clients),{clients:1,hours:20});clients[0].hours=0;assert.deepEqual(clientTotals(clients),{clients:1,hours:18});
 const saved=validateClient({name:'Test',email:'test@example.com',code:'1234',level:'1',payment:'Paid',hours:0,active:false});assert.equal(saved.active,false);
});
