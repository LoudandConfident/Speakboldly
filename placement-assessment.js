import {createPlacementBookingRemark} from './placement-booking-remark.js?v=personalised-placement-1';
import {CEFR_LEVELS} from './cefr-levels.js';
import {practiceForLevel} from './assessment-guidance.js?v=bold-blog-simple-results';
import {addResultImageButton,addResultBranding} from './result-image.js?v=two-line-footer-1';
import { questions, TEST_VERSION } from './placement-questions.js?v=balanced-v4';
import {placementExplanations} from './placement-explanations.js?v=mistake-explanations-1';
import { scoreAnswers, placementCorrections } from './placement-scoring.js?v=balanced-v3';

import { ASSESSMENT_DURATION_MS, remainingSeconds, formatTime } from './assessment-time.js';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const form=$('#placement-form'),storageKey='speak-boldly-'+TEST_VERSION;let locked=false,testPage=0,deadline=null,timerInterval=null;
const draftKey=storageKey+'-draft-v1';let draftRestored=false;
const pageSize=10,pageCount=Math.ceil(questions.length/pageSize);
form.innerHTML='<div class="placement-participant"><p class="demo-note">Grammar and vocabulary, with mixed difficulty throughout. Press Submit to see your estimated CEFR range. </p></div><div class="test-submit-bar"><span id="assessment-timer" class="assessment-timer" role="timer" aria-label="Time remaining">20:00 remaining</span><span id="answered-count">0 / '+questions.length+' answered</span><button class="button" type="submit">Submit my answers</button></div>'+questions.map(q=>'<fieldset class="placement-question"><legend>'+q.number+'. '+escape(q.question)+'</legend>'+q.options.map((option,j)=>'<label><input type="radio" name="q'+q.number+'" value="'+j+'"> '+String.fromCharCode(97+j)+') '+escape(option)+'</label>').join('')+'</fieldset>').join('')+'<div class="test-pager"><button type="button" class="button light" id="test-prev">Previous</button><span id="test-page-label"></span><button type="button" class="button light" id="test-next">Next</button></div><p class="demo-note">Original Speak Boldly assessment · Grammar and vocabulary.</p><button class="button" type="submit">Submit my answers</button>';
const fields=[...form.querySelectorAll('.placement-question')];
const submitNotice=document.createElement('p');submitNotice.id='placement-submit-notice';submitNotice.setAttribute('role','status');submitNotice.setAttribute('aria-live','polite');form.append(submitNotice);
const confirmation=document.createElement('section');confirmation.id='placement-submit-confirmation';confirmation.hidden=true;confirmation.setAttribute('aria-label','Confirm placement test submission');confirmation.style.cssText='padding:20px;margin:20px 0;border:1px solid #193c32;border-radius:12px;background:#edf0e6';
const confirmationText=document.createElement('p');confirmationText.textContent='Ready to submit? Your score and estimated level will appear immediately. Submitted answers cannot be changed.';
const confirmSubmission=document.createElement('button');confirmSubmission.type='button';confirmSubmission.className='button';confirmSubmission.textContent='Confirm submission';
const keepReviewing=document.createElement('button');keepReviewing.type='button';keepReviewing.className='button light';keepReviewing.textContent='Keep reviewing';confirmation.append(confirmationText,confirmSubmission,keepReviewing);form.append(confirmation);
keepReviewing.onclick=()=>{confirmation.hidden=true;form.querySelector('button[type=submit]').focus();};
confirmSubmission.onclick=()=>submitAssessment(false,true);
function saveAssessmentDraft(){if(locked||deadline===null)return;try{sessionStorage.setItem(draftKey,JSON.stringify({version:TEST_VERSION,answers:collectAnswers(),deadline,page:testPage}));}catch{}}
function removeAssessmentDraft(){try{sessionStorage.removeItem(draftKey);}catch{}}
function restoreAssessmentDraft(){if(draftRestored)return;draftRestored=true;try{const saved=JSON.parse(sessionStorage.getItem(draftKey)||'null');if(!saved||saved.version!==TEST_VERSION||!Number.isFinite(saved.deadline)||saved.deadline>Date.now()+ASSESSMENT_DURATION_MS+5000||saved.deadline<Date.now()-24*60*60*1000){removeAssessmentDraft();return;}deadline=saved.deadline;testPage=Number.isInteger(saved.page)?Math.max(0,Math.min(pageCount-1,saved.page)):0;for(const [name,value]of Object.entries(saved.answers||{})){if(!/^q\d+$/.test(name)||!/^\d$/.test(String(value)))continue;const input=form.querySelector('input[name="'+name+'"][value="'+value+'"]');if(input)input.checked=true;}count();renderPage();submitNotice.textContent='Your saved answers have been restored on this tab. The original timer continues.';}catch{removeAssessmentDraft();}}

