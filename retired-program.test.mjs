import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
import {courses,matches} from './courses.js';import {MATERIAL_PROGRAM_FOLDERS} from './material-program-folders.js';import {coursePaths} from './public-seo-routes.js';
test('IT program is absent from public catalog, generated pages and material folder choices',()=>{
 const course=courses.find(c=>c.id==='information-technology');assert(course,'historical session references still resolve');assert(!matches(course,'All courses',''));assert(!matches(course,'Others','information technology'));assert(!MATERIAL_PROGRAM_FOLDERS.some(f=>f.id===course.id));assert.equal(coursePaths[course.id],undefined);assert(!readFileSync('programs/index.html','utf8').includes('English for Information Technology'));assert(!existsSync('programs/english-for-it/index.html'));
});
