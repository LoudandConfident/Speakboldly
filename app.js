import { questions, TEST_VERSION } from './placement-questions.js';
import { scoreAnswers } from './placement-scoring.js';
import { EMAIL_ENDPOINT } from './placement-config.js';
import { buildResultEmail, emailResponseStatus } from './placement-email.js';

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
function showCourse(id){const c=courses.find(c=>c.id===id);if(!c)return;$('#course-detail').innerHTML=art(c)+'<p class="eyebrow">'+escape(c.level)+' · '+escape(c.duration)+'</p><h2>'+escape(c.title)+'</h2><p>'+escape(c.description)+'</p><h3>What we’ll focus on</h3><ul class="course-topics">'+c.topics.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul><div class="detail-actions"><a class="button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hi Mira Nasser! I would like a quote for '+c.title+'.'))+'">Get a quote</a>'+(c.id==='general'?'<a class="button light" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hi Mira Nasser! I would like to book a free trial session for '+c.title+'.'))+'">Book a free trial session</a>':'')+'</div>';$('#course-dialog').showModal();}
$('.filters').innerHTML=['All courses','General English','Workshops','IELTS'].map((c,i)=>'<button class="filter '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'" data-category="'+c+'">'+c+'</button>').join('');
document.addEventListener('click',e=>{const c=e.target.closest('[data-course]');if(c)showCourse(c.dataset.course);const f=e.target.closest('[data-category]');if(f){category=f.dataset.category;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});render();}const close=e.target.closest('.close');if(close)close.closest('dialog').close();});
$('#search').addEventListener('input',render);

const form=$('#placement-form'),storageKey='speak-boldly-'+TEST_VERSION;let locked=false,testPage=0;
const pageSize=10,pageCount=Math.ceil(questions.length/pageSize);
form.innerHTML='<div class="placement-participant"><p class="demo-note">Press Submit to see your estimated CEFR range immediately. </p></div><div class="test-submit-bar"><span id="answered-count">0 / '+questions.length+' answered</span><button class="button" type="submit">Submit my answers</button></div>'+questions.map(q=>'<fieldset class="placement-question"><legend>'+q.number+'. '+escape(q.question)+'</legend>'+q.options.map((option,j)=>'<label><input type="radio" name="q'+q.number+'" value="'+j+'"> '+String.fromCharCode(97+j)+') '+escape(option)+'</label>').join('')+'</fieldset>').join('')+'<div class="test-pager"><button type="button" class="button light" id="test-prev">Previous</button><span id="test-page-label"></span><button type="button" class="button light" id="test-next">Next</button></div><p class="demo-note">Selected from Language Hub. © Springer Nature Limited, 2019.</p><button class="button" type="submit">Submit my answers</button>';
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
 locked=false;testPage=0;form.reset();form.querySelectorAll('input,button').forEach(element=>element.disabled=false);const result=$('#placement-result');result.hidden=true;result.replaceChildren();count();renderPage();
}
window.addEventListener('hashchange',()=>{if(location.hash.slice(1).split('/')[0]!=='placement')clearAssessmentResult();});
window.addEventListener('pagehide',clearAssessmentResult);
function finish(record){
 locked=true;form.querySelectorAll('input,button').forEach(e=>{if(!['test-prev','test-next'].includes(e.id))e.disabled=true;});renderPage();
 const resultScore=scoreAnswers(record.answers);
 const result=$('#placement-result');result.hidden=false;
 result.innerHTML='<h3>Your estimated CEFR range: '+escape(resultScore.level)+'</h3><p class="placement-score"><strong>'+resultScore.score+' / '+resultScore.total+'</strong> correct · '+resultScore.percentage+'%</p>';
 const chart=document.createElement('section');chart.className='cefr-chart';chart.innerHTML='<h4>CEFR chart</h4><div style="overflow-x:auto"><table><thead><tr><th>Level</th><th>What you can do</th></tr></thead><tbody>'+[['A1','Use simple phrases and introduce yourself.'],['A2','Handle familiar topics and everyday exchanges.'],['B1','Explain experiences and manage most familiar situations.'],['B2','Discuss a wide range of topics and express clear opinions.'],['C1','Use English flexibly for complex professional and academic tasks.'],['C2','Understand and express complex ideas with precision.']].map(([level,description])=>'<tr'+(resultScore.level.includes(level)?' style="background:#edf4ef;font-weight:600"':'')+'><th scope="row">'+level+'</th><td>'+description+'</td></tr>').join('')+'</tbody></table></div>';result.append(chart);const note=document.createElement('p');note.textContent='A speaking assessment is required before starting your Speak Boldly course.';result.append(note);const contact=document.createElement('a');contact.className='button';contact.href='#contact';contact.textContent='Contact us';result.append(contact);
 return record;
}
async function sendResult(record){
 if(!EMAIL_ENDPOINT||!record.consent||record.emailStatus==='accepted'||record.emailStatus==='pending')return;
 record.emailStatus='pending';const controller=new AbortController();const timeout=setTimeout(()=>controller.abort(),20000);
 try{
  const response=await fetch(EMAIL_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(buildResultEmail(record)),signal:controller.signal});
  if(!response.ok)throw new Error('Email request failed');record.emailStatus=emailResponseStatus(await response.json());
 }catch{record.emailStatus='failed';}finally{clearTimeout(timeout);}
}
form.addEventListener('submit',e=>{
 e.preventDefault();if(locked||!form.reportValidity()||!confirm('Submit now? Your score and estimated level will appear immediately. You cannot change your answers afterwards.'))return;
 const answers=collectAnswers();
 const record={version:TEST_VERSION,attemptId:crypto.randomUUID(),answers,answered:Object.keys(answers).length,submittedAt:new Date().toISOString(),consent:Boolean(EMAIL_ENDPOINT),emailStatus:'not-sent'};
 finish(record);sendResult(record);$('#placement-result').scrollIntoView({behavior:'smooth'});
});
renderPage();$('#year').textContent=new Date().getFullYear();render();
