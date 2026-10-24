import {CEFR_LEVELS} from './cefr-levels.js';
import {practiceForLevel} from './assessment-guidance.js?v=bold-blog-simple-results';
import {addResultImageButton,addResultBranding} from './result-image.js?v=documents-sessions-1';
import { ASSESSMENT_DURATION_MS, remainingSeconds, formatTime, offerIsActive } from './assessment-time.js';
import { questions, TEST_VERSION } from './placement-questions.js?v=balanced-v3';
import { scoreAnswers, placementCorrections } from './placement-scoring.js?v=balanced-v3';

import {courses,matches} from './courses.js?v=distinct-workshop-art';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chat=message=>'mailto:speakboldly16@gmail.com?subject='+encodeURIComponent('English coaching enquiry')+'&body='+encodeURIComponent(message+'\n\nContact number: 01283786904');
const scenes={
story:'<path d="M54 28h94l30 30v116H54Z" fill="#f7faf3"/><path d="M148 28v31h30M73 83h68M73 101h59M73 119h46M73 147q14-18 28-6t27-5"/><path d="m166 89 13-13 24 24-13 13-24-24Zm-5 5-39 39-7 23 23-7 39-39" fill="#d5ed98"/><path d="m122 133 16 16M190 43v17M182 51h17M29 110v13M23 116h13"/>',

focus:'<rect x="30" y="99" width="112" height="65" rx="7"/><path d="M43 116h66M43 130h49M43 144h59M18 166h137"/><circle cx="164" cy="72" r="45" fill="#f7faf3"/><circle cx="164" cy="72" r="29"/><circle cx="164" cy="72" r="12" fill="#d5ed98"/><path d="m164 72 35-35m-5-10 1 14 14 1M78 39h24M90 27v24"/><circle cx="173" cy="146" r="26"/><path d="M173 131v16l10 6M164 116h18M173 116v4"/>',

momentum:'<path d="M42 156h43v-35h42V87h42V50h36"/><path d="m187 33 18 17-18 17"/><circle cx="70" cy="65" r="25"/><path d="M70 51v15l10 7M43 173h162"/><path d="M36 92h14M27 107h25"/>',

urgent:'<path d="M28 46h115v76h-43l-27 23v-23H28z"/><path d="M49 68h65M49 86h49"/><circle cx="168" cy="129" r="43"/><path d="M168 101v28l18 12M168 91v5M168 162v5M130 129h5M201 129h5"/>',
pronunciation:"<rect x=\"85\" y=\"35\" width=\"50\" height=\"88\" rx=\"25\"/><path d=\"M70 97v9a40 40 0 0 0 80 0v-9M110 146v25M88 171h44M49 72v37M33 84v13M173 63v55M189 77v27M99 60h22M99 78h22\"/>",
technology:"<rect x=\"42\" y=\"39\" width=\"156\" height=\"102\" rx=\"8\"/><path d=\"M100 142v20h40v-20M79 164h82M92 74l-16 16 16 16M148 74l16 16-16 16M129 68l-18 43\"/><circle cx=\"181\" cy=\"154\" r=\"18\"/><path d=\"M181 145v18M172 154h18\"/>",
kids:"<path d=\"M34 143h172\"/><rect x=\"37\" y=\"103\" width=\"47\" height=\"47\" rx=\"7\" fill=\"#d5ed98\"/><path d=\"M49 136l11-22 11 22M53 128h14\"/><rect x=\"93\" y=\"110\" width=\"48\" height=\"48\" rx=\"7\" fill=\"#f0d7bf\"/><path d=\"M106 121v26h9q15 0 9-8-2-4-9-4h-9m0-14h9q14 0 9 8-3 6-9 6\"/><rect x=\"150\" y=\"98\" width=\"47\" height=\"47\" rx=\"7\" fill=\"#dbe5c8\"/><path d=\"M183 111q-20-9-20 11t20 10\"/><path d=\"M46 33h72v39H91L76 84V72H46z\" fill=\"#d5ed98\"/><circle cx=\"65\" cy=\"53\" r=\"2\" fill=\"#176b3a\"/><circle cx=\"81\" cy=\"53\" r=\"2\" fill=\"#176b3a\"/><circle cx=\"97\" cy=\"53\" r=\"2\" fill=\"#176b3a\"/><path d=\"M135 34h59v40h-59zM164 34v40M144 46h11M174 46h11M144 57h11M174 57h11\"/><path d=\"M116 171l5-9 5 9 10 2-8 7 1 10-8-5-9 5 2-10-8-7z\" fill=\"#d5ed98\"/>",
training:"<rect x=\"89\" y=\"30\" width=\"112\" height=\"83\" rx=\"6\"/><path d=\"M109 52h68M109 70h45M128 88h49M146 114v27M124 142h44\"/><circle cx=\"57\" cy=\"73\" r=\"19\"/><path d=\"M31 156v-39c0-25 52-25 52 0v39M83 116l32-29M41 157v21M72 157v21\"/><circle cx=\"124\" cy=\"166\" r=\"13\"/><circle cx=\"175\" cy=\"166\" r=\"13\"/>",
learners:"<rect x=\"35\" y=\"34\" width=\"74\" height=\"58\" rx=\"8\"/><path d=\"M47 62q25-28 50 0-25 28-50 0\"/><circle cx=\"72\" cy=\"62\" r=\"7\"/><rect x=\"130\" y=\"34\" width=\"74\" height=\"58\" rx=\"8\"/><path d=\"M158 55c0-21 31-20 28 0-2 12-17 8-17 23h-9M154 60v10\"/><rect x=\"35\" y=\"110\" width=\"74\" height=\"58\" rx=\"8\"/><path d=\"M48 124h20v30H48zM69 124h25v30H69M53 133h9M75 133h12M75 143h12\"/><rect x=\"130\" y=\"110\" width=\"74\" height=\"58\" rx=\"8\"/><path d=\"M150 147v-18q0-9 7-6v16-19q0-8 7-5v24-18q0-7 7-4v23-12q0-8 7-5v24q-9 20-23 0l-7-9\"/>",
ielts:'<rect x="61" y="29" width="116" height="143" rx="8"/><path d="M91 29v-10h56v10M83 69h58M83 88h72M83 107h47M83 126h59"/><circle cx="180" cy="144" r="27"/><path d="M180 126v18l12 9"/>',
general:'<path d="M35 53h91v63H60l-25 20z"/><path d="M119 83h90v64h-24l-25 18v-18h-41z"/><path d="M52 75h55M52 91h38M137 105h53M137 122h37"/><circle cx="185" cy="47" r="13"/>',
writing:'<rect x="34" y="55" width="152" height="95" rx="9"/><path d="m34 60 76 55 76-55M34 150l55-48m97 48-55-48"/><path d="m165 44 10-10 23 23-10 10-23-23zm-5 5-34 34-5 19 19-5 34-34"/>',
speaking:'<rect x="31" y="31" width="177" height="100" rx="5"/><path d="M50 101l34-24 34 10 32-33 33 13M109 132v32m-32 0h64"/><circle cx="182" cy="142" r="16"/><path d="M157 187v-17c0-19 51-19 51 0v17M165 149l-17-20"/><path d="M58 47h49"/>',
interview:'<circle cx="64" cy="89" r="21"/><circle cx="177" cy="89" r="21"/><path d="M29 170v-35c0-30 70-30 70 0v35m44 0v-35c0-30 70-30 70 0v35M77 143h86M112 143v43"/><path d="M85 27h66v35h-22l-14 12V62H85zM98 43h7m11 0h7m11 0h5"/>'
};
function art(c){return '<svg class="course-illustration" viewBox="0 0 240 200" role="img" aria-label="'+escape(c.title)+' illustration"><rect width="240" height="200" rx="12" fill="#e7f0e6"/><circle cx="203" cy="36" r="32" fill="#d5ed98"/><g fill="#f7faf3" stroke="#176b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+scenes[c.art]+'</g></svg>';}
function coursePricing(c){
 const money=amount=>Number(amount).toLocaleString('en-GB')+' EGP';
 if(c.priceOptions)return '<div class="course-pricing">'+c.priceOptions.map(option=>'<div class="course-price-option"><p><del aria-label="Previous price: '+money(option.previous)+'">'+money(option.previous)+'</del> <strong>'+money(option.amount)+'</strong></p>'+(option.schedule.includes(' · ')?'<span>'+escape(option.schedule.split(' · ').slice(1).join(' · '))+'</span>':'')+'</div>').join('')+'</div>';
 if(c.price)return '<p class="course-pricing course-fixed-price"><strong>'+money(c.price)+'</strong></p>';
 if(c.id==='ielts')return '<p class="course-pricing"><a class="course-quote" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like a quote for '+c.title+'.'))+'">Get a quote</a></p>';
 return '';
}
let category='All courses';
function render(){const list=courses.filter(c=>matches(c,category,$('#search').value)).sort((a,b)=>Number(Boolean(a.comingSoon||a.dimmed))-Number(Boolean(b.comingSoon||b.dimmed)));$('#course-grid').innerHTML=list.length?list.map(c=>'<article class="course-card'+(c.comingSoon?' course-coming-soon':c.dimmed?' course-dimmed':'')+'">'+art(c)+'<div class="course-body"><span class="category">'+escape(c.level)+'</span><h3>'+escape(c.title)+'</h3><p class="course-summary">'+escape(c.summary||c.description)+'</p>'+(!c.comingSoon||c.id==='urgent-session'?coursePricing(c):'')+'<div class="course-view-row"><span>'+escape(c.duration)+'</span><button type="button" class="course-link" data-course="'+c.id+'">View course</button></div>'+'</div>'+((c.comingSoon||c.dimmed)?'<span class="upcoming-watermark">Stay tuned</span>':'')+'</article>').join(''):'<p class="empty">No courses match your search.</p>';}
function descriptionParagraphs(text){const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[text];const paragraphs=[];for(let i=0;i<sentences.length;i+=2)paragraphs.push('<p>'+escape(sentences.slice(i,i+2).join('').trim())+'</p>');return paragraphs.join('');}
function showCourse(id){const c=courses.find(c=>c.id===id);if(!c)return;$('#course-detail').classList.remove('course-detail-coming-soon');$('#course-detail').innerHTML=art(c)+'<p class="eyebrow">'+escape(c.level)+' · '+escape(c.duration)+'</p><h2>'+escape(c.title)+'</h2>'+'<h3>Course description</h3>'+descriptionParagraphs(c.viewDescription||c.description)+'<h3>What you’ll achieve</h3>'+descriptionParagraphs(c.outcomes||'')+(c.comingSoon?'<p class="coming-soon-label">Stay tuned</p>'+(c.id==='urgent-session'?coursePricing(c):''):coursePricing(c))+'<h3>What we’ll focus on</h3><ul class="course-topics">'+c.topics.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul><div class="detail-actions"><button type="button" class="button course-book-button" data-book-course="'+c.id+'">Book</button>'+(!c.comingSoon&&c.id==='ielts'?'<a class="button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like a quote for '+c.title+'.'))+'">Get a quote</a>':'')+(c.id==='general-8'?'<a class="button light course-trial-button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like to book a free trial session for '+c.title+'.'))+'">Book a free trial session</a>':'')+'</div>';$('#course-dialog').showModal();}
$('.filters').innerHTML=['All courses','General English','Session','Workshops','IELTS','Training','Kids','Others'].map((c,i)=>'<button class="filter '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'" data-category="'+c+'">'+c+'</button>').join('');
document.addEventListener('click',e=>{const booking=e.target.closest('[data-book-course]');if(booking){const course=courses.find(c=>c.id===booking.dataset.bookCourse);if(course){try{sessionStorage.setItem('speak-boldly-booking-course',course.title);}catch{}if($('#course-dialog').open)$('#course-dialog').close();window.location.hash='students-portal/calendar';}}const c=e.target.closest('[data-course]');if(c)showCourse(c.dataset.course);const f=e.target.closest('[data-category]');if(f){category=f.dataset.category;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});render();}const close=e.target.closest('.close');if(close)close.closest('dialog').close();});
$('#search').addEventListener('input',render);
$('#course-dialog').addEventListener('click',e=>{if(e.target.closest('.course-quote'))$('#course-dialog').close();});

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
 const corrections=placementCorrections(record.answers),review=document.createElement('section');review.className='placement-answer-review';review.setAttribute('aria-label','Answer review');const reviewTitle=document.createElement('h3');reviewTitle.textContent=corrections.length?'Questions to review · '+corrections.length:'All answers correct';review.append(reviewTitle);if(!corrections.length){const message=document.createElement('p');message.textContent='You answered all 50 questions correctly.';review.append(message);}else{const list=document.createElement('ol');list.style.paddingLeft='24px';for(const item of corrections){const q=questions[item.number-1],row=document.createElement('li');row.value=item.number;row.style.marginBottom='22px';const prompt=document.createElement('p'),chosen=document.createElement('p'),correct=document.createElement('p');prompt.textContent=q.question;chosen.textContent='Your answer: '+(item.selected===null?'Not answered':q.options[item.selected]);correct.textContent='Correct answer: '+q.options[item.correct];correct.style.fontWeight='600';row.append(prompt,chosen,correct);list.append(row);}const details=document.createElement('details'),summary=document.createElement('summary');summary.textContent='See answers to review';details.append(summary,list);review.append(details);}result.append(review);
 addResultBranding(document,result);
 addResultImageButton(document,window,result,'Speak Boldly — English assessment');
 const note=document.createElement('p');note.textContent='Send a voice note for your speaking assessment before starting your course.';result.append(note);
 const contact=document.createElement('a');contact.className='button';contact.href='#contact';contact.textContent='Contact us';result.append(contact);
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
function updateOffer(){document.querySelectorAll('.home-pricing-note').forEach(note=>{note.hidden=!offerIsActive();});}
updateOffer();setInterval(updateOffer,1000);
startAssessment();
renderPage();$('#year').textContent=new Date().getFullYear();render();

function openRequestedPlacement(){if(location.hash!=='#placement')return;try{if(sessionStorage.getItem('speak-boldly-open-placement')!=='yes')return;sessionStorage.removeItem('speak-boldly-open-placement');}catch{return;}document.querySelector('#assessment-start')?.click();}
window.addEventListener('hashchange',openRequestedPlacement);openRequestedPlacement();






