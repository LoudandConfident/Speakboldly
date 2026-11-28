import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,matches,compareCatalogCourses} from './courses.js';
test('catalog search respects categories, case and whitespace',()=>{
 const general=courses.find(c=>c.id==='general-8');assert.equal(matches(general,'All courses',' GENERAL '),true);assert.equal(matches(general,'All courses','8 sessions'),false);
 assert.equal(matches(courses[0],'IELTS','general'),false);
 const workshop=courses.find(c=>c.category==='Workshops');assert.ok(workshop);assert.equal(matches(workshop,'Workshops',workshop.title),true);
 assert.equal(matches(courses[0],'All courses','unavailable'),false);
});
test('published courses have unique identities and usable coaching topics',()=>{
 assert.equal(new Set(courses.map(c=>c.id)).size,courses.length);
 for(const c of courses){assert.ok(c.title&&c.description&&c.level&&c.duration);assert.ok(c.topics.length);assert.ok(c.topics.every(t=>typeof t==='string'&&t.length));}
});


test('public program order omits One Session and keeps the other available programs',()=>{
 assert.deepEqual(courses.filter(c=>matches(c,'All courses','')).sort(compareCatalogCourses).slice(0,5).map(c=>c.id),['general-8','english-momentum','write-boldly','interview','writing']);
 const interview=courses.find(c=>c.id==='interview');assert(!interview.comingSoon&&!interview.dimmed);
 const writing=courses.find(c=>c.id==='writing');assert(!writing.dimmed);assert(!courses.find(c=>c.id==='urgent-session').comingSoon);assert(!writing.comingSoon);assert.equal(writing.price,2000);
});


test('One Session is absent from public category and search results and make-up sessions stay hidden',()=>{const one=courses.find(c=>c.id==='urgent-session');assert(one);for(const category of ['All courses','Session'])for(const query of ['', 'One Session'])assert.equal(matches(one,category,query),false);assert.equal(matches(courses.find(c=>c.id==='make-up-revision'),'Session',''),false);});
