import test from 'node:test';import assert from 'node:assert/strict';
import {DAILY_STUDENT_CODES,getStudentCode} from './portal-config.js';
test('daily code calendar covers all month-days with unique four-digit codes',()=>{
 assert.equal(Object.keys(DAILY_STUDENT_CODES).length,366);assert.equal(new Set(Object.values(DAILY_STUDENT_CODES)).size,366);
 for(let i=0;i<366;i++){const d=new Date(Date.UTC(2024,0,i+1,12));const key=d.toISOString().slice(5,10);assert.match(DAILY_STUDENT_CODES[key],/^\d{4}$/);}
 assert.equal(DAILY_STUDENT_CODES['10-07'],'1962');assert.ok(DAILY_STUDENT_CODES['02-29']);
});
test('code switches at Cairo midnight regardless of visitor timezone',()=>{
 assert.equal(getStudentCode(new Date('2026-10-07T20:59:59Z')),DAILY_STUDENT_CODES['10-07']);
 assert.equal(getStudentCode(new Date('2026-10-07T21:00:00Z')),DAILY_STUDENT_CODES['10-08']);
 assert.equal(getStudentCode(new Date('2026-12-31T22:00:00Z')),DAILY_STUDENT_CODES['01-01']);
 assert.equal(getStudentCode(new Date('2028-02-29T12:00:00Z')),DAILY_STUDENT_CODES['02-29']);
});
