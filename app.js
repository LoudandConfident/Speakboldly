import {offerIsActive} from './assessment-time.js';
import {courseIllustration as art} from './course-illustrations.js?v=1';
import {coursePaths} from './public-seo-routes.js';

import {courses,matches} from './courses.js?v=pronunciation-intonation-1';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const chat=message=>'mailto:Contactus@speakboldly.space?subject='+encodeURIComponent('English coaching enquiry')+'&body='+encodeURIComponent(message+'\n\nContact number: 01283786904');
function coursePricing(c){
 const money=amount=>Number(amount).toLocaleString('en-GB')+' EGP';
 if(c.priceOptions)return '<div class="course-pricing">'+c.priceOptions.map(option=>'<div class="course-price-option"><p><del aria-label="Previous price: '+money(option.previous)+'">'+money(option.previous)+'</del> <strong>'+money(option.amount)+'</strong></p>'+(option.schedule.includes(' · ')?'<span>'+escape(option.schedule.split(' · ').slice(1).join(' · '))+'</span>':'')+'</div>').join('')+'</div>';
 if(c.price)return '<p class="course-pricing course-fixed-price"><strong>'+money(c.price)+'</strong></p>';
 if(c.id==='ielts')return '<p class="course-pricing"><a class="course-quote" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like a quote for '+c.title+'.'))+'">Get a quote</a></p>';
 return '';
}
let category='All courses';
function render(){const list=courses.filter(c=>matches(c,category,$('#search').value)).sort((a,b)=>Number(Boolean(a.comingSoon||a.dimmed))-Number(Boolean(b.comingSoon||b.dimmed)));$('#course-grid').innerHTML=list.length?list.map(c=>'<article class="course-card'+(c.comingSoon?' course-coming-soon':c.dimmed?' course-dimmed':'')+'">'+art(c)+'<div class="course-body"><span class="category">'+escape(c.level)+'</span><h3>'+(coursePaths[c.id]?'<a href="'+coursePaths[c.id]+'">'+escape(c.displayTitle||c.title)+'</a>':escape(c.displayTitle||c.title))+'</h3><p class="course-summary">'+escape(c.summary||c.description)+'</p>'+(!c.comingSoon||c.id==='urgent-session'?coursePricing(c):'')+'<div class="course-view-row"><span>'+escape(c.duration)+'</span><button type="button" class="course-link" data-course="'+c.id+'">View course</button></div>'+'</div>'+((c.comingSoon||c.dimmed)?'<span class="upcoming-watermark">Stay tuned</span>':'')+'</article>').join(''):'<p class="empty">No courses match your search.</p>';}
function descriptionParagraphs(text){const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[text];const paragraphs=[];for(let i=0;i<sentences.length;i+=2)paragraphs.push('<p>'+escape(sentences.slice(i,i+2).join('').trim())+'</p>');return paragraphs.join('');}
function showCourse(id){const c=courses.find(c=>c.id===id);if(!c)return;$('#course-detail').classList.remove('course-detail-coming-soon');$('#course-detail').innerHTML=art(c)+'<p class="eyebrow">'+escape(c.level)+' · '+escape(c.duration)+'</p><h2>'+escape(c.displayTitle||c.title)+'</h2>'+'<h3>Course description</h3>'+descriptionParagraphs(c.viewDescription||c.description)+'<h3>What you’ll achieve</h3>'+descriptionParagraphs(c.outcomes||'')+(c.comingSoon?'<p class="coming-soon-label">Stay tuned</p>'+(c.id==='urgent-session'?coursePricing(c):''):coursePricing(c))+'<h3>What we’ll focus on</h3><ul class="course-topics">'+c.topics.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul><div class="detail-actions"><button type="button" class="button course-book-button" data-book-course="'+c.id+'">Book</button>'+(!c.comingSoon&&c.id==='ielts'?'<a class="button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like a quote for '+c.title+'.'))+'">Get a quote</a>':'')+(c.id==='general-8'?'<a class="button light course-trial-button" target="_blank" rel="noopener noreferrer" href="'+escape(chat('Hello! I would like to book a free trial session for '+c.title+'.'))+'">Book a free trial session</a>':'')+'</div>';if(coursePaths[c.id]){const full=document.createElement('a');full.href=coursePaths[c.id];full.className='email-link course-public-page';full.textContent='Read full course details';$('#course-detail').append(full);}$('#course-dialog').showModal();}
$('.filters').innerHTML=['All courses','General English','Session','Workshops','IELTS','Training','Kids','Others'].map((c,i)=>'<button class="filter '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'" data-category="'+c+'">'+c+'</button>').join('');
document.addEventListener('click',e=>{const booking=e.target.closest('[data-book-course]');if(booking){const course=courses.find(c=>c.id===booking.dataset.bookCourse);if(course){try{sessionStorage.setItem('speak-boldly-booking-course',course.title);}catch{}if($('#course-dialog').open)$('#course-dialog').close();window.location.hash='students-portal/calendar';}}const c=e.target.closest('[data-course]');if(c)showCourse(c.dataset.course);const f=e.target.closest('[data-category]');if(f){category=f.dataset.category;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});render();}const close=e.target.closest('.close');if(close)close.closest('dialog').close();});
$('#search').addEventListener('input',render);
$('#course-dialog').addEventListener('click',e=>{if(e.target.closest('.course-quote'))$('#course-dialog').close();});

function updateOffer(){document.querySelectorAll('.home-pricing-note').forEach(note=>{note.hidden=!offerIsActive();});}
updateOffer();setInterval(()=>{if(!document.hidden&&location.hash==='#home')updateOffer();},60000);window.addEventListener('hashchange',updateOffer);window.addEventListener('pageshow',updateOffer);
$('#year').textContent=new Date().getFullYear();render();

function openRequestedPlacement(){if(location.hash!=='#placement')return;try{if(sessionStorage.getItem('speak-boldly-open-placement')!=='yes')return;sessionStorage.removeItem('speak-boldly-open-placement');}catch{return;}document.querySelector('#assessment-start')?.click();}
window.addEventListener('hashchange',openRequestedPlacement);openRequestedPlacement();






