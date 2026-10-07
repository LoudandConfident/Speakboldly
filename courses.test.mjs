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
