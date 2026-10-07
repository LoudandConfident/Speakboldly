import { questions, TEST_VERSION } from './placement-questions.js';
import { scoreAnswers } from './placement-scoring.js';
import { RESULTS_ENDPOINT } from './placement-config.js';

import {courses,matches} from './courses.js';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chat=message=>'https://wa.me/201050226476?text='+encodeURIComponent(message);
const scenes={
ielts:'<rect x="61" y="29" width="116" height="143" rx="8"/><path d="M91 29v-10h56v10M83 69h58M83 88h72M83 107h47M83 126h59"/><circle cx="180" cy="144" r="27"/><path d="M180 126v18l12 9"/>',
general:'<path d="M35 53h91v63H60l-25 20z"/><path d="M119 83h90v64h-24l-25 18v-18h-41z"/><path d="M52 75h55M52 91h38M137 105h53M137 122h37"/><circle cx="185" cy="47" r="13"/>',
writing:'<rect x="34" y="55" width="152" height="95" rx="9"/><path d="m34 60 76 55 76-55M34 150l55-48m97 48-55-48"/><path d="m165 44 10-10 23 23-10 10-23-23zm-5 5-34 34-5 19 19-5 34-34"/>',
speaking:'<rect x="31" y="31" width="177" height="100" rx="5"/><path d="M50 101l34-24 34 10 32-33 33 13M109 132v32m-32 0h64"/><circle cx="182" cy="142" r="16"/><path d="M157 187v-17c0-19 51-19 51 0v17M165 149l-17-20"/><path d="M58 47h49"/>',
interview:'<circle cx="64" cy="89" r="21"/><circle cx="177" cy="89" r="21"/><path d="M29 170v-35c0-30 70-30 70 0v35m44 0v-35c0-30 70-30 70 0v35M77 143h86M112 143v43"/><path d="M85 27h66v35h-22l-14 12V62H85zM98 43h7m11 0h7m11 0h5"/>'
};
function art(c){return '<svg class="course-illustration" viewBox="0 0 240 200" role="img" aria-label="'+escape(c.title)+' illustration"><rect width="240" height="200" rx="12" fill="#e7f0e6"/><circle cx="203" cy="36" r="32" fill="#d5ed98"/><g fill="#f7faf3" stroke="#176b3a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">'+scenes[c.art]+'</g></svg>';}
let category='All courses';
function render(){const list=courses.filter(c=>matches(c,category,$('#search').value));$('#course-grid').innerHTML=list.length?list.map(c=>'<article class="course-card">'+art(c)+'<div class="course-body"><span class="category">'+escape(c.level)+'</span><h3>'+escape(c.title)+'</h3><p class="course-summary">'+escape(c.description)+'</p><div class="card-bottom"><span>'+escape(c.duration)+'</span><button class="course-link" data-course="'+c.id+'">View course ↗</button></div></div></article>').join(''):'<p class="empty">No courses match your search.</p>';}
function showCourse(id){const c=courses.find(c=>c.id===id);if(!c)return;$('#course-detail').innerHTML=art(c)+'<p class="eyebrow">'+escape(c.level)+' · '+escape(c.duration)+'</p><h2>'+escape(c.title)+'</h2><p>'+escape(c.description)+'</p><h3>What we’ll focus on</h3><ul class="course-topics">'+c.topics.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul><div class="detail-actions"><a class="button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hi Mira! I would like a quote for '+c.title+'. Please send a quotation valid for one month.'))+'">Get a quote — valid for a month</a><a class="button light" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hi Mira! I would like to book a free trial session for '+c.title+'.'))+'">Book a free trial session</a></div>';$('#course-dialog').showModal();}
$('.filters').innerHTML=['All courses','General English','Workshops','IELTS'].map((c,i)=>'<button class="filter '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'" data-category="'+c+'">'+c+'</button>').join('');
document.addEventListener('click',e=>{const c=e.target.closest('[data-course]');if(c)showCourse(c.dataset.course);const f=e.target.closest('[data-category]');if(f){category=f.dataset.category;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});render();}const close=e.target.closest('.close');if(close)close.closest('dialog').close();});
$('#search').addEventListener('input',render);

