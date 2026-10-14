import test from 'node:test';import assert from 'node:assert/strict';
import {sessionInitials,validateSession,cairoToday,calendarSlots,orderedCalendarSlots} from './admin-calendar.js';
test('recurring slots use evening weekdays and daytime Saturdays across months',()=>{
 for(const date of ['2026-10-13','2026-10-14','2026-10-15','2026-11-03'])assert.deepEqual(calendarSlots(date),[{time:'18:00',label:'6–7:30pm'},{time:'19:30',label:'7:30–9pm'}]);
 assert.deepEqual(calendarSlots('2026-10-17'),[{time:'10:00',label:'10–11:30am'},{time:'11:30',label:'11:30am–1pm'}]);
 for(const date of ['2026-10-12','2026-10-16','2026-10-18'])assert.deepEqual(calendarSlots(date),[]);
});
test('calendar derives initials and handles Cairo date boundaries',()=>{
 assert.equal(sessionInitials(' Mira   Saleh '),'MS');assert.equal(sessionInitials('ميرا ناصر'),'من');
 assert.equal(cairoToday(new Date('2026-10-07T22:30:00Z')),'2026-10-08');
});
test('sessions retain client identity and reject invalid dates and numbers',()=>{
 const valid={name:'Mira Saleh',date:'2028-02-29',number:'2',clientId:'client-one'};
 assert.deepEqual(validateSession(valid),{...valid,number:2});
 for(const patch of [{date:'2027-02-29'},{date:'2026-02-30'},{number:0},{number:1.5},{name:''},{clientId:''}])assert.throws(()=>validateSession({...valid,...patch}));
});

test('calendar preserves class time and rejects invalid times',()=>{
 const valid={name:'Mira',date:'2028-01-15',time:'14:30',number:2,clientId:'one'};
 assert.deepEqual(validateSession(valid),valid);
 for(const time of ['25:00','12:60','2:30','bad'])assert.throws(()=>validateSession({...valid,time}));
});

test('manual appointments appear in time order between regular slots',()=>{
 const date='2026-10-13',items=['21:00','17:00','18:15','18:00'].map(time=>({date,time}));items.push({date,time:'16:00',reminderStatus:'cancelled'},{date:'2026-10-14',time:'15:00'});
 assert.deepEqual(orderedCalendarSlots(date,items).map(slot=>slot.time),['17:00','18:00','18:15','19:30','21:00']);
 assert.deepEqual(orderedCalendarSlots('2026-10-12',[{date:'2026-10-12',time:'14:00'},{date:'2026-10-12',time:'09:00'}]).map(slot=>slot.time),['09:00','14:00']);
});
