import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,TEST_VERSION} from './placement-questions.js';
import {answerKey,scoreAnswers} from './placement-scoring.js';
const answersFor=score=>Object.fromEntries(answerKey.map((answer,i)=>['q'+(i+1),String(i<score?answer:(answer+1)%4)]));
test('50 Language Hub questions retain source identifiers and four choices',()=>{
 assert.equal(TEST_VERSION,'language-hub-50-v1');assert.equal(questions.length,50);assert.equal(answerKey.length,50);
 assert.deepEqual(questions.map(q=>q.number),Array.from({length:50},(_,i)=>i+1));
 assert.equal(new Set(questions.map(q=>q.sourceNumber)).size,50);
 for(const q of questions){assert.ok(q.question.includes('_____'));assert.equal(q.options.length,4);assert.ok(q.options.every(o=>typeof o==='string'&&o.length));}
 assert.deepEqual(questions.slice(0,2).map(q=>q.sourceNumber),[14,15]);
 assert.deepEqual(questions.filter(q=>q.sourceNumber>=63).map(q=>q.sourceNumber),[63,64,65,66,67,68,69,70]);
});
test('official selected answer key scores perfect, wrong, partial and unanswered attempts',()=>{
 assert.deepEqual(scoreAnswers({}),{score:0,total:50,answered:0,percentage:0,level:'Below A1'});
 assert.equal(scoreAnswers(answersFor(50)).score,50);assert.equal(scoreAnswers(answersFor(0)).score,0);
 assert.deepEqual(scoreAnswers({q1:String(answerKey[0])}),{score:1,total:50,answered:1,percentage:2,level:'Below A1'});
 assert.equal(answerKey[0],2);assert.equal(answerKey[49],3);
});
test('estimated range boundaries are consistent and invalid choices fail',()=>{
 for(const [score,level]of [[0,'Below A1'],[9,'Below A1'],[10,'A1–A2'],[19,'A1–A2'],[20,'A2–B1'],[29,'A2–B1'],[30,'B1–B2'],[39,'B1–B2'],[40,'B2–C1'],[50,'B2–C1']])assert.equal(scoreAnswers(answersFor(score)).level,level);
 for(const value of ['x','4',-1,true,{},' '])assert.throws(()=>scoreAnswers({q1:value}));
});