function renderPage(){fields.forEach((f,i)=>f.hidden=Math.floor(i/pageSize)!==testPage);$('#test-page-label').textContent='Page '+(testPage+1)+' of '+pageCount;$('#test-prev').disabled=testPage===0;$('#test-next').disabled=testPage===pageCount-1;}
$('#test-prev').onclick=()=>{if(testPage>0){testPage--;renderPage();saveAssessmentDraft();form.scrollIntoView({behavior:'smooth'});}};
$('#test-next').onclick=()=>{if(testPage<pageCount-1){testPage++;renderPage();saveAssessmentDraft();form.scrollIntoView({behavior:'smooth'});}};
function collectAnswers(){return Object.fromEntries([...new FormData(form)].filter(([name])=>/^q\d+$/.test(name)));}
function count(){ $('#answered-count').textContent=Object.keys(collectAnswers()).length+' / '+questions.length+' answered';}
form.addEventListener('change',()=>{count();saveAssessmentDraft();});
// Clear legacy saved results; assessment feedback lasts only while this page is open.
try{localStorage.removeItem(storageKey);}catch{}
function clearAssessmentResult(){
 confirmation.hidden=true;submitNotice.textContent='';$('#placement-view-results')?.remove();clearInterval(timerInterval);timerInterval=null;deadline=null;locked=false;testPage=0;$('#assessment-timer').textContent='20:00 remaining';$('#assessment-timer').classList.remove('is-urgent');form.reset();form.querySelectorAll('input,button').forEach(element=>element.disabled=false);const result=$('#placement-result');result.hidden=true;result.replaceChildren();count();renderPage();
}
function tickTimer(){
 if(locked||deadline===null)return;
 const seconds=remainingSeconds(deadline);
 $('#assessment-timer').textContent=formatTime(seconds)+' remaining';
 $('#assessment-timer').classList.toggle('is-urgent',seconds<=60);
 if(seconds===0)submitAssessment(true);
}
function startAssessment(){
 if(!document.querySelector('#assessment-dialog')?.open && !(window.location.hash==='#assessment' && document.querySelector('#assessment')?.hasAttribute('data-view')))return;
 restoreAssessmentDraft();if(!locked){if(deadline===null)deadline=Date.now()+ASSESSMENT_DURATION_MS;if(timerInterval===null)timerInterval=setInterval(tickTimer,250);saveAssessmentDraft();tickTimer();}
}
document.addEventListener('assessment-open',startAssessment);
window.addEventListener('hashchange',startAssessment);
window.addEventListener('pageshow',startAssessment);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickTimer();else saveAssessmentDraft();});
form.addEventListener('change',tickTimer);

