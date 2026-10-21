import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const backend=readFileSync(new URL('./google-sheets/clients/UnifiedCode.gs',import.meta.url),'utf8');
class Sheet{
 constructor(rows=[]){this.rows=rows.map(r=>[...r]);}getLastRow(){return this.rows.length;}
 getRange(row,col,n=1,m=1){const s=this;return {getValues(){return Array.from({length:n},(_,i)=>Array.from({length:m},(_,j)=>s.rows[row+i-1]?.[col+j-1]??''));},setValue(v){return this.setValues([[v]]);},setValues(values){values.forEach((r,i)=>r.forEach((v,j)=>{s.rows[row+i-1]||=[];s.rows[row+i-1][col+j-1]=v;}));return this;},setNumberFormat(){return this;}};}
}
test('legacy advancement separates current hours and retains the old 12-hour record',()=>{
 const now=Date.now(),header=Array(15).fill(''),history=[{id:'advanced-test',reason:'advanced',level:'1',program:'General English',closedAt:new Date(now-2*86400000).toISOString()}];
 const people=new Sheet([header,['c1','Learner','learner@example.com','1234','2','Paid',0,13.5,'',[],JSON.stringify(history),'General English',12,'']]);
 const appointment=(id,level,days,number)=>[id,'c1',number,new Date(now-days*86400000).toISOString().slice(0,10),'12:00',new Date(now-days*86400000).toISOString(),'','expired','','','General English',level,'counted',90,''];
 const sessions=new Sheet([header,appointment('old','1',3,8),appointment('new','2',1,1)]),book={getSheetByName:n=>n==='Clients'?people:n==='Sessions'?sessions:null};
 const context=vm.createContext({Utilities:{getUuid:()=> 'uuid',formatDate:d=>new Date(d).toISOString().slice(0,10)},PropertiesService:{getScriptProperties:()=>({getProperty:()=> '1',setProperty(){}})},SpreadsheetApp:{openById:()=>book}});
 vm.runInContext(backend,context);assert.equal(context.sbCountedSessionHours(book,'c1'),1.5);context.sbApplySessionHours(book);assert.equal(people.rows[1][7],1.5);assert.equal(JSON.parse(people.rows[1][10])[0].hours,12);
 const move=context.sbClientEnrollmentChange(people.rows[1],{level:'3',program:'General English',advanceLevel:true,advanceFromLevel:'2'});assert.equal(move.advanced,true);assert.equal(move.enrollmentHistory.at(-1).hours,1.5);
 const next=[...people.rows[1]];next[4]='3';next[10]=JSON.stringify(move.enrollmentHistory);
 const retry=context.sbClientEnrollmentChange(next,{level:'3',program:'General English',advanceLevel:true,advanceFromLevel:'2'});assert.equal(retry.advanced,false);assert.equal(retry.enrollmentHistory.length,2);
 sessions.rows[2][7]='cancelled';context.sbApplySessionHours(book);assert.equal(people.rows[1][7],0);
});
function moduleCode(path){return readFileSync(new URL(path,import.meta.url),'utf8').replace(/^import[\s\S]*?;\s*$/gm,'').replace(/\bexport\s+(?=(?:async\s+)?(?:function|const|let|class))/g,'');}
test('the next level starts at Session 1 and then advances only its own sequence',()=>{const c=vm.createContext({courses:[]});vm.runInContext(moduleCode('./session-programs.js'),c);const classes=[{clientId:'c1',program:'General English',level:'1',number:8}];assert.equal(c.nextSessionNumber(classes,'c1','General English','2',true),1);classes.push({clientId:'c1',program:'General English',level:'2',number:1});assert.equal(c.nextSessionNumber(classes,'c1','General English','2',true),2);});
test('writing checks preserve valid questions and correct common errors',()=>{const c=vm.createContext({});vm.runInContext(moduleCode('./writing-check.js'),c);assert.equal(c.checkWriting('i is happy. He go to school.').suggestedText,'I am happy. He goes to school.');assert.equal(c.checkWriting('She have a freind.').suggestedText,'She has a friend.');for(const text of ['Does he go to work? Does she have a book?','If I were rich, I would travel.','I had had enough.'])assert.equal(c.checkWriting(text).issues.length,0);assert.equal(c.countSentences('Yes. No. Hi.'),0);assert.equal(c.countSentences('I read daily. I write often.'),2);});
