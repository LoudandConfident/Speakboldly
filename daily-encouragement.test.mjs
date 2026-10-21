import test from 'node:test';import assert from 'node:assert/strict';import {encouragementForDate} from './daily-encouragement.js';import {courses} from './courses.js';
test('daily encouragement changes by Cairo date and stays consistent within the day',()=>{
 const first=encouragementForDate(new Date('2026-10-21T08:00:00Z'));assert.deepEqual(first,encouragementForDate(new Date('2026-10-21T18:00:00Z')));assert.notDeepEqual(first,encouragementForDate(new Date('2026-10-22T08:00:00Z')));
});
test('new courses have requested lengths and stay tuned state',()=>{
 for(const [id,duration]of [['write-boldly','4 sessions'],['reclaim-focus','8 sessions']]){const course=courses.find(c=>c.id===id);assert.equal(course.duration,duration);assert.equal(course.comingSoon,true);assert.equal(course.dimmed,true);assert.equal(course.price,undefined);}
 assert.equal(courses.find(c=>c.id==='reclaim-focus').category,'Others');assert.equal(courses.find(c=>c.id==='pronunciation').title,'Pronunciation workshop');
});
