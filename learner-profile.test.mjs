import test from 'node:test';
import assert from 'node:assert/strict';
import {learnerQuestions,scoreLearnerProfile} from './learner-profile-data.js';
const count=learnerQuestions.length;
test('thirty distinct scenarios offer all four preferences with varied option order',()=>{
 assert.equal(count,30);
 assert.equal(new Set(learnerQuestions.map(q=>q.prompt)).size,count);
 learnerQuestions.forEach(q=>{assert.equal(q.options.length,4);assert.equal(new Set(q.options.map(o=>o.profile)).size,4);assert(q.options.every(o=>o.text.trim()));});
 assert.equal(new Set(learnerQuestions.map(q=>q.options[0].profile)).size,4);
});
test('all valid preferences produce the appropriate leading profile',()=>{
 for(const key of ['visual','listening','reflective','practical']){
  const score=scoreLearnerProfile(Array(count).fill(key));
  assert.deepEqual(score.strongest,[key]);assert.equal(score.counts[key],count);
  assert.equal(Object.values(score.counts).reduce((a,b)=>a+b),count);
 }
});
test('two-way and three-way ties stay blended',()=>{
 assert.deepEqual(scoreLearnerProfile([...Array(15).fill('visual'),...Array(15).fill('listening')]).strongest,['visual','listening']);
 assert.deepEqual(scoreLearnerProfile([...Array(10).fill('visual'),...Array(10).fill('reflective'),...Array(10).fill('practical')]).strongest,['visual','reflective','practical']);
});
test('incomplete, old-length and invalid answers cannot produce a result',()=>{
 for(const answers of [[],Array(12).fill('visual'),Array(count).fill('unknown'),Array(count).fill(undefined)])assert.throws(()=>scoreLearnerProfile(answers));
});

test('24 questions cover general learning and exactly six concern English',()=>{
 assert.equal(learnerQuestions.filter(q=>q.scope==='general').length,24);
 assert.equal(learnerQuestions.filter(q=>q.scope==='english').length,6);
 for(const question of learnerQuestions){const text=[question.prompt,...question.options.map(o=>o.text)].join(' ');if(question.scope==='general')assert(!/\b(English|grammar|pronunciation|language)\b/i.test(text));else assert(/\bEnglish\b/.test(question.prompt));}
});
