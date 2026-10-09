import test from 'node:test';
import assert from 'node:assert/strict';
import {ASSESSMENT_DURATION_MS, OFFER_EXPIRY, offerIsActive, remainingSeconds, formatTime} from './assessment-time.js';
test('20-minute deadline uses elapsed time even after a suspended tab resumes', () => {
 const start = 1000, deadline = start + ASSESSMENT_DURATION_MS;
 assert.equal(formatTime(remainingSeconds(deadline, start)), '20:00');
 assert.equal(formatTime(remainingSeconds(deadline, deadline - 59000)), '0:59');
 assert.equal(remainingSeconds(deadline, deadline), 0);
 assert.equal(remainingSeconds(deadline, deadline + 300000), 0);
});
test('2026 offer expires at the start of 2027 in Cairo', () => {
 assert.equal(offerIsActive(OFFER_EXPIRY - 1), true);
 assert.equal(offerIsActive(OFFER_EXPIRY), false);
 assert.equal(offerIsActive(Date.parse('2027-01-01T00:00:00Z')), false);
});