const form=$('#placement-form'),storageKey='speak-boldly-'+TEST_VERSION;let locked=false,testPage=0;
const pageSize=10,pageCount=Math.ceil(questions.length/pageSize);
form.innerHTML='<div class="placement-participant"><p class="demo-note">Your result is an estimate, not a certificate. '+(RESULTS_ENDPOINT?'Your answers are sent for grading. If you agree, only your anonymous score, estimated level, number of questions answered, and submission time will be stored in Mira’s private results sheet. No name, email, or answer choices are stored.':'Your score will be shown here. Central results collection is not connected yet; nothing will be sent to Mira automatically.')+'</p>'+(RESULTS_ENDPOINT?'<label class="placement-consent"><input name="resultsConsent" type="checkbox" required> I agree to share my anonymous result with Mira for level analysis. No name or email is collected.</label>':'')+'</div><div class="test-submit-bar"><span id="answered-count">0 / '+questions.length+' answered</span><button class="button" type="submit">Submit my answers</button></div>'+questions.map(q=>'<fieldset class="placement-question"><legend>'+q.number+'. '+escape(q.question)+'</legend>'+q.options.map((option,j)=>'<label><input type="radio" name="q'+q.number+'" value="'+j+'"> '+String.fromCharCode(97+j)+') '+escape(option)+'</label>').join('')+'<button class="course-link" type="button" data-clear="'+q.number+'">Leave blank</button></fieldset>').join('')+'<div class="test-pager"><button type="button" class="button light" id="test-prev">Previous</button><span id="test-page-label"></span><button type="button" class="button light" id="test-next">Next</button></div><p class="demo-note">Selected from Language Hub. © Springer Nature Limited, 2019.</p><button class="button" type="submit">Submit my answers</button>';
const fields=[...form.querySelectorAll('.placement-question')];
function renderPage(){fields.forEach((f,i)=>f.hidden=Math.floor(i/pageSize)!==testPage);$('#test-page-label').textContent='Page '+(testPage+1)+' of '+pageCount;$('#test-prev').disabled=testPage===0;$('#test-next').disabled=testPage===pageCount-1;}
$('#test-prev').onclick=()=>{if(testPage>0){testPage--;renderPage();form.scrollIntoView({behavior:'smooth'});}};
$('#test-next').onclick=()=>{if(testPage<pageCount-1){testPage++;renderPage();form.scrollIntoView({behavior:'smooth'});}};
function collectAnswers(){return Object.fromEntries([...new FormData(form)].filter(([name])=>/^q\d+$/.test(name)));}
function count(){ $('#answered-count').textContent=Object.keys(collectAnswers()).length+' / '+questions.length+' answered';}
form.addEventListener('change',count);
form.addEventListener('click',e=>{const b=e.target.closest('[data-clear]');if(b&&!locked){form.querySelectorAll('[name="q'+b.dataset.clear+'"]').forEach(i=>i.checked=false);count();}});
function remember(record){try{localStorage.setItem(storageKey,JSON.stringify(record));}catch{}}
function finish(record){
 locked=true;form.querySelectorAll('input,button').forEach(e=>{if(!['test-prev','test-next'].includes(e.id))e.disabled=true;});renderPage();
 const resultScore=scoreAnswers(record.answers);const summary='Speak Boldly — Language Hub placement test\n60 questions only\nEstimated level: '+resultScore.level+'\nScore: '+resultScore.score+' / '+resultScore.total+' ('+resultScore.percentage+'%)\nSubmitted: '+record.submittedAt+'\n'+questions.map(q=>{const v=record.answers['q'+q.number];return q.number+'. '+(v===undefined?'Unanswered':String.fromCharCode(97+Number(v))+') '+q.options[Number(v)]);}).join('\n');
 const result=$('#placement-result');result.hidden=false;
 result.innerHTML='<h3>Your estimated level: '+escape(resultScore.level)+'</h3><p class="placement-score"><strong>'+resultScore.score+' / '+resultScore.total+'</strong> correct · '+resultScore.percentage+'%</p><p>'+resultScore.answered+' / '+resultScore.total+' questions answered. Unanswered questions count as incorrect. Your submitted answers are locked.</p><p>This shortened grammar test gives a provisional estimate, not a certified CEFR level. A teacher assessment, including speaking and listening, is needed to confirm your level.</p><p id="results-save-status" role="status"></p><button type="button" class="button light" id="retry-results" hidden>Retry saving my result</button><p>You can also send your result to Mira by email. Press Send in your email app to deliver it.</p><a class="button" href="'+escape('mailto:mira.nasser.louis.saleh@gmail.com?subject='+encodeURIComponent('My Language Hub placement result')+'&body='+encodeURIComponent(summary))+'">Send result by email ↗</a> <button type="button" class="button light" id="download-answers">Download my result</button>';
 $('#download-answers').onclick=()=>{const url=URL.createObjectURL(new Blob([summary],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='my-placement-result.txt';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
 $('#retry-results').onclick=()=>sendResult(record);showSaveStatus(record);return record;
}
function showSaveStatus(record){
 const status=$('#results-save-status');const retry=$('#retry-results');retry.hidden=true;
 if(record.saveStatus==='saved'){status.textContent='Your result was saved to Mira’s private results sheet.';return;}
 if(!RESULTS_ENDPOINT){status.textContent='Your result is saved in this browser only. It has not been sent to Mira automatically.';return;}
 if(!record.consent){status.textContent='Your result has not been shared with Mira.';return;}
 if(record.saveStatus==='failed'){status.textContent='Your score is ready, but your result could not be saved to Mira’s sheet. Please retry or send it by email.';retry.hidden=false;return;}
 status.textContent='Saving your result to Mira’s private sheet…';
}
async function sendResult(record){
 if(!RESULTS_ENDPOINT||!record.consent||record.saveStatus==='saved')return;
 record.saveStatus='pending';showSaveStatus(record);const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(RESULTS_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({version:TEST_VERSION,attemptId:record.attemptId,answers:record.answers,consent:true}),signal:controller.signal});
  if(!response.ok)throw new Error('Save failed');const data=await response.json();if(!data.ok||data.attemptId!==record.attemptId)throw new Error('Save was not confirmed');
  record.saveStatus='saved';
 }catch{record.saveStatus='failed';}finally{clearTimeout(timeout);remember(record);showSaveStatus(record);}
}
form.addEventListener('submit',e=>{
 e.preventDefault();if(locked||!form.reportValidity()||!confirm('Submit now? Your score and estimated level will appear immediately. You cannot change your answers afterwards.'))return;
 const fields=new FormData(form),answers=collectAnswers();
 const record={version:TEST_VERSION,attemptId:crypto.randomUUID(),answers,answered:Object.keys(answers).length,submittedAt:new Date().toISOString(),consent:fields.get('resultsConsent')==='on',saveStatus:RESULTS_ENDPOINT?'pending':'not-connected'};
 remember(record);finish(record);sendResult(record);$('#placement-result').scrollIntoView({behavior:'smooth'});
});
try{const record=JSON.parse(localStorage.getItem(storageKey)||'null');if(record&&record.answers){for(const [name,value]of Object.entries(record.answers)){const input=form.querySelector('input[name="'+name+'"][value="'+value+'"]');if(input)input.checked=true;}count();finish(record);if(record.saveStatus==='pending')sendResult(record);}}catch{}
window.addEventListener('storage',e=>{if(e.key===storageKey&&e.newValue){try{finish(JSON.parse(e.newValue));}catch{}}});
renderPage();$('#year').textContent=new Date().getFullYear();render();
