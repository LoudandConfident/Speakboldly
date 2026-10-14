import test from 'node:test';
import assert from 'node:assert/strict';
import {LEARNING_HUB_SECTIONS,learningHubItemSection} from './learning-hub-sections.js';
test('the six section names match learner documents and instructor switches',()=>{
 assert.deepEqual(LEARNING_HUB_SECTIONS.map(item=>item.title),['Examinations','Listening','Material','Activities','Contact Instructor','Calendar']);
 assert.equal(learningHubItemSection({section:'exercises',title:'Level 2 — Comprehension'}),'practice');
 assert.equal(learningHubItemSection({section:'levels',title:'Level 2 — Listening'}),'listening');
 assert.equal(learningHubItemSection({section:'levels',title:'Level 2 — Book'}),'material');
 assert.equal(learningHubItemSection({section:'tests',title:'Level 2'}),'exams');
});
