import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': weekly passwords are private, grouped and rotate at Cairo Monday midnight',()=>{
 const f=createSheetExamFixture(filename),request=f.request,key='private-test-key';
 f.advance(new Date('2026-10-18T20:59:59Z').getTime()-Date.now());
 assert.equal(request({action:'weeklyPortalPasswords'}).ok,false);
 const weekly=request({key,action:'weeklyPortalPasswords'});assert.equal(weekly.ok,true);assert.equal(weekly.weekStart,'2026-10-12');assert.equal(weekly.nextChange,'2026-10-19');
 assert.deepEqual(request({key,action:'weeklyPortalPasswords'}),weekly);
 for(const password of Object.values(weekly.passwords))assert.match(password,/^\d{6}$/);
 const metadata=request({action:'studentPortalAccess'});for(const password of Object.values(weekly.passwords))assert.equal(JSON.stringify(metadata).includes(password),false);
 for(const folder of ['exercises','program:comprehension','program:listening']){assert.equal(request({action:'studentFolderLogin',folder,passcode:weekly.passwords.exercises}).ok,true);assert.equal(request({action:'studentFolderLogin',folder,passcode:'wrong'}).ok,false);}
 for(const folder of ['material','program:pronunciation'])assert.equal(request({action:'studentFolderLogin',folder,passcode:weekly.passwords.material}).ok,true);
 for(const folder of ['level:1','level:8','exercise:comprehension','exercise:listening','exercise:resources','contact','practice']){assert.equal(request({action:'studentFolderLogin',folder,passcode:weekly.passwords[folder]}).ok,true);assert.equal(request({action:'studentFolderLogin',folder,passcode:'wrong'}).ok,false);}
 assert.equal(request({action:'studentFolderLogin',folder:'invalid',passcode:weekly.passwords.material}).ok,false);
 assert.equal(request({key,action:'savePortalPasswordSettings',settings:{learning:'new'}}).ok,false);
 request({key,action:'savePortalAccess',item:{id:'test:2',section:'tests',title:'Level 2',enabled:true}});
 const login={action:'studentExamLogin',name:'Student',program:'General English'};
 assert.equal(request({...login,passcode:weekly.passwords.assessments}).ok,true);
 f.advance(2000);const next=request({key,action:'weeklyPortalPasswords'});assert.equal(next.weekStart,'2026-10-19');assert.equal(next.nextChange,'2026-10-26');
 for(const group of Object.keys(weekly.passwords))assert.notEqual(next.passwords[group],weekly.passwords[group]);
 assert.equal(request({action:'studentFolderLogin',folder:'material',passcode:weekly.passwords.material}).ok,false);
 assert.equal(request({action:'studentFolderLogin',folder:'material',passcode:next.passwords.material}).ok,true);
 assert.equal(request({...login,passcode:weekly.passwords.assessments}).ok,false);
 f.context.setupStudentExams();assert.deepEqual(request({key,action:'weeklyPortalPasswords'}),next);
});
