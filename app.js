import {practiceForLevel} from './assessment-guidance.js';
import {addResultImageButton,addResultBranding} from './result-image.js?v=branded-results';
import { ASSESSMENT_DURATION_MS, remainingSeconds, formatTime, offerIsActive } from './assessment-time.js';
import { questions, TEST_VERSION } from './placement-questions.js';
import { scoreAnswers } from './placement-scoring.js';

import {courses,matches} from './courses.js';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chat=message=>'https://wa.me/201050226476?text='+encodeURIComponent(message);
const scenes={
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
function render(){const list=courses.filter(c=>matches(c,category,$('#search').value));$('#course-grid').innerHTML=list.length?list.map(c=>'<article class="course-card'+(c.comingSoon?' course-coming-soon':c.dimmed?' course-dimmed':'')+'">'+art(c)+'<div class="course-body"><span class="category">'+escape(c.level)+'</span><h3>'+escape(c.title)+'</h3><p class="course-summary">'+escape(c.summary||c.description)+'</p>'+(!c.comingSoon||c.id==='urgent-session'?coursePricing(c):'')+'<div class="course-view-row"><span>'+escape(c.duration)+'</span><button type="button" class="course-link" data-course="'+c.id+'">View course</button></div>'+(c.comingSoon?'<span class="coming-soon-label">Stay tuned</span>':'')+'</div></article>').join(''):'<p class="empty">No courses match your search.</p>';}
function descriptionParagraphs(text){const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[text];const paragraphs=[];for(let i=0;i<sentences.length;i+=2)paragraphs.push('<p>'+escape(sentences.slice(i,i+2).join('').trim())+'</p>');return paragraphs.join('');}
function showCourse(id){const c=courses.find(c=>c.id===id);if(!c)return;$('#course-detail').classList.remove('course-detail-coming-soon');$('#course-detail').innerHTML=art(c)+'<p class="eyebrow">'+escape(c.level)+' · '+escape(c.duration)+'</p><h2>'+escape(c.title)+'</h2>'+descriptionParagraphs(c.description)+(c.detailDescription?'<p>'+escape(c.detailDescription)+'</p>':'')+(c.comingSoon?'<p class="coming-soon-label">Stay tuned</p>'+(c.id==='urgent-session'?coursePricing(c):''):coursePricing(c))+'<h3>What we’ll focus on</h3><ul class="course-topics">'+c.topics.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul><div class="detail-actions"><button type="button" class="button course-book-button" data-book-course="'+c.id+'">Book</button>'+(!c.comingSoon&&c.id==='ielts'?'<a class="button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like a quote for '+c.title+'.'))+'">Get a quote</a>':'')+(c.id==='general-8'?'<a class="button light course-trial-button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like to book a free trial session for '+c.title+'.'))+'">Book a free trial session</a>':'')+'</div>';$('#course-dialog').showModal();}
$('.filters').innerHTML=['All courses','General English','Workshops','IELTS','Training','Kids','Others'].map((c,i)=>'<button class="filter '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'" data-category="'+c+'">'+c+'</button>').join('');
document.addEventListener('click',e=>{const booking=e.target.closest('[data-book-course]');if(booking){const course=courses.find(c=>c.id===booking.dataset.bookCourse);if(course){$('#booking-program-name').textContent=course.title;$('#booking-whatsapp').href=chat('Hello! I would like to book '+course.title+' and send my 2-minute voice note to determine my English level.');if($('#course-dialog').open)$('#course-dialog').close();$('#program-booking-dialog').showModal();}}const c=e.target.closest('[data-course]');if(c)showCourse(c.dataset.course);const f=e.target.closest('[data-category]');if(f){category=f.dataset.category;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});render();}const close=e.target.closest('.close');if(close)close.closest('dialog').close();});
$('#search').addEventListener('input',render);
$('#course-dialog').addEventListener('click',e=>{if(e.target.closest('.course-quote'))$('#course-dialog').close();});

