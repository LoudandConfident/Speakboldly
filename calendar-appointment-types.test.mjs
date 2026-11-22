import test from 'node:test';
import assert from 'node:assert/strict';
import {SESSION_TYPES,CLIENT_PROGRAMS,SESSION_PROGRAMS,calendarProgramForType} from './session-programs.js';
import {validateSession} from './admin-calendar.js';
import {courses} from './courses.js';
import {createBookingFixture} from './student-booking.test.mjs';
test('appointment choices are separate from course selection and client program filtering',()=>{
 assert.deepEqual(SESSION_TYPES.map(item=>item.title),['Session','Workshop','Placement test']);
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

test('instructor appointments use a session range, one-hour workshops and half-hour placement tests',async()=>{
 const {INSTRUCTOR_APPOINTMENT_TYPES,appointmentDurationForType,appointmentDurationChoices,isWorkshopProgram}=await import('./session-programs.js');
 assert.deepEqual(INSTRUCTOR_APPOINTMENT_TYPES.map(item=>[item.title,item.duration]),[['Session — 60–90 minutes',90],['Workshop — 60 minutes',60],['Placement test — 30 minutes',30]]);
 const normal=SESSION_PROGRAMS.find(item=>item.id==='general-8').title;
 const workshop=SESSION_PROGRAMS.find(item=>item.id==='write-boldly').title;
 assert(isWorkshopProgram(workshop));assert(!isWorkshopProgram(normal));
 for(const item of INSTRUCTOR_APPOINTMENT_TYPES){const selected=item.id==='workshop'?workshop:normal,program=calendarProgramForType(item.id,selected);const record=validateSession({name:'Learner',clientId:'one',date:'2026-11-01',time:'18:00',number:1,program,duration:appointmentDurationForType(item.id)});assert.equal(record.duration,item.duration);assert.equal(program,item.id==='assessment'?'Assessment':selected);}
 assert.deepEqual(appointmentDurationChoices('session'),[60,90]);assert.deepEqual(appointmentDurationChoices('workshop'),[60]);assert.deepEqual(appointmentDurationChoices('assessment'),[30]);
 assert.throws(()=>calendarProgramForType('session',workshop));assert.throws(()=>calendarProgramForType('workshop',normal));
 for(const course of courses.filter(item=>isWorkshopProgram(item.title)))assert.equal(course.sessionDuration,'60 minutes');
 assert.throws(()=>appointmentDurationForType('session180'));
});
