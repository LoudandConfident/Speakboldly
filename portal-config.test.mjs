import test from 'node:test';import assert from 'node:assert/strict';import {STUDENT_CODE,getStudentCode} from './portal-config.js';
test('temporary student gate has no daily rotation',()=>{assert.equal(STUDENT_CODE,'1962');assert.equal(getStudentCode(new Date('2026-01-01')),getStudentCode(new Date('2026-12-31')));});
