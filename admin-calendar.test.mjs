import test from 'node:test';import assert from 'node:assert/strict';
import {sessionInitials,validateSession,cairoToday} from './admin-calendar.js';
test('calendar derives initials and handles Cairo date boundaries',()=>{
 assert.equal(sessionInitials(' Mira   Saleh '),'MS');assert.equal(sessionInitials('ميرا ناصر'),'من');
 assert.equal(cairoToday(new Date('2026-10-07T22:30:00Z')),'2026-10-08');
});
test('sessions retain client identity and reject invalid dates and numbers',()=>{
 const valid={name:'Mira Saleh',date:'2028-02-29',number:'2',clientId:'client-one'};
 assert.deepEqual(validateSession(valid),{...valid,number:2});
 for(const patch of [{date:'2027-02-29'},{date:'2026-02-30'},{number:0},{number:1.5},{name:''},{clientId:''}])assert.throws(()=>validateSession({...valid,...patch}));
});
