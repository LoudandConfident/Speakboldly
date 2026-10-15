import {test} from 'node:test';import assert from 'node:assert/strict';
import {createSheetExamFixture} from './sheet-exams.test.mjs';
import {LEVEL_EXAM_TEXT} from './exam-questions.js';
for(const filename of ['UnifiedCode.gs','Clients.gs'])test(filename+': objective marking is private, written alternatives await review and final reports remain manual',()=>{
 const f=createSheetExamFixture(filename),request=f.request,owner=data=>request({key:'private-test-key',...data});
 for(const exam of LEVEL_EXAM_TEXT){const keys=f.context.SB_EXAM_OBJECTIVE_KEYS;const result=f.context.sbExamObjectiveMarks(exam.level,{A:{},B:{}});assert.equal(result.A.items.length,exam.questions.length);assert.equal(result.B.items.length,exam.sections.B.questions.length);assert.equal(result.A.score,0);assert.equal(result.B.score,0);for(const mark of result.A.items)for(const index of mark.accepted)assert(index>=0&&index<exam.questions[mark.number-1].options.length);}
 assert.equal(owner({action:'savePortalAccess',item:{id:'test:1',title:'Level 1',section:'tests',enabled:true}}).ok,true);
 const token=request({action:'studentExamLogin',level:1,passcode:f.context.sbMonthlyPortalPasswords().passwords['exams:1'],name:'Student',program:'General English'}).token;
 let attempt=request({action:'studentExamGet',token,level:1}).attempt;
 const answers={A:{1:1,2:0,4:1},B:{1:' SHE WORKS IN A DEPARTMENT STORE! ',2:'Where do you come from?',5:'He does not speak Japanese.'},C:{1:'Reading answer'},D:'Summary',E:'Writing'};
 const receipt=request({action:'studentExamSubmit',token,level:1,attemptId:attempt.id,version:attempt.version,answers}).attempt;
 const review=owner({action:'listExamAttempts'}).attempts[0];
 assert.equal(review.automatic.A.score,2);assert.equal(review.automatic.A.items[0].correct,true);assert.equal(review.automatic.A.items[1].correct,false);assert.equal(review.automatic.B.score,4);assert.equal(review.automatic.B.complete,false);assert.equal(review.automatic.B.items[1].status,'review');
 for(const section of ['C','D','E'])assert.equal(section in review.automatic,false);
 assert.equal(request({action:'reviewExamAttempt',token,attemptId:receipt.id,version:receipt.version,marks:{A:2,B:4,C:10,D:10,E:10}}).ok,false);
 assert.equal(owner({action:'reviewExamAttempt',attemptId:receipt.id,version:receipt.version,marks:{A:2,B:4,C:10}}).ok,false);
 const saved=owner({action:'reviewExamAttempt',attemptId:receipt.id,version:receipt.version,marks:{A:2,B:16,C:15,D:17,E:19},feedback:'Private writing comments.'});assert.equal(saved.ok,true);assert.equal(saved.attempt.score,69);assert.equal(saved.attempt.feedback,'Private writing comments.');
 assert.equal(f.emails.length,1);assert.equal(f.emails[0].to,'owner@example.com');assert.doesNotMatch(f.emails[0].body,/Private writing comments/);
 for(const action of ['studentExamGet','studentExamDraft','studentExamSubmit']){const response=request({action,token,level:1,attemptId:receipt.id,version:receipt.version,answers}).attempt;assert(response);for(const field of ['score','marks','feedback','automatic','reviewedAt','notificationError'])assert.equal(field in response,false);assert.equal(response.status,'Submitted');assert.equal(response.answers.E,'Writing');}
});
