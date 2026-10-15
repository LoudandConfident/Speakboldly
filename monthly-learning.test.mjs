import {test} from 'node:test';import assert from 'node:assert/strict';import {MONTHLY_LEARNING_PAGES,monthlyLearningPage} from './monthly-learning.js';
test('Cairo calendar month, rather than elapsed days or browser timezone, selects the page',()=>{
 const october=monthlyLearningPage(new Date('2026-10-15T10:00:00Z'));
 assert.equal(october.key,'2026-10');assert.equal(october.title,'Learning multiple languages');
 assert.equal(monthlyLearningPage(new Date('2026-10-31T21:59:59Z')).url,october.url);
 const november=monthlyLearningPage(new Date('2026-10-31T22:00:00Z'));assert.equal(november.key,'2026-11');assert.notEqual(november.url,october.url);
 assert.equal(november.source,'TED Talks');
 const december=monthlyLearningPage(new Date('2026-12-01T10:00:00Z'));assert.equal(december.source,'VOA Learning English');assert.match(december.brief,/Consider yourself a toddler and listen as you go to bed/);
 const january=monthlyLearningPage(new Date('2026-12-31T22:00:00Z'));assert.equal(january.key,'2027-01');assert.equal(january.source,'British Council LearnEnglish');
});
test('twelve different pages include BBC first, mixed sources, and an original brief for every month',()=>{
 assert.equal(MONTHLY_LEARNING_PAGES.length,12);assert.equal(new Set(MONTHLY_LEARNING_PAGES.map(p=>p.url)).size,12);
 assert.equal(MONTHLY_LEARNING_PAGES[0].source,'BBC Learning English');assert.equal(MONTHLY_LEARNING_PAGES.filter(p=>p.source==='BBC Learning English').length,1);
 for(const page of MONTHLY_LEARNING_PAGES){assert.equal(new URL(page.url).protocol,'https:');assert(page.brief.length>60);assert(page.source.length>0);}
 assert.equal(monthlyLearningPage(new Date('2027-10-15T10:00:00Z')).url,monthlyLearningPage(new Date('2026-10-15T10:00:00Z')).url);
 assert.notEqual(monthlyLearningPage(new Date('2027-09-15T10:00:00Z')).url,monthlyLearningPage(new Date('2027-10-15T10:00:00Z')).url);
});
