import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {mergeSheetClients,initializeClientSheet,loadClientsFromSheet,clearClientSheet} from './client-sheet.js';
const client={id:'client-1',name:'Test Learner',email:'test@example.com',code:'0012',level:'2',payment:'Paid',amountPaid:100,hours:3,permissions:['section:reports']};
test('sheet values win while browser-only clients are preserved',()=>{
 const other={...client,id:'client-2',email:'other@example.com'};
 const moved={...client,id:'remote-id',hours:5};
 assert.deepEqual(mergeSheetClients([client,other],[moved]),[moved,other]);
});
test('authenticated client loading validates every returned row',async()=>{
 const handlers={},button={},status={},form={elements:{endpoint:{value:'https://script.google.com/macros/s/test/exec',defaultValue:'https://script.google.com/macros/s/test/exec'},key:{value:'private-test-key'}},querySelector:()=>button,addEventListener:(name,fn)=>handlers[name]=fn};
 const doc={querySelector:s=>s==='#client-sheet-connect'?form:s==='#client-sheet-status'?status:null,defaultView:{localStorage:{setItem(){}},Event:class{}},dispatchEvent(){}};
 const previous=globalThis.fetch;globalThis.fetch=async()=>({ok:true,json:async()=>({ok:true,connected:true})});
 try{
  initializeClientSheet(doc);await handlers.submit({preventDefault(){}});
  const rows=await loadClientsFromSheet(async(url,options)=>{const body=JSON.parse(options.body);assert.equal(body.action,'listClients');assert.equal(body.key,'private-test-key');assert.equal(options.credentials,'omit');return {ok:true,json:async()=>({ok:true,clients:[client]})};});
  assert.deepEqual(rows,[client]);
  await assert.rejects(loadClientsFromSheet(async()=>({ok:true,json:async()=>({ok:true,clients:[client,client]})})),/duplicate Client ID/);
  await assert.rejects(loadClientsFromSheet(async()=>({ok:true,json:async()=>({ok:true})})),/Update your Clients/);
 }finally{globalThis.fetch=previous;clearClientSheet();}
});
for(const filename of ['StandaloneClients.gs','Clients.gs']){
 test(filename+' authenticates reads and preserves leading zero codes and permissions',()=>{
  const row=['client-1','Test Learner','test@example.com','0012','2','Paid',100,3,'date',JSON.stringify(client.permissions)];
  const sheet={getLastRow:()=>2,getRange:()=>({getValues:()=>[row]})};
  const context={PropertiesService:{getScriptProperties:()=>({getProperty:k=>k==='CLIENT_SYNC_KEY'?'private-test-key':'sheet-id'})},LockService:{getScriptLock:()=>({waitLock(){},hasLock:()=>true,releaseLock(){}})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})},ContentService:{MimeType:{JSON:'json'},createTextOutput:s=>({setMimeType:()=>JSON.parse(s)})}};
  vm.createContext(context);vm.runInContext(fs.readFileSync('./google-sheets/clients/'+filename,'utf8'),context);
  const call=p=>context.doPost({postData:{contents:JSON.stringify(p)}});
  assert.equal(call({action:'listClients',key:'wrong'}).ok,false);
  assert.equal(call({action:'checkConnection',key:'private-test-key'}).connected,true);
  assert.deepEqual(JSON.parse(JSON.stringify(call({action:'listClients',key:'private-test-key'}).clients)),[client]);
 });
}


