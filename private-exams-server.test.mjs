import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {mkdtempSync,rmSync} from 'node:fs';import {tmpdir} from 'node:os';import {join} from 'node:path';
import {createExamBackend} from './private-exams-server.mjs';
const exam={level:1,title:'Test exam',questions:Array.from({length:20},(_,i)=>({number:i+1,question:'Question '+i,options:['Correct','Wrong'],correct:0})),sections:{B:{title:'Corrections',intro:[],questions:['One question']},C:{title:'Reading',intro:['Passage'],questions:['One question']},D:{title:'Listening',intro:[],questions:[]},E:{title:'Writing',intro:[],questions:[]}},teacherNotes:['Private teacher answer key']};
const client=(name,code)=>({name,email:name.toLowerCase()+'@example.com',level:'1',code,payment:'Paid',hours:0,permissions:['section:exams','file:exams:/Speakboldly/student-files/exams/Level-1-Exam.pdf']});
async function start(path=':memory:'){const backend=createExamBackend({dbPath:path,adminPassword:'test-owner-password',exams:[exam],origins:['https://allowed.example']});const server=http.createServer((req,res)=>backend.handle(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port;
 const api=async(path,token,data,method)=>{const response=await fetch(base+'/api/'+path,{method:method||(data?'POST':'GET'),headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined});return{status:response.status,data:await response.json()};};
 return{api,base,close:async()=>{await new Promise(r=>server.close(r));backend.close();}};
}
test('private workflow links clients, tracks access, hides grades until review and enforces permissions',async()=>{
 const app=await start();try{
 const {api}=app;assert.equal((await api('admin/clients')).status,401);
 assert.equal((await api('admin/login',null,{password:'wrong'})).status,401);
 const owner=(await api('admin/login',null,{password:'test-owner-password'})).data.token;
 const first=(await api('admin/clients',owner,client('First','4821'))).data.client;
 const second=(await api('admin/clients',owner,client('Second','4831'))).data.client;
 assert.notEqual(first.id,second.id);
 const login=(await api('student/login',null,{code:'4821'})).data;const student=login.token;
 const other=(await api('student/login',null,{code:'4831'})).data.token;
 assert.equal((await api('admin/clients',student)).status,401);
 assert.equal((await api('student/login',null,{code:'1962'})).status,401);
 const opened=await api('student/exams/1',student);assert.equal(opened.status,200);assert(!JSON.stringify(opened.data).includes('correct'));assert(!JSON.stringify(opened.data).includes('teacher'));
 const id=opened.data.attempt.id;assert.equal((await api('student/attempts/'+id,other)).status,404);
 const answers={A:Object.fromEntries(Array.from({length:20},(_,i)=>[i+1,0])),B:{1:'Correction'},C:{1:'Reading answer'},D:'Summary',E:'Essay'};
 const submitted=await api('student/attempts/'+id+'/submit',student,{answers,percentage:100});assert.equal(submitted.data.attempt.percentage,null);assert.equal(submitted.data.attempt.status,'Awaiting review');assert(!JSON.stringify(submitted.data).includes('objective'));
 assert.equal((await api('student/attempts/'+id+'/submit',other,{answers})).status,404);
 const before=await api('admin/attempts',owner);assert.equal(before.data.attempts[0].client.id,first.id);assert.equal(before.data.attempts[0].multipleChoiceMarks,20);assert.equal(before.data.events.length,2);
 assert.equal((await api('admin/attempts/'+id+'/review',owner,{marks:{B:21,C:20,D:20,E:20},feedback:''})).status,400);
 const review=await api('admin/attempts/'+id+'/review',owner,{marks:{B:15,C:16,D:17,E:18},feedback:'Good progress'});assert.equal(review.data.attempt.percentage,86);
 const final=await api('student/attempts/'+id,student);assert.equal(final.data.attempt.percentage,86);assert.equal(final.data.attempt.feedback,'Good progress');
 await api('student/attempts/'+id+'/submit',student,{answers:{A:{},B:{},C:{},D:'',E:''}});assert.equal((await api('student/attempts/'+id,student)).data.attempt.percentage,86);
 await api('admin/clients',owner,{...first,permissions:[]});assert.equal((await api('student/exams/1',student)).status,403);assert.equal((await api('student/attempts/'+id,student)).status,403);
 const denied=await fetch(app.base+'/api/status',{headers:{Origin:'https://untrusted.example'}});assert.equal(denied.status,403);
 }finally{await app.close();}
});
test('clients, submissions and reviewed percentages survive backend restart',async()=>{
 const folder=mkdtempSync(join(tmpdir(),'speak-boldly-db-')),path=join(folder,'portal.sqlite');let app=await start(path);
 try{const owner=(await app.api('admin/login',null,{password:'test-owner-password'})).data.token;await app.api('admin/clients',owner,client('Persisted','4821'));
 const student=(await app.api('student/login',null,{code:'4821'})).data.token;
 const id=(await app.api('student/exams/1',student)).data.attempt.id;
 await app.api('student/attempts/'+id+'/submit',student,{answers:{A:{1:0},B:{},C:{},D:'Test summary',E:'Test essay'}});
 await app.api('admin/attempts/'+id+'/review',owner,{marks:{B:10,C:10,D:10,E:10},feedback:'Reviewed'});
 await app.close();app=await start(path);
 const result=(await app.api('student/exams/1',student)).data.attempt;assert.equal(result.percentage,41);assert.equal(result.status,'Reviewed');
 }finally{await app.close();rmSync(folder,{recursive:true,force:true});}
});
test('unconfigured private backend reports unavailable instead of pretending to save',async()=>{
 const backend=createExamBackend({dbPath:':memory:',adminPassword:'',exams:[]}),server=http.createServer((q,r)=>backend.handle(q,r));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 try{const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/student/login',{method:'POST',body:JSON.stringify({code:'4821'})});assert.equal(response.status,503);}finally{await new Promise(r=>server.close(r));backend.close();}
});
test('private student login allows three entries per account per day and leaves owner login unaffected',async()=>{
 const app=await start();try{
 const owner=(await app.api('admin/login',null,{password:'test-owner-password'})).data.token;
 await app.api('admin/clients',owner,client('Limited','4821'));await app.api('admin/clients',owner,client('Other','4831'));
 for(let i=0;i<3;i++)assert.equal((await app.api('student/login',null,{code:'4821'})).status,200);
 assert.equal((await app.api('student/login',null,{code:'4821'})).status,429);
 assert.equal((await app.api('student/login',null,{code:'4831'})).status,200);
 assert.equal((await app.api('admin/clients',owner)).status,200);
 }finally{await app.close();}
});
test('three incorrect student codes block more guesses for the day without blocking the owner',async()=>{
 const app=await start();try{
 for(let i=0;i<3;i++)assert.equal((await app.api('student/login',null,{code:'9999'})).status,401);
 assert.equal((await app.api('student/login',null,{code:'9999'})).status,429);
 assert.equal((await app.api('admin/login',null,{password:'test-owner-password'})).status,200);
 }finally{await app.close();}
});
