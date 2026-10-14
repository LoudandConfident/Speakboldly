import test from 'node:test';
import assert from 'node:assert/strict';
import {practiceForLevel,learnerCourseGuidance} from './assessment-guidance.js';
import {scoreAnswers,answerKey} from './placement-scoring.js';
import {learnerProfiles} from './learner-profile-data.js';
test('every placement band produces relevant structure, vocabulary, use and independent practice guidance',()=>{
 for(const marks of [0,10,20,30,40,50]){
  const answers=Object.fromEntries(answerKey.map((correct,i)=>['q'+(i+1),i<marks?correct:(correct+1)%4]));
  const guidance=practiceForLevel(scoreAnswers(answers).level);
  for(const key of ['structure','vocabulary','use','routine'])assert(guidance[key]?.length>30);
 }
 assert.notEqual(practiceForLevel('Below A1').structure,practiceForLevel('B2–C1').structure);
 assert.throws(()=>practiceForLevel('C2'));
});
test('every learner preference has course guidance and independent practice',()=>{
 for(const [key,profile] of Object.entries(learnerProfiles)){
  assert(learnerCourseGuidance[key].length>=2);
  assert(profile.tips.length>=2&&profile.routine);
 }
});
