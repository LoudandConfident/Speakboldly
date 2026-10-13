import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {cairoDayNumber, dailyQuotes, quoteDetails, quoteForDate,motivationShareUrl} from './home-gallery.js';
test('daily motivation changes at Cairo midnight and stays consistent for each day', () => {
 const before = new Date('2026-10-09T20:59:59Z');
 const after = new Date('2026-10-09T21:00:00Z');
 assert.equal(cairoDayNumber(after), cairoDayNumber(before) + 1);
 assert.notEqual(quoteForDate(before), quoteForDate(after));
 assert.equal(quoteForDate(after), quoteForDate(new Date('2026-10-10T12:00:00Z')));
 assert.equal(quoteForDate(after), quoteForDate(new Date(after.getTime() + dailyQuotes.length * 86400000)));
});

test('every daily picture has supporting content and an existing image', () => {
 assert.equal(dailyQuotes.length, quoteDetails.length);
 for (const [index,entry] of dailyQuotes.entries()) {
  assert.ok(existsSync(new URL(entry.image, import.meta.url)));
  assert.ok(entry.quote && entry.alt);
  assert.ok(quoteDetails[index].reflection);
  assert.ok(Array.isArray(quoteDetails[index].support));
 }
});

test('every rotating motivation has its own static picture preview and stable share link',()=>{for(const entry of dailyQuotes){const link=motivationShareUrl(entry),file=new URL('./motivation/'+entry.image.split('/').pop().replace(/\.png$/,'.html'),import.meta.url),html=readFileSync(file,'utf8');assert(link.includes('/motivation/'));assert(!link.includes('#'));assert(html.includes('property="og:image" content="'+new URL(entry.image,'https://loudandconfident.github.io/Speakboldly/').href+'"'));assert(html.includes('summary_large_image'));assert(html.includes('property="og:url" content="'+link+'"'));}});
