import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {randomUUID,createHash,createHmac} from 'node:crypto';

export function createSheetExamFixture(filename='UnifiedCode.gs') {
 const sheets=new Map(),cache=new Map(),emails=[],props={CLIENT_SHEET_ID:'test-sheet',CLIENT_SYNC_KEY:'private-test-key',SB_EXAM_NOTIFY_EMAIL:'owner@example.com'};
 function makeSheet(rows=[]) {
  return {rows,getLastRow:()=>rows.length,setFrozenRows(){},appendRow(row){rows.push([...row]);},getRange(r,c,h=1,w=1){return {getValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??'')),setValues(values){values.forEach((row,i)=>{rows[r-1+i]??=[];row.forEach((v,j)=>rows[r-1+i][c-1+j]=v);});},setFontWeight(){},setNumberFormat(){},setValue(value){rows[r-1]??=[];rows[r-1][c-1]=value;}};}};
 }
 sheets.set('Clients',makeSheet([['ID','Name','Email','Code','Level','Payment','Amount','Hours','Updated','Permissions'],['student-1','Test Student','private@example.com','1234','2','Paid',100,0,'',JSON.stringify(['section:exams','file:exams:/Speakboldly/student-files/exams/Level-2-Exam.pdf'])],['student-2','Other Student','other@example.com','5678','1','Paid',100,0,'',JSON.stringify(['section:exams','file:exams:/Speakboldly/student-files/exams/Level-1-Exam.pdf'])]]));
 const book={getSheetByName:name=>sheets.get(name),insertSheet:name=>{const sheet=makeSheet();sheets.set(name,sheet);return sheet;}};
 let held=false;
 let now=Date.now();class ClockDate extends Date{constructor(...args){super(...(args.length?args:[now]));}static now(){return now;}}
 const context=vm.createContext({ScriptApp:{getProjectTriggers:()=>[],deleteTrigger(){}},Date:ClockDate,Session:{getEffectiveUser:()=>({getEmail:()=> 'owner@example.com'})},MailApp:{getRemainingDailyQuota:()=>100,sendEmail:message=>emails.push(message)},ContentService:{MimeType:{JSON:'json'},createTextOutput:value=>({setMimeType:()=>JSON.parse(value)})},PropertiesService:{getScriptProperties:()=>({getProperty:key=>props[key],setProperty:(key,value)=>props[key]=value})},SpreadsheetApp:{openById:()=>book,flush(){}},CacheService:{getScriptCache:()=>({get:key=>cache.get(key)??null,put:(key,value)=>cache.set(key,value),remove:key=>cache.delete(key)})},Utilities:{formatDate:(date,zone,pattern)=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:zone,year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date),get=k=>p.find(x=>x.type===k).value,day=get('year')+'-'+get('month')+'-'+get('day');return pattern==='yyyy-MM-dd HH:mm'?day+' '+get('hour')+':'+get('minute'):day;},computeHmacSha256Signature:(value,key)=>createHmac('sha256',key).update(value).digest(),base64DecodeWebSafe:value=>Buffer.from(value,'base64url'),newBlob:bytes=>({getDataAsString:()=>Buffer.from(bytes).toString()}),getUuid:randomUUID,DigestAlgorithm:{SHA_256:'sha256'},computeDigest:(_,value)=>createHash('sha256').update(value).digest(),base64EncodeWebSafe:bytes=>Buffer.from(bytes).toString('base64url')},LockService:{getScriptLock:()=>({waitLock(){held=true;},hasLock:()=>held,releaseLock(){held=false;}})}});
 vm.runInContext(readFileSync(new URL('./google-sheets/clients/'+filename,import.meta.url),'utf8'),context);
 if(filename==='Clients.gs')vm.runInContext(readFileSync(new URL('./google-sheets/clients/ExamActions.gs',import.meta.url),'utf8'),context);
 context.setupStudentExams();
 return {context,props,sheets,cache,emails,advance:ms=>now+=ms,request:data=>context[filename==='Clients.gs'?'handleClientSync':'doPost']({postData:{contents:JSON.stringify(data)}})};
}

