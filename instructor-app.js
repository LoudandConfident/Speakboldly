import {initializePersonalCalendar} from './personal-calendar.js';
import './admin-portal.js?v=january-learning-2';
import {clientSheetConnected} from './client-sheet.js?v=level-history';
const SESSION='speak-boldly-instructor-app-session-v1';
const dashboard=document.querySelector('#admin-dashboard'),clientPage=document.querySelector('#admin-client-page'),login=document.querySelector('#admin-login-form'),dialog=document.querySelector('#teacher-login-dialog'),nav=document.querySelector('.app-nav'),lock=document.querySelector('#app-lock'),message=document.querySelector('#app-locked-message');
if(!location.hash.startsWith('#students-portal')){const url=new URL(location.href);url.hash='students-portal/teacher';history.replaceState(null,'',url);}
const hidden=(node,value)=>{if(node.hidden!==value)node.hidden=value;};
function state(){const unlocked=!dashboard.hidden;hidden(nav,!unlocked||!clientPage.hidden);hidden(message,unlocked);lock.textContent=unlocked?'Lock':'Unlock';document.body.classList.toggle('app-connected',clientSheetConnected());if(unlocked)try{sessionStorage.setItem(SESSION,'1');}catch{}}
function unlock(){if(!dialog.open){dialog.showModal();document.querySelector('#admin-code').focus();}}
lock.onclick=()=>{if(!dashboard.hidden){try{sessionStorage.removeItem(SESSION);}catch{}document.dispatchEvent(new Event('portal-sign-out'));state();}else unlock();};
nav.querySelectorAll('button').forEach(button=>button.onclick=()=>{const target=document.getElementById(button.dataset.appTarget);if(!target||dashboard.hidden||!clientPage.hidden)return;dashboard.querySelectorAll(':scope #admin-overview>details').forEach(section=>section.open=section===target);if(target.tagName==='DETAILS')target.open=true;const owner=target.closest('details');if(owner)owner.open=true;if(target.id==='admin-students-list'){const toggle=document.querySelector('#show-clients-toggle');if(toggle?.getAttribute('aria-expanded')==='false')toggle.click();}nav.querySelectorAll('button').forEach(item=>item.setAttribute('aria-current',item===button?'page':'false'));target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
new MutationObserver(state).observe(document.querySelector('#admin-portal'),{attributes:true,subtree:true,attributeFilter:['hidden']});
document.addEventListener('client-sheet-configured',state);
function connection(){hidden(document.querySelector('#app-network'),navigator.onLine);}
window.addEventListener('online',connection);window.addEventListener('offline',connection);connection();state();
let resume=false;try{resume=sessionStorage.getItem(SESSION)==='1';}catch{}
if(resume){document.querySelector('#admin-code').value='16051962';login.requestSubmit();}else unlock();
if('serviceWorker' in navigator)navigator.serviceWorker.register('./instructor-sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});

initializePersonalCalendar(document);




