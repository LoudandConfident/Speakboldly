import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
const fixture=()=>createSheetExamFixture(process.env.SB_TEST_SCRIPT||'UnifiedCode.gs');
test('December 2026 closure applies without an availability sheet and preserves other months',()=>{
 const f=fixture(),dates=f.context.sbCalendarAvailability({getSheetByName:()=>null});assert.equal(dates.length,31);assert(dates.every(date=>date.startsWith('2026-12-')));assert(f.context.sbCalendarDateBlocked('2026-12-01'));assert(f.context.sbCalendarDateBlocked('2026-12-31'));assert(!f.context.sbCalendarDateBlocked('2027-12-01'));assert(!f.context.sbCalendarDateBlocked('2026-11-30'));
});
test('December calendar has no available dates and rejects reopening',()=>{
 const f=fixture();f.context.setupStudentPortal();const target=Date.parse('2026-11-20T10:00:00Z');f.advance(target-f.context.Date.now());const book={getSheetByName:name=>f.sheets.get(name)};
 const result=f.context.sbRegistrationCalendar({kind:'placement',month:'2026-12'},book);assert.equal(result.days.length,31);assert(result.days.every(day=>!day.available));assert(result.days.every(day=>day.slots.every(slot=>slot.status!=='available')));assert.throws(()=>f.context.sbSaveCalendarDay(book,{date:'2026-12-15',available:true}),/December 2026 is closed/);assert.equal(f.emails.length,0);
});
