import {test} from 'node:test';import assert from 'node:assert/strict';import {MONTHLY_LEARNING_PAGES,monthlyLearningPage} from './monthly-learning.js';
test('current listening and novel remain frozen until February in Cairo, with manual control available',()=>{
 const current=monthlyLearningPage(new Date('2026-10-27T10:00:00Z'));
 for(const date of ['2026-11-01T10:00:00Z','2026-12-31T22:00:00Z','2027-01-31T21:59:59Z']){
  const page=monthlyLearningPage(new Date(date));assert.equal(page.key,current.key);assert.equal(page.url,current.url);assert.equal(page.novel,current.novel);assert(page.frozen);
 }
 const february=monthlyLearningPage(new Date('2027-01-31T22:00:00Z'));assert.equal(february.key,'2027-02');assert.equal(february.source,'TED Talks');assert.equal(february.novel,1);assert(!february.frozen);
 const manual=monthlyLearningPage(new Date('2026-11-01T10:00:00Z'),{mode:'manual',manualLink:4,manualNovel:8});assert.equal(manual.link,4);assert.equal(manual.novel,8);
});
test('twelve different pages include BBC first, mixed sources, and an original brief for every month',()=>{
 assert.equal(MONTHLY_LEARNING_PAGES.length,12);assert.equal(new Set(MONTHLY_LEARNING_PAGES.map(p=>p.url)).size,12);
 assert.equal(MONTHLY_LEARNING_PAGES[0].source,'BBC Learning English');assert.equal(MONTHLY_LEARNING_PAGES.filter(p=>p.source==='BBC Learning English').length,1);
 for(const page of MONTHLY_LEARNING_PAGES){assert.equal(new URL(page.url).protocol,'https:');assert(page.brief.length>60);assert(page.source.length>0);}
 assert.equal(monthlyLearningPage(new Date('2028-01-15T10:00:00Z')).url,monthlyLearningPage(new Date('2026-10-15T10:00:00Z')).url);
 assert.notEqual(monthlyLearningPage(new Date('2027-09-15T10:00:00Z')).url,monthlyLearningPage(new Date('2027-10-15T10:00:00Z')).url);
});