const form=$('#placement-form'),storageKey='speak-boldly-'+TEST_VERSION;let locked=false,testPage=0,deadline=null,timerInterval=null;
const pageSize=10,pageCount=Math.ceil(questions.length/pageSize);
form.innerHTML='<div class="placement-participant"><p class="demo-note">Press Submit to see your estimated CEFR range immediately. </p></div><div class="test-submit-bar"><span id="assessment-timer" class="assessment-timer" role="timer" aria-label="Time remaining">20:00 remaining</span><span id="answered-count">0 / '+questions.length+' answered</span><button class="button" type="submit">Submit my answers</button></div>'+questions.map(q=>'<fieldset class="placement-question"><legend>'+q.number+'. '+escape(q.question)+'</legend>'+q.options.map((option,j)=>'<label><input type="radio" name="q'+q.number+'" value="'+j+'"> '+String.fromCharCode(97+j)+') '+escape(option)+'</label>').join('')+'</fieldset>').join('')+'<div class="test-pager"><button type="button" class="button light" id="test-prev">Previous</button><span id="test-page-label"></span><button type="button" class="button light" id="test-next">Next</button></div><p class="demo-note">Selected from Language Hub. © Springer Nature Limited, 2019.</p><button class="button" type="submit">Submit my answers</button>';
const fields=[...form.querySelectorAll('.placement-question')];
function renderPage(){fields.forEach((f,i)=>f.hidden=Math.floor(i/pageSize)!==testPage);$('#test-page-label').textContent='Page '+(testPage+1)+' of '+pageCount;$('#test-prev').disabled=testPage===0;$('#test-next').disabled=testPage===pageCount-1;}
$('#test-prev').onclick=()=>{if(testPage>0){testPage--;renderPage();form.scrollIntoView({behavior:'smooth'});}};
$('#test-next').onclick=()=>{if(testPage<pageCount-1){testPage++;renderPage();form.scrollIntoView({behavior:'smooth'});}};
function collectAnswers(){return Object.fromEntries([...new FormData(form)].filter(([name])=>/^q\d+$/.test(name)));}
function count(){ $('#answered-count').textContent=Object.keys(collectAnswers()).length+' / '+questions.length+' answered';}
form.addEventListener('change',count);
// Clear legacy saved results; assessment feedback lasts only while this page is open.
try{localStorage.removeItem(storageKey);}catch{}
function clearAssessmentResult(){
 clearInterval(timerInterval);timerInterval=null;deadline=null;locked=false;testPage=0;$('#assessment-timer').textContent='20:00 remaining';$('#assessment-timer').classList.remove('is-urgent');form.reset();form.querySelectorAll('input,button').forEach(element=>element.disabled=false);const result=$('#placement-result');result.hidden=true;result.replaceChildren();count();renderPage();
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
 if(deadline===null&&!locked){deadline=Date.now()+ASSESSMENT_DURATION_MS;timerInterval=setInterval(tickTimer,250);tickTimer();}
}
document.addEventListener('assessment-open',startAssessment);
window.addEventListener('hashchange',startAssessment);
window.addEventListener('pageshow',startAssessment);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)tickTimer();});
form.addEventListener('change',tickTimer);

window.addEventListener('pagehide',clearAssessmentResult);
function finish(record){
 locked=true;clearInterval(timerInterval);timerInterval=null;form.querySelectorAll('input,button').forEach(e=>{if(!['test-prev','test-next'].includes(e.id))e.disabled=true;});renderPage();
 const resultScore=scoreAnswers(record.answers);
 const result=$('#placement-result');result.hidden=false;
 result.classList.add('assessment-result');
 result.innerHTML='<h3>Estimated level range: '+escape(resultScore.level)+'</h3><p class="placement-score"><strong>'+resultScore.score+' / '+resultScore.total+'</strong> · '+resultScore.percentage+'%</p>';
 const chart=document.createElement('section');chart.className='cefr-chart';chart.innerHTML='<h4>CEFR chart</h4><div class="cefr-level-chart">'+[['A1','Beginner'],['A2','Elementary'],['B1','Intermediate'],['B2','Upper intermediate'],['C1','Advanced'],['C2','Proficient']].map(([level,label])=>'<div class="cefr-level'+(resultScore.level.includes(level)?' is-result':'')+'"><strong>'+level+'</strong><span>'+label+'</span></div>').join('')+'</div>';result.append(chart);
 const guidance=practiceForLevel(resultScore.level);
 const priorities=document.createElement('section');priorities.className='result-practice';
 priorities.innerHTML='<h3>What to work on next</h3><p>Suggested priorities for your estimated range. Your teacher can refine these after speaking and listening assessment.</p>'+[['Structure of language',guidance.structure],['Vocabulary and meaning',guidance.vocabulary],['Using English',guidance.use],['On your own',guidance.routine]].map(([heading,text])=>'<h4>'+escape(heading)+'</h4><p>'+escape(text)+'</p>').join('');result.append(priorities);
 const estimate=document.createElement('p');estimate.textContent='This shortened test gives a provisional estimate, not a certified CEFR level.';result.append(estimate);
 addResultBranding(document,result);
 addResultImageButton(document,window,result,'Speak Boldly — English assessment');
 const note=document.createElement('p');note.textContent='Send a voice note for your speaking assessment before starting your course.';result.append(note);
 const contact=document.createElement('a');contact.className='button';contact.href='#contact';contact.textContent='Contact us';result.append(contact);
 return record;
}
function submitAssessment(timedOut=false){
 if(locked||deadline===null)return;
 const expired=remainingSeconds(deadline)===0;
 if(!timedOut&&!expired&&(!form.reportValidity()||!confirm('Submit now? Your score and estimated level will appear immediately. You cannot change your answers afterwards.')))return;
 // A confirmation dialog can remain open past the deadline.
 const autoSubmitted=timedOut||remainingSeconds(deadline)===0;
 const answers=collectAnswers();
 const record={version:TEST_VERSION,attemptId:crypto.randomUUID(),answers,answered:Object.keys(answers).length,submittedAt:new Date().toISOString(),consent:false,emailStatus:'disabled'};
 finish(record);
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
