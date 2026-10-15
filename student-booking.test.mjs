import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
export function createBookingFixture(filename='UnifiedCode.gs'){
 const f=createSheetExamFixture(filename);
 if(filename==='Clients.gs')for(const file of ['Sessions.gs','BookingActions.gs','RegistrationActions.gs'])vm.runInContext(readFileSync(new URL('./google-sheets/clients/'+file,import.meta.url),'utf8'),f.context);
 f.context.setupStudentPortal();return f;
}
export function registrationFixture(filename='UnifiedCode.gs'){
 const f=createBookingFixture(filename),owner=data=>f.request({key:'private-test-key',...data}),token=f.request({action:'studentBookingLogin',public:true}).token;
 const calendar=(kind='placement',month)=>f.request({action:'studentBookingCalendar',token,kind,...(month?{month}:{})});
 const slot=calendar().days.flatMap(day=>day.slots).find(slot=>slot.status==='available');
 const submit=(extra={})=>f.request({action:'studentRegisterSlot',token,kind:'placement',name:'New Student',email:'new@example.com',program:'General English — 8 sessions',paid:'yes',date:slot.date,time:slot.time,requestId:'registration-one',...extra});
 return {...f,owner,token,calendar,slot,submit};
}
for(const filename of ['UnifiedCode.gs','Clients.gs']){
 test(filename+': registration stays pending, notifies privately, requires owner approval and retries safely',()=>{
  const f=registrationFixture(filename),before=f.sheets.get('Sessions').rows.length;
  assert.equal(f.request({action:'listRegistrationRequests'}).ok,false);
  const result=f.submit();assert.equal(result.ok,true);assert.equal(result.status,'awaiting');assert.equal(f.sheets.get('Sessions').rows.length,before);assert.equal(f.emails.length,1);assert.match(f.emails[0].body,/new@example.com/);assert.match(f.emails[0].body,/Accept:/);assert.match(f.emails[0].body,/Decline:/);assert.match(f.emails[0].body,/30 minutes/);
  assert.equal(f.submit().ok,true);assert.equal(f.submit({requestId:'retry-different-id'}).requestId,result.requestId);assert.equal(f.emails.length,1);
  assert.equal(f.calendar().days.flatMap(d=>d.slots).find(s=>s.date===f.slot.date&&s.time===f.slot.time).status,'available');
  assert(!JSON.stringify(f.calendar()).includes('new@example.com'));assert(!JSON.stringify(f.calendar()).includes('New Student'));
  const accept={action:'reviewRegistration',requestId:result.requestId,decision:'accept',level:'2',payment:'Paid'};
  assert.equal(f.request(accept).ok,false);const saved=f.owner(accept);assert.equal(saved.ok,true,JSON.stringify(saved));assert.equal(saved.request.status,'accepted');assert.equal(f.sheets.get('Sessions').rows.length,before+1);
  assert.equal(f.owner(accept).ok,true);assert.equal(f.sheets.get('Sessions').rows.length,before+1);assert.equal(f.emails.length,1);
  const session=f.owner({action:'listSessions'}).classes[0];assert.equal(session.program,'Assessment');assert.equal(session.duration,30);assert.equal(Date.parse(session.endsAt)-Date.parse(session.startsAt),30*60000);
  const clients=f.owner({action:'listClients'}).clients,client=clients.find(c=>c.email==='new@example.com');assert(client);assert.equal(client.level,'2');assert.equal(client.payment,'Paid');assert.equal(client.program,'General English — 8 sessions');
  assert.equal(f.calendar().days.flatMap(d=>d.slots).find(s=>s.date===f.slot.date&&s.time===f.slot.time).status,'taken');
  assert.equal(f.owner({action:'reviewRegistration',requestId:result.requestId,decision:'decline'}).ok,false);
 });
 test(filename+': placement slots are 30 minutes and accepted appointments use their real durations',()=>{
  const f=registrationFixture(filename),day=f.calendar().days.find(d=>d.slots.filter(s=>s.status==='available').length===6);
  const available=day.slots.filter(s=>s.status==='available');assert.equal(available.length,6);assert(available.every(s=>s.duration===30));assert.equal(Number(available[1].time.slice(3)),30);
  for(const [index,slot]of available.slice(0,2).entries()){assert.equal(f.submit({date:slot.date,time:slot.time,requestId:'adjacent-'+index,email:'adjacent'+index+'@example.com',name:'Adjacent '+index}).ok,true);assert.equal(f.owner({action:'reviewRegistration',requestId:'adjacent-'+index,decision:'accept',payment:'Unpaid',level:'Not assessed'}).ok,true);}
  const current=f.calendar().days.find(d=>d.date===day.date);assert.equal(current.slots[0].status,'taken');assert.equal(current.slots[1].status,'taken');assert.equal(current.slots[2].status,'available');
  assert.equal(f.calendar('session').days.find(d=>d.date===day.date).slots[0].status,'taken');
  const trial=f.calendar('trial').days.flatMap(d=>d.slots).find(s=>s.status==='available');assert.equal(trial.duration,90);
  assert.equal(f.submit({kind:'trial',date:trial.date,time:trial.time,requestId:'trial-one',name:'Trial Student',email:'trial@example.com'}).ok,true);assert.equal(f.owner({action:'reviewRegistration',requestId:'trial-one',decision:'accept',payment:'Unpaid',level:'1'}).ok,true);
  const session=f.owner({action:'listSessions'}).classes.find(c=>c.program==='Trial session');assert.equal(session.duration,90);
 });
}
test('requests can be declined and competing requests cannot double-book a slot',()=>{
 const f=registrationFixture();assert.equal(f.submit().ok,true);assert.equal(f.submit({requestId:'competing',email:'other-new@example.com',name:'Another New Student'}).ok,true);
 assert.equal(f.owner({action:'reviewRegistration',requestId:'registration-one',decision:'accept',payment:'Unpaid',level:'1'}).ok,true);
 assert.equal(f.owner({action:'reviewRegistration',requestId:'competing',decision:'accept',payment:'Paid',level:'2'}).ok,false);
 assert.equal(f.owner({action:'reviewRegistration',requestId:'competing',decision:'decline'}).ok,true);assert.equal(f.owner({action:'reviewRegistration',requestId:'competing',decision:'decline'}).ok,true);assert.equal(f.sheets.get('Sessions').rows.length,2);assert.equal(f.sheets.get('Clients').rows.length,4);
 assert.equal(f.request({action:'studentBookSlots',token:f.token,name:'Test Student',requestId:'old-bypass',slots:[f.slot]}).ok,false);
});
test('a dimmed day and six-week boundary are enforced on submit and acceptance',()=>{
 const f=registrationFixture();f.advance(Date.parse('2026-10-22T08:00:00Z')-f.context.Date.now());const token=f.request({action:'studentBookingLogin',public:true}).token;
 const december=f.request({action:'studentBookingCalendar',token,kind:'placement',month:'2026-12'});assert.equal(december.windowEnd,'2026-12-03');assert(december.days.filter(d=>d.date>'2026-12-03').every(d=>!d.available));
 assert.equal(f.request({action:'studentRegisterSlot',token,kind:'placement',name:'Future',email:'future@example.com',program:'General English — 8 sessions',paid:'no',date:'2026-12-05',time:'10:00',requestId:'out-of-range'}).ok,false);
 const slot=f.request({action:'studentBookingCalendar',token,kind:'placement'}).days.flatMap(d=>d.slots).find(s=>s.status==='available');
 assert.equal(f.request({action:'studentRegisterSlot',token,kind:'placement',name:'Pending',email:'pending@example.com',program:'General English — 8 sessions',paid:'no',date:slot.date,time:slot.time,requestId:'dim-later'}).ok,true);
 assert.equal(f.owner({action:'saveCalendarDay',date:slot.date,available:false}).ok,true);
 assert.equal(f.owner({action:'reviewRegistration',requestId:'dim-later',decision:'accept',payment:'Unpaid',level:'1'}).ok,false);assert.equal(f.sheets.get('Sessions').rows.length,1);
 assert.equal(f.owner({action:'saveCalendarDay',date:slot.date,available:true}).ok,true);assert.equal(f.owner({action:'reviewRegistration',requestId:'dim-later',decision:'accept',payment:'Unpaid',level:'1'}).ok,true);
});
test('a notification failure leaves a request available to review and never creates an appointment',()=>{
 const f=registrationFixture();f.context.MailApp.sendEmail=()=>{throw new Error('Mail disconnected');};const result=f.submit();assert.equal(result.ok,true);assert.equal(result.notificationStatus,'delivery_unknown');assert.equal(f.owner({action:'listRegistrationRequests'}).requests.length,1);assert.equal(f.sheets.get('Sessions').rows.length,1);assert.equal(f.submit().ok,true);assert.equal(f.sheets.get('Registration requests').rows.length,2);
});
test('acceptance recovers a failed session write without duplicating clients or appointments',()=>{
 const f=registrationFixture();assert.equal(f.submit().ok,true);
 const sheet=f.sheets.get('Sessions'),getRange=sheet.getRange;let fail=true;
 sheet.getRange=(r,c,h,w)=>{const range=getRange(r,c,h,w),setValues=range.setValues;range.setValues=values=>{if(fail&&r>1&&c===1&&w===15){fail=false;throw new Error('Temporary Sheets error');}return setValues(values);};return range;};
 const accept={action:'reviewRegistration',requestId:'registration-one',decision:'accept',payment:'Unpaid',level:'Not assessed'};
 assert.equal(f.owner(accept).ok,false);assert.equal(f.owner({action:'listRegistrationRequests'}).requests[0].status,'accepting');
 const count=f.sheets.get('Clients').rows.length;assert.equal(f.owner(accept).ok,true);assert.equal(f.sheets.get('Clients').rows.length,count);assert.equal(f.sheets.get('Sessions').rows.length,2);assert.equal(f.owner({action:'listSessions'}).classes[0].duration,30);
});
test('approved placement duration reaches hours and personal calendar correctly',()=>{
 const f=registrationFixture();assert.equal(f.submit().ok,true);assert.equal(f.owner({action:'reviewRegistration',requestId:'registration-one',decision:'accept',payment:'Unpaid',level:'1'}).ok,true);
 const session=f.owner({action:'listSessions'}).classes[0];
 const feed=f.context.sbPersonalCalendarText({getSheetByName:name=>f.sheets.get(name)}).replace(/\r\n /g,'');
 const stamp=ms=>new Date(ms).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
 assert(feed.includes('DTEND:'+stamp(Date.parse(session.startsAt)+30*60000)));
 f.advance(Date.parse(session.date+'T23:59:00Z')-f.context.Date.now());
 const client=f.owner({action:'listClients'}).clients.find(c=>c.email==='new@example.com');assert.equal(client.hours,.5);
});
test('a requested course stays on the appointment without moving the existing client to another enrollment',()=>{
 const f=registrationFixture(),person=f.sheets.get('Clients').rows[1];person[11]='General English — 8 sessions';person[10]=JSON.stringify([{id:'old-history',level:'1',program:'General English — 4 sessions'}]);
 const slot=f.calendar('trial').days.flatMap(d=>d.slots).find(s=>s.status==='available');
 assert.equal(f.submit({kind:'trial',name:'Test Student',email:'private@example.com',program:'IELTS preparation',date:slot.date,time:slot.time}).ok,true);
 assert.equal(f.owner({action:'reviewRegistration',requestId:'registration-one',decision:'accept',payment:'Paid',level:'2'}).ok,true);
 assert.equal(person[11],'General English — 8 sessions');assert.equal(JSON.parse(person[10])[0].id,'old-history');
 const session=f.owner({action:'listSessions'}).classes[0];assert.equal(session.course,'IELTS preparation');assert.equal(session.program,'Trial session');
 assert.equal(f.owner({action:'sendClientEmail',clientId:'student-1',kind:'confirmation',sessionId:session.id,requestId:'send-trial-confirmation'}).ok,true);
 assert.match(f.emails[1].body,/Program \/ Level: IELTS preparation/);
});