window.addEventListener('pagehide',()=>{saveAssessmentDraft();clearAssessmentResult();draftRestored=false;});
function finish(record){
 const resultScore=scoreAnswers(record.answers);
 const result=$('#placement-result');result.hidden=false;
 result.classList.add('assessment-result');
 result.innerHTML='<h3>Estimated level range: '+escape(resultScore.level)+'</h3><p class="placement-score"><strong>'+resultScore.score+' / '+resultScore.total+'</strong> · '+resultScore.percentage+'%</p>';
 const chart=document.createElement('section');chart.className='cefr-chart';chart.innerHTML='<h4>CEFR chart</h4><div class="cefr-level-chart">'+CEFR_LEVELS.map(({level,label,description})=>'<div class="cefr-level'+(resultScore.level.includes(level)?' is-result':'')+'"><strong>'+level+'</strong><span class="cefr-label">'+escape(label)+'</span><span class="cefr-description">'+escape(description)+'</span></div>').join('')+'</div>';result.append(chart);
 const guidance=practiceForLevel(resultScore.level);
 const priorities=document.createElement('section');priorities.className='result-practice';
 priorities.innerHTML='<h3>What to work on next</h3><p>Start here. A speaking and listening check will help refine your plan.</p>'+[['Structure of language',guidance.structure],['Vocabulary and meaning',guidance.vocabulary],['Using English',guidance.use],['On your own',guidance.routine]].map(([heading,text])=>'<h4>'+escape(heading)+'</h4><p>'+escape(text)+'</p>').join('');result.append(priorities);
 const estimate=document.createElement('p');estimate.textContent='This grammar and vocabulary test gives a provisional estimate, not a certified CEFR level.';result.append(estimate);
 const corrections=placementCorrections(record.answers),review=document.createElement('section');review.className='placement-answer-review';review.setAttribute('aria-label','Answer review');const reviewTitle=document.createElement('h3');reviewTitle.textContent=corrections.length?'Questions to review · '+corrections.length:'All answers correct';review.append(reviewTitle);if(!corrections.length){const message=document.createElement('p');message.textContent='You answered all 50 questions correctly.';const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Check your mistakes and why';summary.className='button light';details.append(summary,message);review.append(details);}else{const list=document.createElement('ol');list.style.paddingLeft='24px';for(const item of corrections){const q=questions[item.number-1],row=document.createElement('li');row.value=item.number;row.style.marginBottom='22px';const prompt=document.createElement('p'),chosen=document.createElement('p'),correct=document.createElement('p');prompt.textContent=q.question;chosen.textContent='Your answer: '+(item.selected===null?'Not answered':q.options[item.selected]);correct.textContent='Correct answer: '+q.options[item.correct];correct.style.fontWeight='600';const why=document.createElement('p');why.className='placement-mistake-explanation';why.textContent='Why: '+placementExplanations[item.number-1];row.append(prompt,chosen,correct,why);list.append(row);}const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='Check your mistakes and why';summary.className='button light';details.append(summary,list);review.append(details);}result.append(review);
 result.append(createPlacementBookingRemark(document,window));
 addResultBranding(document,result);
 addResultImageButton(document,window,result,'Speak Boldly — English assessment');
 locked=true;confirmation.hidden=true;submitNotice.textContent='Assessment submitted. Your results are below.';removeAssessmentDraft();clearInterval(timerInterval);timerInterval=null;form.querySelectorAll('input,button').forEach(e=>{if(!['test-prev','test-next'].includes(e.id))e.disabled=true;});renderPage();const viewResults=document.createElement('button');viewResults.id='placement-view-results';viewResults.type='button';viewResults.className='button light';viewResults.textContent='View results';viewResults.onclick=()=>result.scrollIntoView({behavior:'smooth'});form.querySelector('.test-submit-bar').append(viewResults);return record;
}
function submitAssessment(timedOut=false,confirmed=false){
 if(locked){$('#placement-result').scrollIntoView({behavior:'smooth'});return;}
 if(deadline===null){startAssessment();if(deadline===null){submitNotice.textContent='Please reopen the placement test to start its timer. Your current choices are still here.';return;}}
 const expired=remainingSeconds(deadline)===0;
 if(!timedOut&&!expired){if(!form.reportValidity())return;if(!confirmed){saveAssessmentDraft();confirmation.hidden=false;confirmation.scrollIntoView({behavior:'smooth',block:'center'});confirmSubmission.focus();return;}}
 // A confirmation dialog can remain open past the deadline.
 const autoSubmitted=timedOut||remainingSeconds(deadline)===0;
 const answers=collectAnswers();
 const record={version:TEST_VERSION,attemptId:globalThis.crypto?.randomUUID?.()||'placement-'+Date.now()+'-'+Math.random().toString(36).slice(2),answers,answered:Object.keys(answers).length,submittedAt:new Date().toISOString(),consent:false,emailStatus:'disabled'};
 try{finish(record);}catch{saveAssessmentDraft();submitNotice.textContent='Your result could not finish displaying. Your answers are still here. Please try Submit again.';return;}
 $('#assessment-timer').textContent=autoSubmitted?'Time is up — answers submitted':'Assessment submitted';
 if(document.querySelector('#assessment-dialog')?.open || window.location.hash==='#assessment')$('#placement-result').scrollIntoView({behavior:'smooth'});
}
form.addEventListener('submit',e=>{e.preventDefault();submitAssessment();});
// Do not accept additional choices if a background tab resumes after its deadline.
form.addEventListener('click',e=>{if(deadline!==null&&!locked&&remainingSeconds(deadline)===0){e.preventDefault();tickTimer();}},true);

startAssessment();renderPage();
