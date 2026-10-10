import test from 'node:test';import assert from 'node:assert/strict';import http from 'node:http';import {mkdtempSync,rmSync} from 'node:fs';import{tmpdir}from'node:os';import{join}from'node:path';import {randomUUID} from 'node:crypto';
import {createExamBackend} from './private-exams-server.mjs';
const input=()=>({submissionId:randomUUID(),name:'',age:'',program:'General English',level:'B1',message:'I now feel more confident speaking English at work.'});
async function start(dbPath=':memory:'){
 const backend=createExamBackend({dbPath,adminPassword:'review-owner',exams:[],origins:['https://allowed.example']});
 const server=http.createServer((req,res)=>backend.handle(req,res));await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const api=async(path,{method='GET',data,token,origin}={})=>{const response=await fetch('http://127.0.0.1:'+server.address().port+'/api/'+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{}),...(origin?{Origin:origin}:{})},body:data?JSON.stringify(data):undefined});return {status:response.status,data:response.status===204?null:await response.json(),headers:response.headers};};
 return {api,close:async()=>{await new Promise(r=>server.close(r));backend.close();}};
}
test('reviews publish immediately, anonymous fields are optional, retries deduplicate and only owner deletes',async()=>{
 const app=await start();try{
 const record=input();const first=await app.api('reviews',{method:'POST',data:record});assert.equal(first.status,201);assert.equal(first.data.review.name,'Anonymous');assert.equal(first.data.review.age,null);
 const duplicate=await app.api('reviews',{method:'POST',data:record});assert.equal(duplicate.status,200);assert.equal(duplicate.data.review.id,first.data.review.id);
 assert.equal((await app.api('reviews')).data.reviews.length,1);
 assert.equal((await app.api('admin/reviews/'+first.data.review.id,{method:'DELETE'})).status,401);
 const token=(await app.api('admin/login',{method:'POST',data:{password:'review-owner'}})).data.token;
 assert.equal((await app.api('admin/reviews',{token})).data.reviews.length,1);
 assert.equal((await app.api('admin/reviews/'+first.data.review.id,{method:'DELETE',token})).status,200);
 assert.equal((await app.api('reviews')).data.reviews.length,0);
 const preflight=await app.api('admin/reviews/example',{method:'OPTIONS',origin:'https://allowed.example'});assert.match(preflight.headers.get('access-control-allow-methods'),/DELETE/);
 assert.equal((await app.api('reviews',{origin:'https://wrong.example'})).status,403);
 }finally{await app.close();}
});
test('review validation and submission limits reject bad data and reviews survive restart',async()=>{
 const dir=mkdtempSync(join(tmpdir(),'speakboldly-reviews-'));let app=await start(join(dir,'reviews.sqlite'));
 try{
 assert.equal((await app.api('reviews',{method:'POST',data:{...input(),program:'Not a program'}})).status,400);
 assert.equal((await app.api('reviews',{method:'POST',data:{...input(),age:[]}})).status,400);
 assert.equal((await app.api('reviews',{method:'POST',data:{...input(),message:'short'}})).status,400);
 for(let i=0;i<3;i++)assert.equal((await app.api('reviews',{method:'POST',data:input()})).status,201);
 assert.equal((await app.api('reviews',{method:'POST',data:input()})).status,429);
 await app.close();app=await start(join(dir,'reviews.sqlite'));assert.equal((await app.api('reviews')).data.reviews.length,3);
 }finally{await app.close();rmSync(dir,{recursive:true,force:true});}
});
