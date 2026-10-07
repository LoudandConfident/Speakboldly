import test from 'node:test';import assert from 'node:assert/strict';
import {loadPortalMaterials} from './portal-materials.js';
test('portal lists uploaded materials and skips folders, hidden files, and unexpected paths',async()=>{
 let requested='';const files=[{type:'file',name:'.gitkeep',path:'student-files/exercises/.gitkeep'},{type:'dir',name:'folder',path:'student-files/exercises/folder'},{type:'file',name:'Lesson_1.pdf',path:'student-files/exercises/Lesson_1.pdf'},{type:'file',name:'bad.pdf',path:'other/bad.pdf'}];
 const result=await loadPortalMaterials('exercises',async url=>{requested=url;return{ok:true,status:200,json:async()=>files};});assert.ok(requested.includes('/student-files/exercises?ref=main'));assert.deepEqual(result,[{title:'Lesson 1',url:'https://loudandconfident.github.io/Speakboldly/student-files/exercises/Lesson_1.pdf'}]);
});
test('empty folders and service failures are distinguishable',async()=>{
 assert.deepEqual(await loadPortalMaterials('reports',async()=>({status:404})),[]);
 await assert.rejects(()=>loadPortalMaterials('exams',async()=>({status:403,ok:false})));
 await assert.rejects(()=>loadPortalMaterials('exams',async()=>({status:200,ok:true,json:async()=>({})})));
 await assert.rejects(()=>loadPortalMaterials('unknown',async()=>({status:200,ok:true})));
});
