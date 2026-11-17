import {motivationPreviews} from './motivation-preview-images.js';
import test,{beforeEach} from 'node:test';
import {setMotivationSettings} from './motivation-settings.js';
beforeEach(()=>setMotivationSettings({frozen:false,day:20750,until:'',revision:'test-daily-rotation'}));
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {cairoDayNumber, dailyQuotes, quoteDetails, quoteForDate,motivationShareUrl} from './home-gallery.js';
test('weekly motivation changes at Monday midnight in Cairo and stays consistent throughout the week', () => {
 const before=new Date('2026-11-22T21:59:59Z'),after=new Date('2026-11-22T22:00:00Z');
 assert.equal(cairoDayNumber(after),cairoDayNumber(before)+1);
 assert.notEqual(quoteForDate(before),quoteForDate(after));
 assert.equal(quoteForDate(after),quoteForDate(new Date('2026-11-29T12:00:00Z')));
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

test('every rotating motivation has its own static picture preview and stable share link',()=>{for(const entry of dailyQuotes){const link=motivationShareUrl(entry),file=new URL('./motivation/'+entry.image.split('/').pop().replace(/\.(?:png|webp)$/,'.html'),import.meta.url),html=readFileSync(file,'utf8');assert(link.includes('/motivation/'));assert(!link.includes('#'));assert(html.includes('property="og:image" content="'+new URL(motivationPreviews[entry.image].image,'https://speakboldly.space/').href+'"'));assert(html.includes('summary_large_image'));assert(html.includes('property="og:url" content="'+link+'"'));}});

test('automatic weekly rotation shows the requested fourth message and preserves a complete shuffled cycle',()=>{
 const current=quoteForDate(new Date('2026-11-17T12:00:00Z'));assert.equal(current.image,'./images/daily-motivation-keep-going-clean.png');
 const available=dailyQuotes.filter(entry=>!entry.image.endsWith('small-steps-teacher.webp')&&!entry.image.endsWith('math-teacher-board.webp'));
 const cycle=Array.from({length:available.length},(_,i)=>quoteForDate(new Date(Date.UTC(2026,10,23+7*i,12))));
 assert.equal(new Set(cycle).size,available.length);assert.notDeepEqual(cycle,available);
 for(const entry of available)assert.ok(cycle.includes(entry));
});
