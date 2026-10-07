import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,TEST_VERSION} from './placement-questions.js';
import {answerKey,scoreAnswers} from './placement-scoring.js';
const answersFor=score=>Object.fromEntries(answerKey.map((answer,i)=>['q'+(i+1),String(i<score?answer:(answer+1)%4)]));
test('60 Language Hub questions retain source identifiers and four choices',()=>{
 assert.equal(TEST_VERSION,'language-hub-60-v1');assert.equal(questions.length,60);assert.equal(answerKey.length,60);
 assert.deepEqual(questions.map(q=>q.number),Array.from({length:60},(_,i)=>i+1));
 assert.equal(new Set(questions.map(q=>q.sourceNumber)).size,60);
 for(const q of questions){assert.ok(q.question.includes('_____'));assert.equal(q.options.length,4);assert.ok(q.options.every(o=>typeof o==='string'&&o.length));}
 assert.deepEqual(questions.filter(q=>q.sourceNumber>=63).map(q=>q.sourceNumber),[63,64,65,66,67,68,69,70]);
});
test('official selected answer key scores perfect, wrong, partial and unanswered attempts',()=>{
 assert.deepEqual(scoreAnswers({}),{score:0,total:60,answered:0,percentage:0,level:'Below A1'});
 assert.equal(scoreAnswers(answersFor(60)).score,60);assert.equal(scoreAnswers(answersFor(0)).score,0);
 assert.deepEqual(scoreAnswers({q1:String(answerKey[0])}),{score:1,total:60,answered:1,percentage:2,level:'Below A1'});
 assert.equal(answerKey[0],0);assert.equal(answerKey[59],3);
});
test('estimated range boundaries are consistent and invalid choices fail',()=>{
 for(const [score,level]of [[0,'Below A1'],[11,'Below A1'],[12,'A1–A2'],[23,'A1–A2'],[24,'A2–B1'],[35,'A2–B1'],[36,'B1–B2'],[47,'B1–B2'],[48,'B2–C1'],[60,'B2–C1']])assert.equal(scoreAnswers(answersFor(score)).level,level);
 for(const value of ['x','4',-1,true,{},' '])assert.throws(()=>scoreAnswers({q1:value}));
});
