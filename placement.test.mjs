import test from 'node:test';
import assert from 'node:assert/strict';
import { questions } from './placement-questions.js';
test('placement test has exactly 50 consecutively numbered questions', () => {
 assert.equal(questions.length,50);
 assert.deepEqual(questions.map(q=>q.number),Array.from({length:50},(_,i)=>i+1));
 assert.equal(new Set(questions.map(q=>q.question)).size,50);
});
test('placement questions retain answer choices and cover early and advanced material', () => {
 for(const q of questions){ assert.ok(q.question.includes('_____')); assert.ok([3,4].includes(q.options.length)); assert.ok(q.options.every(o=>typeof o==='string'&&o.length>0)); }
 assert.equal(questions[0].question,'_____ name is Robert.');
 assert.equal(questions[49].question,'They _____ heard us coming, we were making a lot of noise.');
});
