import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SESSION_PROGRAMS,nextSessionNumber} from './session-programs.js';
import {courses} from './courses.js';
import {createBookingFixture} from './student-booking.test.mjs';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
test('all programs plus trial are available and cancelled sessions do not affect the next number',()=>{
 assert.equal(SESSION_PROGRAMS.length,courses.length+1);assert.equal(SESSION_PROGRAMS[0].title,'Trial session');
 assert.equal(nextSessionNumber([{clientId:'one',program:'General English',number:5},{clientId:'one',program:'Trial session',number:10},{clientId:'one',program:'General English',number:6,reminderStatus:'cancelled'},{clientId:'other',number:30}],'one','General English'),6);
});
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': session course/level snapshots, editable history and confirmation labels',()=>{
 const f=createBookingFixture(filename),request=f.request,key='private-test-key',client=f.sheets.get('Clients').rows[1];if(filename==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/EmailActions.gs',import.meta.url),'utf8'),f.context);client[4]='1';client[11]='General English — 8 sessions';
 const owner=data=>request({key,...data});
 const token=request({action:'studentBookingLogin',passcode:owner({action:'bookingSettings'}).passcode}).token;
 const slots=request({action:'studentBookingCalendar',token}).days.flatMap(day=>day.slots).filter(slot=>slot.status==='available');
 const programs=['General English — 8 sessions','E-mail and business writing workshop','Trial session'];
 // Use the site's workshop spelling, rather than duplicating a guessed title.
 programs[1]=SESSION_PROGRAMS.find(program=>program.id==='writing').title;
 for(const [index,program]of programs.entries()){const saved=owner({action:'saveSession',session:{clientId:'student-1',number:[5,2,1][index],date:slots[index].date,time:slots[index].time,program,level:'1'}});assert.equal(saved.ok,true,saved.error);}
 const move={id:'student-1',name:'Test Student',email:'private@example.com',code:'1234',level:'2',program:programs[0],payment:'Paid',amountPaid:100,hours:0,permissions:[]};
 const advanced=owner({action:'upsertClient',client:move});assert.equal(advanced.ok,true,advanced.error);assert.equal(advanced.enrollmentHistory.length,1);assert.equal(advanced.enrollmentHistory[0].level,'1');
 assert.equal(owner({action:'upsertClient',client:move}).enrollmentHistory.length,1);
 const current=owner({action:'listClients'}).clients.find(item=>item.id==='student-1');assert.equal(current.level,'2');assert.equal(current.enrollmentHistory[0].level,'1');
 const sessions=owner({action:'listSessions'}).classes;assert(sessions.every(item=>item.level==='1'));assert.equal(sessions[0].program,programs[0]);
 const edited=owner({action:'upsertClient',client:{...move,historyEdit:{id:advanced.enrollmentHistory[0].id,level:'A1',program:programs[0]}}});assert.equal(edited.ok,true);assert.equal(edited.enrollmentHistory[0].level,'A1');assert.equal(owner({action:'listClients'}).clients.find(item=>item.id==='student-1').level,'2');
 // Immutable session snapshots retain Level 1 even after editing the history line.
 assert(owner({action:'listSessions'}).classes.every(item=>item.level==='1'));
 const rows=f.sheets.get('Sessions').rows.slice(1),email=f.context.sbCalendarEmail(client,rows);assert.match(email.body,/Conversation-based General English — Session 5/);assert(email.body.includes(programs[1]+' — Session 2'));assert.match(email.body,/Conversation-based General English — Trial session/);assert.match(email.body,/Level 1/);assert.doesNotMatch(email.body,/Level 2/);assert.match(email.htmlBody,/Level 1/);
 assert.equal(f.sheets.get('Clients').rows.length,3);
});
