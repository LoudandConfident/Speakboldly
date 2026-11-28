import test from 'node:test';
import assert from 'node:assert/strict';
import {courses,matches,courseStudyOptions} from './courses.js';
import {bookingProgramLabel} from './booking-program-labels.js';
import {coursePaths} from './public-seo-routes.js';
test('one public General English program prices a complete level and states the curriculum',()=>{
 const visible=courses.filter(c=>['general-8','general-4'].includes(c.id)&&matches(c,'All courses',''));
 assert.equal(visible.length,1);const course=visible[0];assert.equal(course.displayTitle,'General English');assert.equal(course.levelCount,12);assert.equal(course.price,4000);assert.equal(course.priceLabel,'per level');assert.equal(course.priceOptions,undefined);
 assert.equal(course.sessionsPerLevel,course.chaptersPerLevel+course.examSessionsPerLevel);assert.equal(course.sessionsPerLevel,13);
});
test('both schedules cover the same level with honest whole-week durations',()=>{
 const c=courses.find(c=>c.id==='general-8'),options=courseStudyOptions(c);assert.equal(options.length,2);
 const twice=options.find(p=>p.sessionsPerWeek===2),once=options.find(p=>p.sessionsPerWeek===1);assert.equal(twice.weeks,7);assert.match(twice.durationLabel,/About 7 weeks/);assert.equal(once.weeks,13);assert.match(once.durationLabel,/about 3 months/);
 for(const option of options){assert(option.weeks*option.sessionsPerWeek>=c.sessionsPerLevel);assert((option.weeks-1)*option.sessionsPerWeek<c.sessionsPerLevel);assert(courses.some(x=>x.id===option.bookingCourseId));}
});
test('existing calendar identities and old public links remain compatible',()=>{
 const old=courses.find(c=>c.id==='general-4');assert.equal(old.catalogAliasOf,'general-8');assert.equal(old.catalogHidden,true);assert.equal(coursePaths[old.id],coursePaths[old.catalogAliasOf]);
 assert.equal(bookingProgramLabel('General English — 8 sessions'),'General English · twice a week');assert.equal(bookingProgramLabel('General English — 4 sessions'),'General English · once a week');assert.equal(bookingProgramLabel('English Momentum'),'English Momentum');
});
