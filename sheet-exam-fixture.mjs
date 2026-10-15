import {test} from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {randomUUID,createHash,createHmac} from 'node:crypto';

export function createSheetExamFixture(filename='UnifiedCode.gs') {
 const sheets=new Map(),cache=new Map(),emails=[],props={CLIENT_SHEET_ID:'test-sheet',CLIENT_SYNC_KEY:'private-test-key',SB_EXAM_NOTIFY_EMAIL:'owner@example.com',SB_ZOOM_URL:'https://zoom.example.test/meeting',SB_ZOOM_PASSCODE:'mock-meeting-passcode'};
 function makeSheet(rows=[]) {
  return {rows,deleteRow(row){rows.splice(row-1,1);},getLastRow:()=>rows.length,setFrozenRows(){},appendRow(row){rows.push([...row]);},getRange(r,c,h=1,w=1){return {getValues:()=>Array.from({length:h},(_,i)=>Array.from({length:w},(_,j)=>rows[r-1+i]?.[c-1+j]??'')),setValues(values){values.forEach((row,i)=>{rows[r-1+i]??=[];row.forEach((v,j)=>rows[r-1+i][c-1+j]=v);});},setFontWeight(){},setNumberFormat(){},setValue(value){rows[r-1]??=[];rows[r-1][c-1]=value;}};}};
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

