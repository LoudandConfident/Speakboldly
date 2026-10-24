import test from 'node:test';
import assert from 'node:assert/strict';
import {SESSION_TYPES,CLIENT_PROGRAMS,SESSION_PROGRAMS,calendarProgramForType} from './session-programs.js';
import {validateSession} from './admin-calendar.js';
import {courses} from './courses.js';
import {createBookingFixture} from './student-booking.test.mjs';
test('appointment choices are separate from course selection and client program filtering',()=>{
 assert.deepEqual(SESSION_TYPES.map(item=>item.title),['Session','Trial session','Assessment']);
 for(const id of ['urgent-session','instructor-training','different-learners']){assert(!CLIENT_PROGRAMS.some(item=>item.id===id));assert(courses.some(item=>item.id===id));}
 assert.equal(calendarProgramForType('trial',''),'Trial session');assert.equal(calendarProgramForType('assessment',''),'Assessment');
 const normal=SESSION_PROGRAMS.find(item=>item.id==='general-8').title;assert.equal(calendarProgramForType('session',normal),normal);assert.throws(()=>calendarProgramForType('session',''));assert.throws(()=>calendarProgramForType('unknown',normal));
 assert.equal(validateSession({name:'Learner',clientId:'one',date:'2026-11-01',time:'18:00',number:1,program:'Assessment',level:'Not assessed'}).program,'Assessment');
});
for(const file of ['UnifiedCode.gs','Clients.gs'])test(file+': Assessment is saved and reloaded as a distinct appointment',()=>{
 const f=createBookingFixture(file),owner=data=>f.request({key:'private-test-key',...data});
 const token=f.request({action:'studentBookingLogin',public:true}).token;
 const slot=f.request({action:'studentBookingCalendar',token}).days.flatMap(day=>day.slots).find(item=>item.status==='available');
 const saved=owner({action:'saveSession',session:{clientId:'student-1',number:1,date:slot.date,time:slot.time,program:'Assessment',level:'Not assessed'}});assert.equal(saved.ok,true,saved.error);
 const item=owner({action:'listSessions'}).classes.find(item=>item.program==='Assessment');assert(item);assert.equal(item.level,'Not assessed');
});

test('instructor menu offers exactly two session lengths, one trial and one placement test',async()=>{
 const {INSTRUCTOR_APPOINTMENT_TYPES,appointmentDurationForType}=await import('./session-programs.js');
 assert.deepEqual(INSTRUCTOR_APPOINTMENT_TYPES.map(item=>[item.title,item.duration]),[['Session — 90 minutes',90],['Session — 120 minutes',120],['Trial session — 60 minutes',60],['Placement test — 30 minutes',30]]);
 const normal=SESSION_PROGRAMS.find(item=>item.id==='general-8').title;
 for(const item of INSTRUCTOR_APPOINTMENT_TYPES){const program=calendarProgramForType(item.id,normal);const record=validateSession({name:'Learner',clientId:'one',date:'2026-11-01',time:'18:00',number:1,program,duration:appointmentDurationForType(item.id)});assert.equal(record.duration,item.duration);assert.equal(program,item.id==='trial'?'Trial session':item.id==='assessment'?'Assessment':normal);}
 assert.throws(()=>appointmentDurationForType('session180'));
});
