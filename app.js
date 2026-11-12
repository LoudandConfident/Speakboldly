import {openSection} from './section-navigation.js';
import {offerIsActive} from './assessment-time.js';
import {courseIllustration as art} from './course-illustrations.js?v=outings-22';
import {coursePaths} from './public-seo-routes.js?v=outings-22';

import {courses,matches,compareCatalogCourses} from './courses.js?v=stay-tuned-23';
const $=s=>document.querySelector(s);
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const durationLabel=c=>c.id==='english-day-out'?'One day · guided outing':c.sessionDuration+' / session';
const cadenceLabel=c=>c.plannedYear?'Planned for '+c.plannedYear:c.id==='general-8'?'8 sessions / month · Twice a week':c.id==='general-4'?'4 sessions / month · Once a week':c.id==='english-momentum'?'16 sessions / month':c.category==='Pro Services'?'By arrangement':c.duration+' · '+(c.programKind==='Workshop'?'Focused workshop':'Professional development');
const quoteLink=(c,className='course-quote')=>'<a class="'+className+'" href="'+escape(chat('Hello! I would like a quote for '+c.title+'.'))+'">Get a quote</a>';
const chat=message=>'mailto:Contactus@speakboldly.space?subject='+encodeURIComponent('English coaching enquiry')+'&body='+encodeURIComponent(message+'\n\nContact number: 01283786904');
function coursePricing(c){
 const money=amount=>Number(amount).toLocaleString('en-GB')+' EGP';
 if(c.quoteOnly)return '<p class="course-pricing">A quote tailored to your needs.</p>';
 if(c.priceOptions)return '<div class="course-pricing">'+c.priceOptions.map(option=>'<div class="course-price-option"><p><del aria-label="Previous price: '+money(option.previous)+'">'+money(option.previous)+'</del> <strong>'+money(option.amount)+'</strong></p>'+''+'</div>').join('')+'</div>';
 if(c.price)return '<p class="course-pricing course-fixed-price"><strong>'+money(c.price)+'</strong></p>';
 return '';
}
let category='All courses';
function render(){
 const bookingCircle=document.querySelector('#courses .course-booking-note');if(bookingCircle)bookingCircle.hidden=false;
 const list=courses.filter(c=>matches(c,category,$('#search').value)).sort(compareCatalogCourses);
 $('#course-grid').innerHTML=list.length?list.map(c=>{const closed=c.comingSoon||c.dimmed;const label=c.audienceBadge||c.programKind;const price=closed?'<p class="course-price-note">'+(c.plannedYear?'In planning for '+c.plannedYear:'Bookings not open yet')+'</p>':c.quoteOnly?'<p class="course-price-note">Personal quote · tailored to your needs</p>':coursePricing(c);
 const primary=closed?'':c.quoteOnly?quoteLink(c,'button small course-quote'):'<button type="button" class="button small" data-book-course="'+c.id+'">Book</button>';
 return '<article class="course-card'+(closed?' course-preview-dimmed':'')+'" data-preview-course="'+c.id+'">'+art(c)+'<div class="course-body"><span class="program-badge">'+escape(label)+'</span><h3><button type="button" data-course="'+c.id+'">'+escape(c.displayTitle||c.title)+'</button></h3><p class="program-meta"><span>'+escape(durationLabel(c))+'</span><span>'+escape(cadenceLabel(c))+'</span></p><p class="course-summary">'+escape(c.summary||c.description)+'</p><div class="program-price-slot">'+price+'</div><div class="program-actions"><button type="button" class="course-link" data-course="'+c.id+'">View course</button>'+primary+'</div></div>'+((closed&&!c.noWatermark)?'<span class="program-preview-watermark">'+(c.plannedYear?'Planned for 2027':'Stay Tuned')+'</span>':'')+'</article>';}).join(''):'<p class="empty">No programs match your search.</p>';
}
function descriptionParagraphs(text){const sentences=text.match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)||[text];const paragraphs=[];for(let i=0;i<sentences.length;i+=2)paragraphs.push('<p>'+escape(sentences.slice(i,i+2).join('').trim())+'</p>');return paragraphs.join('');}
function showCourse(id){
 const c=courses.find(c=>c.id===id);if(!c)return;const closed=c.comingSoon||c.dimmed;
 const action=closed?'':c.quoteOnly?quoteLink(c,'button course-quote'):'<button type="button" class="button course-book-button" data-book-course="'+c.id+'">Book this program</button>';
 $('#course-detail').className=closed?'course-detail-preview-dimmed':'';
 $('#course-detail').innerHTML='<div class="course-detail-content">'+art(c)+'<p class="eyebrow">'+escape(c.audienceBadge||c.programKind)+'</p><h2>'+escape(c.displayTitle||c.title)+'</h2><p class="program-meta"><span>'+escape(durationLabel(c))+'</span><span>'+escape(cadenceLabel(c))+'</span></p>'+descriptionParagraphs(c.programPlan||c.viewDescription||c.description)+'<h3>What you’ll work towards</h3>'+descriptionParagraphs(c.outcomes||'')+'<h3>What we’ll focus on</h3><ul class="course-topics">'+c.topics.map(t=>'<li>'+escape(t)+'</li>').join('')+'</ul>'+(!closed?coursePricing(c):'')+'</div>'+(closed?'<p class="program-booking-status">'+(c.plannedYear?'Planned for 2027. Details will be confirmed before booking opens.':'Bookings are not open yet.')+'</p>':'')+'<div class="detail-actions">'+action+'</div>';
 $('#course-dialog').showModal();
}
$('.filters').innerHTML=['All courses','General English','Workshops','Pro Services','Professional development','Coming in 2027'].map((c,i)=>'<button class="filter '+(i===0?'active':'')+'" aria-pressed="'+(i===0)+'" data-category="'+c+'">'+c+'</button>').join('');
document.addEventListener('click',e=>{const booking=e.target.closest('[data-book-course]');if(booking){const course=courses.find(c=>c.id===booking.dataset.bookCourse);if(course&&!course.comingSoon&&!course.dimmed){try{sessionStorage.setItem('speak-boldly-booking-course',course.title);}catch{}openSection(document,'students-portal/calendar');}}const c=e.target.closest('[data-course]');if(c)showCourse(c.dataset.course);const f=e.target.closest('[data-category]');if(f){category=f.dataset.category;document.querySelectorAll('.filter').forEach(b=>{b.classList.toggle('active',b===f);b.setAttribute('aria-pressed',String(b===f));});render();}const close=e.target.closest('.close');if(close)close.closest('dialog').close();});
$('#search').addEventListener('input',render);
$('#course-dialog').addEventListener('click',e=>{if(e.target.closest('.course-quote'))$('#course-dialog').close();});

function updateOffer(){document.querySelectorAll('.home-pricing-note').forEach(note=>{note.hidden=!offerIsActive();});}
updateOffer();setInterval(()=>{if(!document.hidden&&location.hash==='#home')updateOffer();},60000);window.addEventListener('hashchange',updateOffer);window.addEventListener('pageshow',updateOffer);
$('#year').textContent=new Date().getFullYear();render();

function openRequestedPlacement(){if(location.hash!=='#placement')return;try{if(sessionStorage.getItem('speak-boldly-open-placement')!=='yes')return;sessionStorage.removeItem('speak-boldly-open-placement');}catch{return;}document.querySelector('#assessment-start')?.click();}
window.addEventListener('hashchange',openRequestedPlacement);openRequestedPlacement();






