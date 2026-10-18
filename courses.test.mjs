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
 const packages=courses.filter(c=>['general-8','general-4'].includes(c.id));assert.equal(packages.length,2);
 assert.deepEqual(packages.map(c=>c.id),['general-8','general-4']);
 for(const [i,count] of [8,4].entries()){assert.equal(packages[i].duration,count+' sessions per month');assert.equal(packages[i].priceOptions.length,1);assert(packages[i].priceOptions[0].schedule.startsWith(count+' sessions'));}
 assert.equal(packages[0].priceOptions[0].amount,3000);assert.equal(packages[1].priceOptions[0].amount,2000);
});

test('public program order omits One Session and keeps the other available programs',()=>{
 assert.deepEqual(courses.filter(c=>matches(c,'All courses','')).slice(0,5).map(c=>c.id),['general-8','general-4','english-momentum','make-up-revision','interview']);
 const interview=courses.find(c=>c.id==='interview');assert(!interview.comingSoon&&!interview.dimmed);
 const writing=courses.find(c=>c.id==='writing');assert(!writing.dimmed);assert(!courses.find(c=>c.id==='urgent-session').comingSoon);assert(!writing.comingSoon);assert.equal(writing.price,1500);
});


test('One Session is absent from public category and search results while make-up sessions remain available',()=>{const one=courses.find(c=>c.id==='urgent-session');assert(one);for(const category of ['All courses','Session'])for(const query of ['', 'One Session'])assert.equal(matches(one,category,query),false);assert(matches(courses.find(c=>c.id==='make-up-revision'),'Session',''));});
