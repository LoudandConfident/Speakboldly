import {test} from 'node:test';import assert from 'node:assert/strict';import {registrationFixture} from './student-booking.test.mjs';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': English Momentum bookings and hours use 60 minutes',()=>{
 const f=registrationFixture(filename),calendar=f.request({action:'studentBookingCalendar',token:f.token,kind:'session',program:'English Momentum'}),slot=calendar.days.flatMap(d=>d.slots).find(s=>s.status==='available');
 assert.equal(calendar.duration,60);assert.equal(slot.duration,60);assert.equal(Number(slot.endTime.slice(0,2))-Number(slot.time.slice(0,2)),1);
 assert.equal(f.submit({kind:'session',program:'English Momentum',date:slot.date,time:slot.time}).ok,true);
 const result=f.owner({action:'reviewRegistration',requestId:'registration-one',decision:'accept',payment:'Paid',level:'2'});assert.equal(result.ok,true,JSON.stringify(result));
 const session=f.owner({action:'listSessions'}).classes[0];assert.equal(session.duration,60);assert.equal(Date.parse(session.endsAt)-Date.parse(session.startsAt),3600000);
 f.advance(Date.parse(slot.date+'T23:59:00Z')-f.context.Date.now());assert.equal(f.owner({action:'listClients'}).clients.find(c=>c.email==='new@example.com').hours,1);
});
test('make-up sessions are available only for enrolled email addresses and stay 90 minutes',()=>{
 const f=registrationFixture(),slot=f.calendar('session').days.flatMap(d=>d.slots).find(s=>s.status==='available');
 assert.equal(f.submit({kind:'session',program:'Make-up / revision session',date:slot.date,time:slot.time}).ok,false);
 assert.equal(f.submit({kind:'session',name:'Test Student',email:'private@example.com',program:'Make-up / revision session',date:slot.date,time:slot.time}).ok,true);
 assert.equal(f.owner({action:'reviewRegistration',requestId:'registration-one',decision:'accept',payment:'Paid',level:'2'}).ok,true);
 const session=f.owner({action:'listSessions'}).classes[0];assert.equal(session.duration,90);assert.equal(session.program,'Make-up / revision session');
});
