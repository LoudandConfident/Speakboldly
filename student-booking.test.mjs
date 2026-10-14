import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
export function createBookingFixture(filename='UnifiedCode.gs'){
 const f=createSheetExamFixture(filename);
 if(filename==='Clients.gs')for(const file of ['Sessions.gs','BookingActions.gs'])vm.runInContext(readFileSync(new URL('./google-sheets/clients/'+file,import.meta.url),'utf8'),f.context);
 f.context.setupStudentPortal();return f;
}
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': passcode booking is anonymous, shared, collision-safe, retry-safe and manually confirmed',()=>{
 const f=createBookingFixture(filename),request=f.request;
 const owner=data=>request({key:'private-test-key',...data});
 const settings=owner({action:'bookingSettings'});assert.equal(settings.ok,true);assert.equal(settings.enabled,true);assert(settings.passcode);
 assert.equal(request({action:'bookingSettings'}).ok,false);
 assert.equal(request({action:'studentBookingLogin',passcode:'wrong'}).ok,false);
 const token=request({action:'studentBookingLogin',passcode:settings.passcode}).token;
 assert.equal(request({action:'studentBookingCalendar',token:'forged'}).ok,false);
 const calendar=request({action:'studentBookingCalendar',token});assert.equal(calendar.ok,true);
 for(const secret of ['Test Student','Other Student','private@example.com','student-1',settings.passcode])assert(!JSON.stringify(calendar).includes(secret));
 const slots=calendar.days.flatMap(day=>day.slots).filter(slot=>slot.status==='available');assert(slots.length>=3);
 const selection=[{date:slots[0].date,time:slots[0].time},{date:slots[1].date,time:slots[1].time}];
 const booking={action:'studentBookSlots',token,name:'Test Student',requestId:'request-one',slots:selection};
 const result=request(booking);assert.equal(result.ok,true);assert.equal(result.booked.length,2);assert.equal(f.sheets.get('Sessions').rows.length,3);assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'owner@example.com');
 assert.match(f.emails[0].body,/send class confirmation manually/);
 assert.deepEqual(request(booking).booked,result.booked);assert.equal(f.emails.length,1);assert.equal(f.sheets.get('Sessions').rows.length,3);
 const otherToken=request({action:'studentBookingLogin',passcode:settings.passcode}).token;
 const collision=request({action:'studentBookSlots',token:otherToken,name:'Other Student',requestId:'request-two',slots:[selection[0],{date:slots[2].date,time:slots[2].time}]});assert.equal(collision.ok,false);assert.equal(f.sheets.get('Sessions').rows.length,3);
 const shared=request({action:'studentBookingCalendar',token:otherToken});assert.equal(shared.days.flatMap(day=>day.slots).find(slot=>slot.date===selection[0].date&&slot.time===selection[0].time).status,'taken');
 const instructor=owner({action:'listSessions'});assert.equal(instructor.classes.length,2);assert.equal(instructor.classes[0].clientId,'student-1');
 assert.equal(owner({action:'saveSession',session:{clientId:'student-2',number:1,...selection[0]}}).ok,false);
 const unpaid=f.sheets.get('Clients').rows[2];unpaid[5]='Unpaid';assert.equal(request({action:'studentBookSlots',token:otherToken,name:'Other Student',requestId:'unpaid-request',slots:[{date:slots[2].date,time:slots[2].time}]}).ok,false);unpaid[5]='Paid';
 owner({action:'cancelSession',sessionId:instructor.classes[0].id});assert.equal(request({action:'studentBookingCalendar',token}).days.flatMap(day=>day.slots).find(slot=>slot.date===selection[0].date&&slot.time===selection[0].time).status,'available');
 const checks=owner({action:'checkStudentPortal'});assert.equal(checks.examsReady,true);assert.equal(checks.bookingReady,true);assert.equal(checks.notificationEmail,'owner@example.com');
 // Passwords rotate automatically, and manual passcode inputs have no effect.
 assert.equal(owner({action:'saveBookingSettings',passcode:'manual-value',enabled:true,notificationEmail:'owner@example.com'}).ok,true);
 assert.equal(owner({action:'bookingSettings'}).passcode,settings.passcode);
 assert.equal(request({action:'studentBookingLogin',passcode:'manual-value'}).ok,false);
 f.advance(32*24*60*60*1000);assert.equal(request({action:'studentBookingCalendar',token}).ok,false);
 const newPasscode=owner({action:'bookingSettings'}).passcode;assert.notEqual(newPasscode,settings.passcode);
 const updated=request({action:'studentBookingLogin',passcode:newPasscode}).token;assert(updated);
 owner({action:'saveBookingSettings',enabled:false,notificationEmail:'owner@example.com'});assert.equal(request({action:'studentBookingCalendar',token:updated}).ok,false);
});
test('an instructor appointment overlapping a recurring slot is shown as taken',()=>{
 const f=createBookingFixture(),request=f.request,settings=request({key:'private-test-key',action:'bookingSettings'}),token=request({action:'studentBookingLogin',passcode:settings.passcode}).token;
 const slots=request({action:'studentBookingCalendar',token}).days.flatMap(day=>day.slots),slot=slots.find(s=>s.status==='available'&&s.time==='18:00');assert(slot);
 assert.equal(request({key:'private-test-key',action:'saveSession',session:{clientId:'student-1',number:1,date:slot.date,time:'18:15'}}).ok,true);
 const occupied=request({action:'studentBookingCalendar',token}).days.find(d=>d.date===slot.date).slots;assert(occupied.every(s=>s.status==='taken'));
});
test('booking retries recover a saved pending request and an email failure does not lose appointments',()=>{
 const f=createBookingFixture(),request=f.request,settings=request({key:'private-test-key',action:'bookingSettings'}),token=request({action:'studentBookingLogin',passcode:settings.passcode}).token;
 const slot=request({action:'studentBookingCalendar',token}).days.flatMap(day=>day.slots).find(s=>s.status==='available');
 f.context.MailApp.sendEmail=()=>{throw new Error('Google mail unavailable');};
 const booking={action:'studentBookSlots',token,name:'Test Student',requestId:'retry-request',slots:[{date:slot.date,time:slot.time}]};
 const result=request(booking);assert.equal(result.ok,true);assert.equal(result.notificationStatus,'failed');assert.equal(f.sheets.get('Sessions').rows.length,2);
 const row=f.sheets.get('Booking requests').rows[1];row[6]='pending';f.sheets.get('Sessions').rows.pop();
 assert.equal(request(booking).ok,true);assert.equal(f.sheets.get('Sessions').rows.length,2);assert.equal(f.sheets.get('Booking requests').rows[1][6],'complete');
});
