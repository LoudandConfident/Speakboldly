import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,progress,matches} from './courses.js';
test('progress reflects completed lessons and ignores invalid or duplicate entries',()=>{assert.equal(progress(courses[0]),0);assert.equal(progress(courses[0],[0,1]),50);assert.equal(progress(courses[0],[0,0,99]),25);assert.equal(progress(courses[0],[0,1,2,3]),100);});
test('catalog searches title, category and mentor with category constraints',()=>{assert.equal(matches(courses[0],'All courses',' SARAH '),true);assert.equal(matches(courses[0],'Grammar','speaking'),false);assert.equal(matches(courses[1],'Grammar','grammar'),true);assert.equal(matches(courses[1],'All courses','unavailable'),false);});
test('each course has a unique identity and a usable curriculum',()=>{assert.equal(new Set(courses.map(c=>c.id)).size,courses.length);for(const c of courses){assert.ok(c.lessons.length);assert.ok(c.teacher);assert.ok(c.lessons.every(l=>typeof l==='string'&&l.length>0));}});
