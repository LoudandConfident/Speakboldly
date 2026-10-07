import test from 'node:test';import assert from 'node:assert/strict';import * as config from './portal-config.js';
test('portal configuration has no shared or daily Student Code',()=>{assert.ok(!('STUDENT_CODE' in config));assert.ok(!('DAILY_STUDENT_CODES' in config));assert.deepEqual(Object.keys(config.portalResources),['exercises','exams','reports','material','final','listening']);});
