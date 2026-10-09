export const ASSESSMENT_DURATION_MS = 20 * 60 * 1000;
// Midnight on 1 January 2027 in Cairo (UTC+2).
export const OFFER_EXPIRY = Date.parse('2027-01-01T00:00:00+02:00');
export function offerIsActive(now = Date.now()) { return now < OFFER_EXPIRY; }
export function remainingSeconds(deadline, now = Date.now()) {
 return Math.max(0, Math.ceil((deadline - now) / 1000));
}
export function formatTime(seconds) {
 return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
}
