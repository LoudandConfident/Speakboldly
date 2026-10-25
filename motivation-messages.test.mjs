import test from 'node:test';import assert from 'node:assert/strict';import {createSheetExamFixture} from './sheet-exam-fixture.mjs';import {setMotivationSettings,motivationDay,INITIAL_MOTIVATION_FREEZE} from './motivation-settings.js';
const day=d=>Math.floor(Date.parse(d)/86400000);
test('daily rotation stays paused until the owner resumes, including stale Sunday settings',()=>{
 setMotivationSettings(INITIAL_MOTIVATION_FREEZE);assert.equal(motivationDay(new Date('2026-10-25T12:00Z'),day),20750);assert.equal(motivationDay(new Date('2026-11-01T12:00Z'),day),20750);
 setMotivationSettings({frozen:true,day:20746,until:'2026-10-25',revision:'old-server'});assert.equal(motivationDay(new Date('2026-10-26T12:00Z'),day),20746);
 setMotivationSettings({frozen:false,day:20746,until:'',revision:'owner-resumed'});assert.equal(motivationDay(new Date('2026-10-26T12:00Z'),day),day('2026-10-26'));
});
test('owner can schedule and edit a quote with a public picture; public readers only receive the selected day',()=>{
 const f=createSheetExamFixture();f.advance(Date.parse('2026-10-25T12:00Z')-f.context.Date.now());f.request({action:'saveDailyMotivationSettings',key:'private-test-key',revision:'0',mode:'resume',day:day('2026-10-25')});let pictures=0;f.context.DriveApp={Access:{ANYONE_WITH_LINK:'public'},Permission:{VIEW:'view'},createFolder:()=>({getId:()=> 'folder',createFile:()=>({getId:()=> 'image-'+(++pictures),setSharing(){}})}),getFolderById:()=>({createFile:()=>({getId:()=> 'image-'+(++pictures),setSharing(){}})})};f.context.Utilities.base64Decode=v=>Array.from(Buffer.from(v,'base64'));f.context.Utilities.newBlob=()=>({});
 const p={action:'saveMotivationMessage',date:'2026-10-25',quote:'Keep learning.',reflection:'A little practice every day.',picture:{mimeType:'image/png',base64:Buffer.from([137,80,78,71,13,10,26,10]).toString('base64')}};
 assert.equal(f.request(p).ok,false);const saved=f.request({...p,key:'private-test-key'});assert.equal(saved.ok,true,saved.error);assert.match(saved.message.image,/drive.google.com\/thumbnail/);assert.equal(pictures,1);
 const view=f.request({action:'dailyMotivationSettings'});assert.equal(view.settings.message.quote,'Keep learning.');
 const edited=f.request({...p,picture:undefined,quote:'Keep growing.',key:'private-test-key'});assert.equal(edited.ok,true,edited.error);assert.equal(pictures,1);assert.equal(f.request({action:'listMotivationMessages',key:'private-test-key'}).messages.length,1);
 f.request({...p,date:'2026-10-26',quote:'Tomorrow only.',key:'private-test-key'});assert.equal(f.request({action:'dailyMotivationSettings',date:'2026-10-26'}).settings.message.quote,'Keep growing.');
 assert.equal(f.request({...p,date:'2026-02-31',key:'private-test-key'}).ok,false);
});

test('requested 24 October freeze survives old server state and a new owner revision releases it',()=>{
 setMotivationSettings({frozen:false,day:20746,until:'',revision:'213c7c67-d6c4-4afe-aa73-494b6a8c9630'});
 assert.equal(motivationDay(new Date('2026-11-05T12:00Z'),day),20750);
 setMotivationSettings({frozen:false,day:20751,until:'',revision:'owner-resumed-after-24-oct-pin'});
 assert.equal(motivationDay(new Date('2026-11-05T12:00Z'),day),day('2026-11-05'));
});
