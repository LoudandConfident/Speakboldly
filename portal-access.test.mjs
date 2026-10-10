import test from 'node:test';import assert from 'node:assert/strict';
import {findStudentAccess,canOpenSection,canOpenFile,filePermission} from './portal-access.js';
import {validateClient} from './admin-clients.js';
test('assigned codes return only folder metadata, no client identity, and reject ambiguous codes',()=>{
 const client={name:'Example',email:'test@example.com',level:'3',code:'4821',permissions:['section:exercises']};
 const storage={getItem:()=>JSON.stringify([client])};
 assert.deepEqual(findStudentAccess('4821',storage),{code:'4821',number:1,level:'3',permissions:['section:exercises']});
 assert.equal(findStudentAccess('1962',storage),null);
 assert.equal(findStudentAccess('1962',{getItem:()=>JSON.stringify([{...client,code:'1962'}])}),null);
 assert.equal(findStudentAccess('4821',{getItem:()=>JSON.stringify([client,client])}),null);
 assert.equal(findStudentAccess('4821',{getItem:()=>'{invalid'}),null);
});
test('file access requires both its folder and its exact file grant',()=>{
 const url='https://loudandconfident.github.io/Speakboldly/student-files/exercises/one.pdf';
 const grant=filePermission('exercises',url),access={permissions:['section:exercises',grant]};
 assert.equal(canOpenSection(access,'exercises'),true);assert.equal(canOpenFile(access,'exercises',url),true);
 assert.equal(canOpenFile(access,'exercises',url.replace('one','two')),false);
 assert.equal(canOpenFile({permissions:[grant]},'exercises',url),false);
 assert.equal(canOpenSection(access,'exams'),false);
});
test('student codes must be four digits and unique when creating or editing clients',()=>{
 const input={name:'Example',email:'one@example.com',level:'1',payment:'Paid',hours:0,code:'4821'};
 const client={id:'one',...validateClient(input)};
 assert.throws(()=>validateClient({...input,email:'two@example.com'},[client]),/already assigned/);
 assert.doesNotThrow(()=>validateClient(input,[client],'one'));
 for(const code of ['', '123','12345','abcd'])assert.throws(()=>validateClient({...input,code}));
});
test('renaming material books preserves previously assigned file permissions',()=>{
 const access={permissions:['section:material','file:material:/Speakboldly/student-files/material/Berlitz%20English%20Level%205%20_-_%20Book.pdf']};
 assert.equal(canOpenFile(access,'material','https://loudandconfident.github.io/Speakboldly/student-files/material/B-Level-5-Book.pdf'),true);
 assert.equal(canOpenFile(access,'material','https://loudandconfident.github.io/Speakboldly/student-files/material/B-Level-6-Book.pdf'),false);
});
