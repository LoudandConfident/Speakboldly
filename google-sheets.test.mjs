import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {answerKey,scoreAnswers} from './placement-scoring.js';
function backend(){
 const rows=[['headers']];const props={RESULTS_SPREADSHEET_ID:'test-sheet'};let held=false;
 const sheet={getLastRow:()=>rows.length,appendRow:r=>rows.push(r),getRange:(start,col,count)=>({createTextFinder:id=>({matchEntireCell:()=>({findNext:()=>{const i=rows.findIndex(r=>r[0]===id);return i>0?{getRow:()=>i+1}:null;}})}),getValues:()=>rows.slice(start-1,start-1+count)})};
 const ctx=vm.createContext({console:{error(){}},ContentService:{MimeType:{JSON:'json'},createTextOutput:text=>({setMimeType:()=>JSON.parse(text)})},LockService:{getScriptLock:()=>({waitLock(){held=true;},hasLock:()=>held,releaseLock(){held=false;}})},PropertiesService:{getScriptProperties:()=>({getProperty:k=>props[k]})},SpreadsheetApp:{openById:()=>({getSheetByName:()=>sheet})}});
 vm.runInContext(readFileSync(new URL('./google-sheets/Code.gs',import.meta.url),'utf8'),ctx);
 return{ctx,rows,send:p=>ctx.doPost({postData:{contents:JSON.stringify(p)}}),locked:()=>held};
}
test('sheet backend computes marks, stores no identifying data, and deduplicates retries',()=>{
 const b=backend();const answers=Object.fromEntries(answerKey.map((a,i)=>['q'+(i+1),String(a)]));
 const payload={version:'language-hub-60-v1',attemptId:'12345678-1234-1234-1234-123456789abc',answers,consent:true,score:0,name:'Do not retain',email:'do-not-retain@example.com'};
 const response=b.send(payload);assert.equal(response.ok,true);assert.equal(response.result.score,60);assert.equal(response.result.level,'B2–C1');assert.equal(b.rows.length,2);assert.equal(b.rows[1].length,8);assert.ok(!JSON.stringify(b.rows).includes('Do not retain'));assert.ok(!JSON.stringify(b.rows).includes('@'));assert.equal(b.locked(),false);
 assert.equal(b.send(payload).ok,true);assert.equal(b.rows.length,2);
});
test('backend and frontend agree at every score, and reject invalid submissions',()=>{
 const b=backend();for(let score=0;score<=60;score++){const answers=Object.fromEntries(answerKey.map((a,i)=>['q'+(i+1),i<score?a:(a+1)%4]));assert.equal(JSON.stringify(b.ctx.gradeAnswers(answers)),JSON.stringify(scoreAnswers(answers)));}
 for(const p of [{},{version:'wrong'},{version:'language-hub-60-v1',attemptId:'12345678-12345678',consent:false,answers:{}},{version:'language-hub-60-v1',attemptId:'12345678-12345678',consent:true,answers:{q61:0}}])assert.equal(b.send(p).ok,false);
 assert.equal(b.rows.length,1);assert.equal(b.locked(),false);
});
