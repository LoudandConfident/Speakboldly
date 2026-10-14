import {resetPortalAttempts} from './student-portal-attempts.js?v=all-inline';
import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=level-history';
export function initializeWeeklyPortalPasswords(doc,isUnlocked){
 const root=doc.querySelector('#weekly-portal-passwords'),status=root.querySelector('[role=status]');let generation=0,timer,loading=false;
 const format=day=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Cairo'}).format(new Date(day+'T12:00:00Z'));
 async function refresh(){
  if(!isUnlocked()||loading)return;if(root.open&&!timer)timer=setInterval(refresh,60000);if(!clientSheetConnected()){status.textContent='Connect your Clients sheet to view this week’s passwords.';return;}
  const current=generation;loading=true;status.textContent='Loading this week’s passwords…';
  try{const result=await sheetLibraryRequest('weeklyPortalPasswords');if(current!==generation||!isUnlocked())return;const list=root.querySelector('dl');list.replaceChildren();for(const [group,password]of Object.entries(result.passwords)){const label=group.startsWith('level:')?'Material — Level '+group.split(':')[1]:({'calendar':'Calendar','exercise:comprehension':'Exercises — Comprehension','exercise:listening':'Exercises — Listening','exercise:resources':'Exercises — Resources','assessments':'Examinations','contact':'Contact Instructor','practice':'Practice'}[group]);if(!label)continue;const title=doc.createElement('dt'),entry=doc.createElement('dd');title.textContent=label+':';entry.dataset.weeklyPassword=group;list.append(title,entry);const value=root.querySelector('[data-weekly-password="'+group+'"]');if(value)value.textContent=password;}root.querySelector('[data-week-range]').textContent='Week beginning '+format(result.weekStart);status.textContent='Next automatic change: '+format(result.nextChange)+' at midnight Cairo time. Share these passwords with the relevant clients.';}
  catch(error){if(current!==generation)return;root.querySelectorAll('[data-weekly-password]').forEach(value=>value.textContent='—');status.textContent=/Invalid action|Not authorized/.test(error.message)?'Update UnifiedCode.gs in your existing Apps Script project, then deploy a New version to activate weekly passwords.':error.message;}
  finally{if(current===generation)loading=false;}
 }
 root.querySelector('button').onclick=refresh;
 root.querySelector('[data-reset-password-attempts]').onclick=()=>{if(!isUnlocked())return;try{resetPortalAttempts(doc);status.textContent='Password attempts reset on this browser.';}catch{status.textContent='Enable browser storage before resetting attempts.';}};
 root.addEventListener('toggle',()=>{clearInterval(timer);timer=null;if(root.open){refresh();timer=setInterval(refresh,60000);}});
 doc.addEventListener('client-sheet-configured',()=>{if(root.open)refresh();});doc.addEventListener('visibilitychange',()=>{if(root.open&&!doc.hidden)refresh();});
 return{refresh,lock(){generation++;loading=false;clearInterval(timer);timer=null;root.querySelectorAll('[data-weekly-password]').forEach(value=>value.textContent='—');root.querySelector('[data-week-range]').textContent='';status.textContent='';}};
}
