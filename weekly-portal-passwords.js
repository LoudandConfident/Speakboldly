import {resetPortalAttempts} from './student-portal-attempts.js?v=six-sections';
import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=level-history';
export function initializeWeeklyPortalPasswords(doc,isUnlocked){
 const root=doc.querySelector('#weekly-portal-passwords'),status=root.querySelector('[role=status]');let generation=0,timer,loading=false;
 const format=day=>new Intl.DateTimeFormat('en-GB',{day:'numeric',month:'short',year:'numeric',timeZone:'Africa/Cairo'}).format(new Date(day+'T12:00:00Z'));
 function render(result){
  const list=root.querySelector('dl');list.replaceChildren();
  for(const [group,password]of Object.entries(result.passwords)){
   const title=doc.createElement('dt'),entry=doc.createElement('dd'),form=doc.createElement('form'),input=doc.createElement('input'),save=doc.createElement('button');
   title.textContent=group.startsWith('material:')?'Material — Level '+group.split(':')[1]:group==='exams'?'Examinations — all levels':group==='exercises'?'Activity — all levels':group==='activities'?'Activities — all levels':'Listening — all levels';
   form.className='monthly-password-form';input.value=password;input.required=true;input.pattern='[0-9]{6}';input.inputMode='numeric';input.maxLength=6;input.setAttribute('aria-label',title.textContent+' password');save.type='submit';save.className='button light small';save.textContent='Save';form.append(input,save);entry.append(form);list.append(title,entry);
   form.onsubmit=async event=>{event.preventDefault();if(!isUnlocked()||!form.reportValidity())return;save.disabled=true;const epoch=generation;try{const updated=await sheetLibraryRequest('saveMonthlyPortalPassword',{monthStart:result.monthStart,group,password:input.value});if(epoch!==generation||!isUnlocked())return;render(updated);status.textContent='Password saved for this month.';}catch(error){if(epoch===generation)status.textContent=error.message;}finally{save.disabled=false;}};
  }
  root.querySelector('[data-week-range]').textContent='Month beginning '+format(result.monthStart);status.textContent='Next automatic change: '+format(result.nextChange)+' at midnight Cairo time. You can edit each password for this month.';
 }
 async function refresh(){
  if(!isUnlocked()||loading||root.querySelector('.monthly-password-form:focus-within'))return;if(root.open&&!timer)timer=setInterval(refresh,60000);if(!clientSheetConnected()){status.textContent='Connect your Clients sheet to view this month’s passwords.';return;}
  const current=generation;loading=true;status.textContent='Loading this month’s passwords…';
  try{const result=await sheetLibraryRequest('monthlyPortalPasswords');if(current!==generation||!isUnlocked())return;render(result);}

  catch(error){if(current!==generation)return;root.querySelectorAll('[data-weekly-password]').forEach(value=>value.textContent='—');status.textContent=/Invalid action|Not authorized/.test(error.message)?'Update UnifiedCode.gs in your existing Apps Script project, then deploy a New version to activate monthly passwords.':error.message;}
  finally{if(current===generation)loading=false;}
 }
 root.querySelector('button').onclick=refresh;
 root.querySelector('[data-reset-password-attempts]').onclick=()=>{if(!isUnlocked())return;try{resetPortalAttempts(doc);status.textContent='Password attempts reset on this browser.';}catch{status.textContent='Enable browser storage before resetting attempts.';}};
 root.addEventListener('toggle',()=>{clearInterval(timer);timer=null;if(root.open){refresh();timer=setInterval(refresh,60000);}});
 doc.addEventListener('client-sheet-configured',()=>{if(root.open)refresh();});doc.addEventListener('visibilitychange',()=>{if(root.open&&!doc.hidden)refresh();});
 return{refresh,lock(){generation++;loading=false;clearInterval(timer);timer=null;root.querySelector('dl').replaceChildren();root.querySelector('[data-week-range]').textContent='';status.textContent='';}};
}
