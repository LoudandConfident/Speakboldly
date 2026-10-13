import {test} from 'node:test';
import assert from 'node:assert/strict';
import {portalAttemptState,recordWrongPassword,assertPortalAllowed,PORTAL_ATTEMPT_KEY,resetPortalAttempts} from './student-portal-attempts.js';

test('shared wrong-password limit persists and expires at Cairo midnight',()=>{
 const data=new Map([['saved-files','kept']]),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)},now=new Date('2026-10-13T10:00:00Z');
 assert.equal(portalAttemptState(storage,now).used,0);
 assert.equal(recordWrongPassword(storage,now),2);
 assert.equal(recordWrongPassword(storage,now),1);
 assert.equal(recordWrongPassword(storage,now),0);
 assert.throws(()=>assertPortalAllowed(storage,now),/locked/);
 assert.throws(()=>recordWrongPassword(storage,now),/locked/);
 assert.equal(JSON.parse(storage.getItem(PORTAL_ATTEMPT_KEY)).used,3);
 assert.equal(portalAttemptState(storage,new Date('2026-10-13T22:01:00Z')).used,0);
 const events=[];resetPortalAttempts({defaultView:{localStorage:storage,Event,dispatchEvent:event=>events.push(event.type)}});
 assert.equal(portalAttemptState(storage).used,0);
 assert.equal(data.get('saved-files'),'kept');
 assert.deepEqual(events,['student-password-attempts-changed']);
});
