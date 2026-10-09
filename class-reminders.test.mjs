import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {cairoSessionTimestamp,createClassReminders,reminderMessage,createReminderMailer} from './class-reminders.mjs';
function setup(sendEmail){
 const db=new DatabaseSync(':memory:');db.exec('CREATE TABLE clients(id TEXT PRIMARY KEY);INSERT INTO clients VALUES (\'one\')');
 let clock=Date.parse('2026-10-09T10:00:00Z');const client={id:'one',name:'Learner',email:'learner@example.com'};
 const options={db,getClient:id=>id==='one'?client:null,now:()=>clock,sendEmail};
 return{db,options,jobs:createClassReminders(options),setNow:value=>clock=value};
}
const booking={clientId:'one',number:2,date:'2026-10-11',time:'15:00'};
test('Cairo class times follow daylight saving and reject skipped/repeated times',()=>{
 assert.equal(new Date(cairoSessionTimestamp('2026-10-11','15:00')).toISOString(),'2026-10-11T12:00:00.000Z');
 assert.equal(new Date(cairoSessionTimestamp('2026-12-11','15:00')).toISOString(),'2026-12-11T13:00:00.000Z');
 assert.throws(()=>cairoSessionTimestamp('2026-04-24','00:30'));
 assert.throws(()=>cairoSessionTimestamp('2026-10-29','23:30'));
 assert.throws(()=>cairoSessionTimestamp('2026-10-11','25:00'));
});
test('reminder contains session details, Zoom credentials, and cancellation policy',()=>{
 const message=reminderMessage({name:'Learner',number:2,startsAt:cairoSessionTimestamp(booking.date,booking.time),id:'test'});
 for(const value of ['Session number: 2','11 October 2026','3:00 pm','Cairo time','https://us06web.zoom.us/j/79051707388','Passcode: 7P1NpA','No same-day cancellations are allowed.'])assert.ok(message.text.includes(value),value);
 assert.equal(createReminderMailer({}),null);
});
test('reminders wait until 24 hours before class, survive restart, and do not resend',async()=>{
 const sent=[],s=setup(async record=>sent.push(record));try{
 const record=s.jobs.save(booking),due=Date.parse(record.reminderAt);
 s.setNow(due-1);await s.jobs.runDue();assert.equal(sent.length,0);
 s.setNow(due);await s.jobs.runDue();assert.equal(sent.length,1);assert.equal(sent[0].to,'learner@example.com');
 const restarted=createClassReminders(s.options);await restarted.runDue();assert.equal(sent.length,1);assert.equal(restarted.list()[0].reminderStatus,'sent');
 assert.throws(()=>restarted.save(booking));
 }finally{s.db.close();}
});
test('cancelled and past classes never send; late bookings send on the next tick',async()=>{
 const sent=[],s=setup(async record=>sent.push(record));try{
 const cancelled=s.jobs.save(booking);s.jobs.cancel(cancelled.id);s.setNow(Date.parse(cancelled.reminderAt));await s.jobs.runDue();assert.equal(sent.length,0);
 s.jobs.save({...booking,number:3});await s.jobs.runDue();assert.equal(sent.length,1);
 const expired=s.jobs.save({...booking,number:4});s.setNow(cairoSessionTimestamp(booking.date,booking.time));await s.jobs.runDue();assert.equal(sent.length,1);assert.equal(s.jobs.list().find(r=>r.id===expired.id).reminderStatus,'expired');
 }finally{s.db.close();}
});
test('failed delivery retries after five minutes; interrupted delivery is flagged without blind resend',async()=>{
 let calls=0;const s=setup(async()=>{calls++;if(calls===1)throw new Error('SMTP unavailable');});try{
 const record=s.jobs.save(booking),due=Date.parse(record.reminderAt);s.setNow(due);await s.jobs.runDue();assert.equal(s.jobs.list()[0].reminderStatus,'failed');
 await s.jobs.runDue();assert.equal(calls,1);s.setNow(due+5*60000);await s.jobs.runDue();assert.equal(calls,2);assert.equal(s.jobs.list()[0].reminderStatus,'sent');
 const interrupted=s.jobs.save({...booking,number:3});s.db.prepare("UPDATE class_sessions SET status='sending' WHERE id=?").run(interrupted.id);
 const restarted=createClassReminders(s.options);await restarted.runDue();assert.equal(calls,2);assert.equal(restarted.list().find(r=>r.id===interrupted.id).reminderStatus,'delivery_unknown');
 }finally{s.db.close();}
});
test('manual confirmations include future sessions and skip sent, cancelled and past classes',async()=>{
 const sent=[],s=setup(async record=>sent.push(record));try{
  const first=s.jobs.save(booking),cancelled=s.jobs.save({...booking,number:3});s.jobs.cancel(cancelled.id);
  assert.equal(s.jobs.queueUpcoming().queued,1);await s.jobs.runDue();assert.equal(sent.length,1);assert.equal(s.jobs.list().find(r=>r.id===first.id).reminderStatus,'sent');
  assert.equal(s.jobs.queueUpcoming().queued,0);
  const later=s.jobs.save({...booking,number:4});assert.equal(s.jobs.queueUpcoming().queued,1);await s.jobs.runDue();assert.equal(sent.length,2);assert.equal(s.jobs.list().find(r=>r.id===later.id).reminderStatus,'sent');
  s.jobs.save({...booking,number:5});s.setNow(cairoSessionTimestamp(booking.date,booking.time));assert.equal(s.jobs.queueUpcoming().queued,0);
 }finally{s.db.close();}
 const disconnected=setup(null);try{disconnected.jobs.save(booking);assert.throws(()=>disconnected.jobs.queueUpcoming(),/not connected/);}finally{disconnected.db.close();}
});
