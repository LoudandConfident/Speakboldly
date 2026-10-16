import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
import {learningDocumentEmbed} from './learning-document-viewer.js';

function fixture(){const f=createSheetExamFixture();f.context.setupStudentPortal();return {...f,owner:data=>f.request({key:'private-test-key',...data})};}
function submitExam(f,level=1){const passcode=f.context.sbMonthlyPortalPasswords().passwords.exams,token=f.request({action:'studentExamLogin',level,name:'Test Student',passcode}).token;
 const attempt=f.request({action:'studentExamGet',token,level,examVersion:2}).attempt,key=vm.runInContext('SB_EXAM_V2_KEYS',f.context)[level],old=vm.runInContext('SB_EXAM_OBJECTIVE_KEYS',f.context)[level]||key,answers={examVersion:2,A:{},B:{},C:{},D:{},E:'My writing is for Mira to mark.',F:{}};
 for(const [section,list]of Object.entries({A:old.A.slice(0,10),B:old.B.slice(0,5),C:key.C,D:key.D,F:key.F}))list.forEach((value,i)=>answers[section][i+1]=Array.isArray(value)?value[0]:value);
 const data={action:'studentExamSubmit',token,level,attemptId:attempt.id,version:attempt.version,answers};return {data,result:f.request(data)};
}
test('all eight exam emails include private corrections, objective totals and unmarked writing; retries do not mail twice',()=>{
 for(let level=1;level<=8;level++){const f=fixture(),{data,result}=submitExam(f,level);assert.equal(result.ok,true);assert.equal(f.emails.length,1);const mail=f.emails[0];assert.equal(mail.to,'owner@example.com');assert.match(mail.body,/Objective total: 30 \/ 30/);assert.match(mail.body,/Expected:/);assert.match(mail.body,/Writing: awaiting your mark \(out of 10\)/);assert.match(mail.body,/My writing is for Mira/);assert.doesNotMatch(mail.body,/Exam Review/);assert.match(mail.body,/Nothing is sent to the student automatically/);assert.equal(result.attempt.automatic,undefined);f.request(data);assert.equal(f.emails.length,1);}
});
test('uncertain exam email delivery preserves submission without automatic duplicate email',()=>{
 const f=fixture();let sends=0;f.context.MailApp.sendEmail=()=>{sends++;throw Error('Connection lost after handing off email');};const {data,result}=submitExam(f);assert.equal(result.ok,true);assert.equal(f.sheets.get('Exam attempts').rows[1][15],'delivery_unknown');f.request(data);assert.equal(sends,1);assert.equal(f.owner({action:'retryExamNotification',attemptId:result.attempt.id}).ok,false);assert.equal(f.sheets.get('Exam attempts').rows[1][7].includes('My writing'),true);
});
test('owner backups include records and material links, exclude credentials and sessions, and never send emails',()=>{
 const f=fixture();f.context.PropertiesService.getScriptProperties=()=>({getProperty:key=>f.props[key],getProperties:()=>({...f.props}),setProperty:(key,value)=>f.props[key]=value});f.props.SB_NATIVE_ENGLISH_202610='not-an-allowed-setting';f.props['SB_NATIVE_ENGLISH_2026-10']='monthly-page';submitExam(f);
 assert.equal(f.request({action:'exportOwnerBackup'}).ok,false);assert.equal(f.request({action:'saveOwnerBackup',key:'wrong'}).ok,false);const r=f.owner({action:'exportOwnerBackup'});assert.equal(r.ok,true);assert.equal(r.backup.format,'speak-boldly-owner-backup');assert(r.backup.tables.Clients.length);assert(r.backup.tables['Exam attempts'][1][7].includes('My writing'));assert(!('Exam sessions'in r.backup.tables));const serialized=JSON.stringify(r.backup);for(const secret of ['private-test-key','CLIENT_SYNC_KEY','SB_EXAM_NOTIFY_EMAIL'])assert(!serialized.includes(secret));assert.equal(r.backup.settings['SB_NATIVE_ENGLISH_2026-10'],'monthly-page');assert.equal(f.emails.length,1);
 const files=new Map(),folder={getId:()=> 'private-backup-folder',getFilesByName:name=>({hasNext:()=>files.has(name),next:()=>({setContent:text=>files.set(name,text)})}),createFile:(name,text)=>files.set(name,text)};let folders=0,triggers=0;
 f.context.DriveApp={createFolder:()=>{folders++;return folder;},getFolderById:()=>folder};const handlers=[];f.context.ScriptApp={getProjectTriggers:()=>handlers.map(name=>({getHandlerFunction:()=>name})),newTrigger:name=>({timeBased(){return this;},everyDays(){return this;},atHour(){return this;},inTimezone(){return this;},create(){triggers++;handlers.push(name);}})};
 f.context.setupDailyBackups();f.context.setupDailyBackups();assert.equal(folders,1);assert.equal(files.size,1);assert.equal(triggers,1);assert.equal(f.props.SB_BACKUP_DAILY_ENABLED,'true');assert.equal(f.owner({action:'saveOwnerBackup'}).ok,true);assert.equal(files.size,1);assert.equal(f.emails.length,1);
});
test('overview lists upcoming sessions and offers manual final reports after exam submission',()=>{
 const f=fixture(),date=new Date(f.context.Date.now()+2*86400000).toISOString().slice(0,10);assert.equal(f.owner({action:'saveSession',session:{clientId:'student-1',number:1,date,time:'18:00',program:'General English — 8 sessions',level:'2'}}).ok,true);submitExam(f);
 const data=f.owner({action:'instructorOverview'});assert.equal(data.ok,true);assert.equal(data.upcomingClasses.length,1);assert.equal(data.upcomingClasses[0].time,'18:00');assert.equal(data.reportsToPrepare[0].clientId,'student-1');assert.equal(data.reportsToPrepare[0].writingPending,true);assert.equal(data.pendingReviews[0].notificationStatus,'sent');assert.equal(data.zoomUrl,'https://zoom.example.test/meeting');assert.equal(f.emails.length,1);
 // A manually sent final report completes the work without requiring Exam Review.
 f.context.Utilities.base64Decode=value=>Array.from(Buffer.from(value,'base64'));const originalBlob=f.context.Utilities.newBlob;f.context.Utilities.newBlob=(bytes,type,name)=>name?{getName:()=>name,getContentType:()=>type}:originalBlob(bytes);
 const sent=f.owner({action:'sendClientEmail',clientId:'student-1',kind:'final',pdfBase64:Buffer.from('%PDF-1.7 mock completed report').toString('base64'),requestId:'manual-final-report'});assert.equal(sent.ok,true,JSON.stringify(sent));assert.equal(f.emails.length,2);assert.equal(f.emails[1].attachments.length,1);
 const done=f.owner({action:'instructorOverview'});assert.equal(done.pendingReviews.length,0);assert.equal(done.reportsToPrepare.length,0);
});
test('website PDF books use the in-site page viewer; Drive uploads embed instead of navigating away',()=>{
 assert.deepEqual(learningDocumentEmbed('https://loudandconfident.github.io/Speakboldly/student-files/material/B-Level-1-Book.pdf','https://loudandconfident.github.io/Speakboldly/'),{kind:'pdf',url:'https://loudandconfident.github.io/Speakboldly/student-files/material/B-Level-1-Book.pdf'});
 assert.equal(learningDocumentEmbed('https://drive.google.com/file/d/book_id/view','https://loudandconfident.github.io/Speakboldly/').url,'https://drive.google.com/file/d/book_id/preview');
});
test('placement and trial requests from the real form need no registered course and can be accepted once',()=>{
 for(const kind of ['placement','trial']){const f=fixture(),token=f.request({action:'studentBookingLogin',public:true}).token,slot=f.request({action:'studentBookingCalendar',token,kind}).days.flatMap(day=>day.slots).find(slot=>slot.status==='available');
 const request=f.request({action:'studentRegisterSlot',token,kind,name:'Form Booking',email:'form-booking@example.com',program:'',paid:kind==='trial'?'not-required':'yes',date:slot.date,time:slot.time,requestId:'real-form-request'});assert.equal(request.ok,true);
 const accept={action:'reviewRegistration',requestId:request.requestId,decision:'accept',payment:kind==='trial'?'Unpaid':'Paid',level:'1'};const saved=f.owner(accept);assert.equal(saved.ok,true,JSON.stringify(saved));assert.equal(f.owner(accept).ok,true);assert.equal(f.sheets.get('Sessions').rows.length,2);assert.equal(f.owner({action:'listSessions'}).classes[0].duration,kind==='trial'?60:30);
 }
});
