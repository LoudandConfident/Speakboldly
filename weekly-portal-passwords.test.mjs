import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': monthly passwords are private, separate by folder and editable for the current month',()=>{
 const f=createSheetExamFixture(filename),request=f.request,key='private-test-key';
 f.advance(new Date('2026-11-30T21:59:59Z').getTime()-Date.now());
 assert.equal(request({action:'monthlyPortalPasswords'}).ok,false);
 const month=request({key,action:'monthlyPortalPasswords'});assert.equal(month.ok,true);assert.equal(month.monthStart,'2026-11-01');assert.equal(month.nextChange,'2026-12-01');assert.equal(Object.keys(month.passwords).length,18);assert.equal(new Set(Object.values(month.passwords)).size,18);
 for(const [folder,passcode] of Object.entries(month.passwords)){assert.match(passcode,/^\d{6}$/);assert.equal(request({action:'studentFolderLogin',folder,passcode}).ok,true);assert.equal(request({action:'studentFolderLogin',folder,passcode:'wrong'}).ok,false);}
 assert.equal(request({action:'studentFolderLogin',folder:'exams:2',passcode:month.passwords['material:2']}).ok,false);
 const metadata=request({action:'studentPortalAccess'});for(const password of Object.values(month.passwords))assert.equal(JSON.stringify(metadata).includes(password),false);
 request({key,action:'savePortalAccess',item:{id:'test:2',section:'tests',title:'Level 2',enabled:true}});
 const login={action:'studentExamLogin',level:2,name:'Student',program:'General English'};assert.equal(request({...login,passcode:month.passwords['exams:2']}).ok,true);assert.equal(request({...login,passcode:month.passwords['material:2']}).ok,false);assert.equal(request({...login,level:3,passcode:month.passwords['exams:2']}).ok,false);
 let replacement='123456';while(Object.values(month.passwords).includes(replacement))replacement=String(Number(replacement)+1);
 const edit={action:'saveMonthlyPortalPassword',monthStart:month.monthStart,group:'material:2',password:replacement};assert.equal(request(edit).ok,false);assert.equal(request({...edit,key}).ok,true);assert.equal(request({key,action:'monthlyPortalPasswords'}).passwords['material:2'],replacement);assert.notEqual(request({action:'studentPortalAccess'}).passwordSettings.revision,metadata.passwordSettings.revision);
 assert.equal(request({...edit,key,group:'exams:2'}).ok,false);
 f.advance(2000);const next=request({key,action:'monthlyPortalPasswords'});assert.equal(next.monthStart,'2026-12-01');assert.equal(next.nextChange,'2027-01-01');assert.notEqual(next.passwords['material:2'],replacement);assert.equal(request({...edit,key}).ok,false);
 for(const group of Object.keys(month.passwords))assert.notEqual(next.passwords[group],month.passwords[group]);
 f.context.setupStudentExams();assert.deepEqual(request({key,action:'monthlyPortalPasswords'}),next);
});
