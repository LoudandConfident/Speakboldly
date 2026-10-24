import test from 'node:test';
import assert from 'node:assert/strict';
import {questions,TEST_VERSION,QUESTION_ORDER} from './placement-questions.js';
import {answerKey,scoreAnswers,placementCorrections} from './placement-scoring.js';
const answersFor=score=>Object.fromEntries(answerKey.map((answer,i)=>['q'+(i+1),String(i<score?answer:(answer+1)%4)]));
test('50 original placement questions balance vocabulary and grammar with unique answers',()=>{
 assert.equal(TEST_VERSION,'speak-boldly-balanced-50-v4');assert.equal(questions.length,50);assert.equal(answerKey.length,50);
 assert.deepEqual(questions.map(q=>q.number),Array.from({length:50},(_,i)=>i+1));
 assert.equal(new Set(questions.map(q=>q.id)).size,50);assert.equal(new Set(questions.map(q=>q.question)).size,50);
 for(const q of questions){assert.ok(q.question.includes('_____'));assert.equal(q.options.length,4);assert.equal(new Set(q.options).size,4);assert.ok(q.options.every(o=>typeof o==='string'&&o.length));assert(Number.isInteger(answerKey[q.number-1]));assert(q.options[answerKey[q.number-1]]);}
 for(const skill of ['grammar','vocabulary'])assert.equal(questions.filter(q=>q.skill===skill).length,25);
 assert.equal(questions.filter(q=>q.focus==='past perfect').length,1);
 for(const focus of ['everyday objects','phrasal verbs','word formation','collocations','precision and nuance','present simple questions'])assert(questions.some(q=>q.focus===focus));
});
test('every page mixes difficulty while covering both grammar and vocabulary',()=>{
 assert.equal(QUESTION_ORDER,'mixed');
 for(let i=0;i<50;i+=10){const page=questions.slice(i,i+10);for(const band of ['A1','A2','B1','B2','C1'])assert.equal(page.filter(q=>q.difficulty===band).length,2);for(const skill of ['grammar','vocabulary'])assert.equal(page.filter(q=>q.skill===skill).length,5);assert(page.some((q,j)=>j&&['A1','A2','B1','B2','C1'].indexOf(q.difficulty)<['A1','A2','B1','B2','C1'].indexOf(page[j-1].difficulty)));}
});
test('matching answer key scores perfect, wrong, partial and unanswered attempts',()=>{
 assert.deepEqual(scoreAnswers({}),{score:0,total:50,answered:0,percentage:0,level:'Below A1'});
 assert.equal(scoreAnswers(answersFor(50)).score,50);assert.equal(scoreAnswers(answersFor(0)).score,0);
 assert.deepEqual(scoreAnswers({q1:String(answerKey[0])}),{score:1,total:50,answered:1,percentage:2,level:'Below A1'});
 const lookup=focus=>questions.find(q=>q.focus===focus);for(const [focus,expected]of [['everyday objects','notebook'],['past perfect','had'],['formal passive reporting','to have been lost']]){const q=lookup(focus);assert.equal(q.options[answerKey[q.number-1]],expected);}
});
test('estimated range boundaries are consistent and invalid choices fail',()=>{
 for(const [score,level]of [[0,'Below A1'],[9,'Below A1'],[10,'A1–A2'],[19,'A1–A2'],[20,'A2–B1'],[29,'A2–B1'],[30,'B1–B2'],[39,'B1–B2'],[40,'B2–C1'],[50,'B2–C1']])assert.equal(scoreAnswers(answersFor(score)).level,level);
 for(const value of ['x','4',-1,true,{},' '])assert.throws(()=>scoreAnswers({q1:value}));
});


test('exactly five challenge items have stronger grammar and vocabulary with keyed answers',()=>{
 const changed=questions.filter(q=>q.id.startsWith('sb-balanced-v4-'));assert.deepEqual(changed.map(q=>q.number),[10,20,28,30,48]);assert.equal(changed.filter(q=>q.skill==='grammar').length,3);assert.equal(changed.filter(q=>q.skill==='vocabulary').length,2);
 for(const [number,answer]of [[10,'had the auditor presented'],[20,'would not have been disclosed'],[28,'obviate'],[30,'Convincing'],[48,'specious']])assert.equal(questions[number-1].options[answerKey[number-1]],answer);
});
test('answer review lists only wrong or unanswered items with the keyed correct choice',()=>{
 assert.deepEqual(placementCorrections(answersFor(50)),[]);const answers=answersFor(50);answers.q10='0';delete answers.q48;assert.deepEqual(placementCorrections(answers),[{number:10,selected:0,correct:1},{number:48,selected:null,correct:0}]);assert.equal(placementCorrections({}).length,50);assert.throws(()=>placementCorrections({q1:'invalid'}));
});