for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': global switches, private attempts, server timer, owner notification and corrected score',()=>{
 const f=createSheetExamFixture(filename),request=f.request;
 const toggle=(level,enabled)=>request({key:'private-test-key',action:'savePortalAccess',item:{id:'test:'+level,section:'tests',title:'Level '+level,url:'',enabled}});
 assert.equal(request({action:'studentExamLogin',passcode:'1111',name:'Test Student',program:'General English'}).ok,false);
 assert.equal(toggle(2,true).ok,true);
 const login=request({action:'studentExamLogin',passcode:'1111',name:'Test Student',program:'General English'});assert.equal(login.ok,true);assert.deepEqual(login.student,{name:'Test Student',program:'General English',levels:[2]});
 const token=login.token;
 assert.equal(request({action:'studentExamGet',token,level:1}).ok,false);
 assert.equal(request({action:'listExamAttempts',token}).ok,false);
 let attempt=request({action:'studentExamGet',token,level:2}).attempt;
 assert.equal(attempt.deadline-attempt.serverNow,20*60*1000);
 const answers={A:{1:2},B:{1:'A corrected sentence.'},C:{1:'My answer'},D:'Listening summary',E:'Written response'};
 let result=request({action:'studentExamDraft',token,level:2,attemptId:attempt.id,version:attempt.version,answers});assert.equal(result.ok,true);attempt=result.attempt;
 assert.equal(request({action:'studentExamDraft',token,level:2,attemptId:attempt.id,version:1,answers}).ok,false);
 assert.deepEqual(request({action:'studentExamGet',token,level:2}).attempt.answers,answers);
 const impostor=request({action:'studentExamLogin',passcode:'1111',name:'Test Student',program:'General English'});
 assert.equal(request({action:'studentExamSubmit',token:impostor.token,level:2,attemptId:attempt.id,version:attempt.version,answers}).ok,false);
 assert.equal(toggle(2,false).ok,true);
 assert.equal(request({action:'studentExamGet',token:impostor.token,level:2}).ok,false);
 result=request({action:'studentExamSubmit',token,level:2,attemptId:attempt.id,version:attempt.version,answers,score:100,to:'attacker@example.com'});assert.equal(result.ok,true);attempt=result.attempt;assert.equal(attempt.score,null);assert.equal(attempt.status,'Awaiting review');
 assert.deepEqual(request({action:'studentExamDraft',token,level:2,attemptId:attempt.id,version:attempt.version,answers:{A:{},B:{},C:{},D:'changed',E:''}}).attempt.answers,answers);
 assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'owner@example.com');assert.match(f.emails[0].body,/Name: Test Student\nLevel: 2\nProgram: General English/);
 assert.equal(request({action:'reviewExamAttempt',token,attemptId:attempt.id,version:attempt.version,marks:{A:20,B:20,C:20,D:20,E:20}}).ok,false);
 const admin={key:'private-test-key',action:'reviewExamAttempt',attemptId:attempt.id,version:attempt.version,marks:{A:18,B:16,C:15,D:17,E:19},feedback:'Good progress.'};
 assert.equal(request({...admin,marks:{...admin.marks,E:21}}).ok,false);
 result=request(admin);assert.equal(result.ok,true);assert.equal(result.attempt.score,85);assert.equal(result.attempt.status,'Reviewed');
 assert.equal(request(admin).ok,false);
 assert.equal(request({action:'studentExamGet',token,level:2}).attempt.score,85);
 assert.equal(request({action:'listExamAttempts',key:'private-test-key'}).attempts.length,1);
 toggle(3,true);const second=request({action:'studentExamLogin',passcode:'1111',name:'Timed Student',program:'IELTS'});
 let timed=request({action:'studentExamGet',token:second.token,level:3}).attempt;
 timed=request({action:'studentExamDraft',token:second.token,level:3,attemptId:timed.id,version:timed.version,answers}).attempt;
 f.advance(20*60*1000+1);
 const expired=request({action:'studentExamSubmit',token:second.token,level:3,attemptId:timed.id,version:timed.version,answers:{...answers,E:'late edit'}}).attempt;
 assert.equal(expired.status,'Awaiting review');assert.equal(expired.answers.E,'Written response');assert.equal(f.emails.length,2);
 const access=request({action:'studentPortalAccess'});assert.equal(access.items.find(i=>i.id==='test:2').enabled,false);
 assert.equal(request({action:'savePortalAccess',item:{id:'test:2',enabled:true}}).ok,false);
 const file=request({key:'private-test-key',action:'savePortalAccess',item:{title:'Exercise',section:'exercises',url:'https://example.com/worksheet.pdf',enabled:true}});assert.equal(file.ok,true);
 assert.equal(request({action:'studentPortalAccess'}).items.find(i=>i.id===file.item.id).url,'https://example.com/worksheet.pdf');
 request({key:'private-test-key',action:'savePortalAccess',item:{...file.item,enabled:false}});
 assert.equal(request({action:'studentPortalAccess'}).items.find(i=>i.id===file.item.id).url,'');
});
