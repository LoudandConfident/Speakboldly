import {test} from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import vm from 'node:vm';
import {createBookingFixture} from './student-booking.test.mjs';
for(const file of ['UnifiedCode.gs','Clients.gs'])test(file+': private read-only calendar link, Cairo times, cancellations and no score or key leakage',()=>{
 const f=createBookingFixture(file);if(file==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/PersonalCalendar.gs',import.meta.url),'utf8'),f.context);
 assert.equal(f.request({action:'personalCalendarSettings'}).ok,false);
 const settings=f.request({key:'private-test-key',action:'personalCalendarSettings'});assert.equal(settings.ok,true);assert(settings.token.length>=64);assert.equal(f.request({key:'private-test-key',action:'personalCalendarSettings'}).token,settings.token);
 const sessions=f.sheets.get('Sessions');sessions.rows.push(['sync-one','student-1',5,'2026-10-14','18:00','','','','','','General English — 8 sessions','2'],['cancel-one','student-1',6,'2026-11-03','18:00','','','cancelled','','','General English — 8 sessions','2'],['orphan','deleted-client',1,'2026-10-14','18:00']);
 f.context.ContentService.MimeType.ICAL='ical';f.context.ContentService.MimeType.TEXT='text';f.context.ContentService.createTextOutput=value=>({setMimeType:mime=>mime==='json'?JSON.parse(value):{text:value,mime}});
 assert.equal(f.context.doGet({parameter:{calendarFeed:'wrong'}}).mime,'text');
 const feed=f.context.doGet({parameter:{calendarFeed:settings.token}});assert.equal(feed.mime,'ical');const text=feed.text.replace(/\r\n /g,'');
 assert.match(text,/UID:sync-one@speakboldly/);assert.match(text,/DTSTART:20261014T150000Z/);assert.match(text,/DTEND:20261014T163000Z/);assert.match(text,/DTSTART:20261103T160000Z/);assert.match(text,/STATUS:CANCELLED\r\nTRANSP:TRANSPARENT/);assert.doesNotMatch(text,/orphan|private-test-key|private@example.com|score|feedback/i);
 for(const line of feed.text.split('\r\n'))assert(Buffer.byteLength(line)<=75);
 const reset=f.request({key:'private-test-key',action:'resetPersonalCalendarLink'});assert.notEqual(reset.token,settings.token);assert.equal(f.context.doGet({parameter:{calendarFeed:settings.token}}).mime,'text');assert.equal(f.context.doGet({parameter:{calendarFeed:reset.token}}).mime,'ical');assert.equal(f.emails.length,0);
});
