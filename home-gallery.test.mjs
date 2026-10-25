import {motivationPreviews} from './motivation-preview-images.js';
import test,{beforeEach} from 'node:test';
import {setMotivationSettings} from './motivation-settings.js?v=freeze-24-oct-1';
beforeEach(()=>setMotivationSettings({frozen:false,day:20750,until:'',revision:'test-daily-rotation'}));
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {cairoDayNumber, dailyQuotes, quoteDetails, quoteForDate,motivationShareUrl} from './home-gallery.js';
test('daily motivation changes at Cairo midnight and stays consistent throughout the day', () => {
 const before=new Date('2026-10-18T20:59:59Z'),after=new Date('2026-10-18T21:00:00Z');
 assert.equal(cairoDayNumber(after),cairoDayNumber(before)+1);
 assert.notEqual(quoteForDate(before),quoteForDate(after));
 assert.equal(quoteForDate(after),quoteForDate(new Date('2026-10-19T12:00:00Z')));
 assert.equal(quoteForDate(after),quoteForDate(new Date(after.getTime()+dailyQuotes.length*86400000+3600000)));
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

test('every rotating motivation has its own static picture preview and stable share link',()=>{for(const entry of dailyQuotes){const link=motivationShareUrl(entry),file=new URL('./motivation/'+entry.image.split('/').pop().replace(/\.png$/,'.html'),import.meta.url),html=readFileSync(file,'utf8');assert(link.includes('/motivation/'));assert(!link.includes('#'));assert(html.includes('property="og:image" content="'+new URL(motivationPreviews[entry.image].image,'https://speakboldly.space/').href+'"'));assert(html.includes('summary_large_image'));assert(html.includes('property="og:url" content="'+link+'"'));}});

test('15 October message stays through Sunday and the daily schedule resumes Monday in Cairo',()=>{
 const held=quoteForDate(new Date('2026-10-15T12:00:00Z'));assert.equal(held.image,'./images/daily-motivation-2.png');
 for(const instant of ['2026-10-14T21:00:00Z','2026-10-16T12:00:00Z','2026-10-17T12:00:00Z','2026-10-18T20:59:59Z'])assert.equal(quoteForDate(new Date(instant)),held);
 const earlier=new Date('2026-10-14T20:59:59Z');assert.equal(quoteForDate(earlier),dailyQuotes[cairoDayNumber(earlier)%dailyQuotes.length]);
 const cycle=Array.from({length:dailyQuotes.length},(_,i)=>quoteForDate(new Date(Date.UTC(2026,9,19+i,12))));
 assert.equal(new Set(cycle).size,dailyQuotes.length);assert.notDeepEqual(cycle,dailyQuotes);assert.notEqual(cycle[0],held);
 for(const entry of dailyQuotes)assert.ok(cycle.includes(entry));

});
