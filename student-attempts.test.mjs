import test from 'node:test';import assert from 'node:assert/strict';import {takeStudentAttempt,cairoDay} from './student-attempts.js';
test('student code entry allows three attempts and resets at Cairo midnight',()=>{
 const values=new Map(),storage={getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v)};
 const before=new Date('2026-10-08T20:59:00Z'),after=new Date('2026-10-08T21:00:00Z');
 assert.equal(cairoDay(before),'2026-10-08');assert.equal(cairoDay(after),'2026-10-09');
 assert.equal(takeStudentAttempt(storage,before),2);assert.equal(takeStudentAttempt(storage,before),1);assert.equal(takeStudentAttempt(storage,before),0);
 assert.throws(()=>takeStudentAttempt(storage,before),/three code attempts/);
 assert.equal(takeStudentAttempt(storage,after),2);
});
