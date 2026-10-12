import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,matches} from './courses.js';
test('catalog search respects categories, case and whitespace',()=>{
 assert.equal(matches(courses[0],'All courses',' GENERAL '),true);
 assert.equal(matches(courses[0],'IELTS','general'),false);
 const workshop=courses.find(c=>c.category==='Workshops');assert.ok(workshop);assert.equal(matches(workshop,'Workshops',workshop.title),true);
 assert.equal(matches(courses[0],'All courses','unavailable'),false);
});
test('published courses have unique identities and usable coaching topics',()=>{
 assert.equal(new Set(courses.map(c=>c.id)).size,courses.length);
 for(const c of courses){assert.ok(c.title&&c.description&&c.level&&c.duration);assert.ok(c.topics.length);assert.ok(c.topics.every(t=>typeof t==='string'&&t.length));}
});

test('General English has distinct four- and eight-session packages with their own prices',()=>{
 const packages=courses.filter(c=>c.category==='General English');assert.equal(packages.length,2);
 assert.deepEqual(packages.map(c=>c.id),['general-4','general-8']);
 for(const [i,count] of [4,8].entries()){assert.equal(packages[i].duration,count+' sessions per month');assert.equal(packages[i].priceOptions.length,1);assert(packages[i].priceOptions[0].schedule.startsWith(count+' sessions'));}
 assert.equal(packages[0].priceOptions[0].amount,2000);assert.equal(packages[1].priceOptions[0].amount,3000);
});
