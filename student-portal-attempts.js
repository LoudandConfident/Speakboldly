import {cairoDay} from './student-attempts.js';
export const PORTAL_ATTEMPT_KEY='speak-boldly-portal-password-attempts-v1';
export const PORTAL_LOCK_MESSAGE='Three wrong passwords. Level folders are locked until midnight Cairo time. Contact Instructor and Calendar do not require passwords.';
const approved=new WeakMap();
export function portalAttemptState(storage,now=new Date()){
 let saved;try{saved=JSON.parse(storage.getItem(PORTAL_ATTEMPT_KEY)||'null');}catch{throw new Error('Enable browser storage to use the Student Portal.');}
 const day=cairoDay(now),used=saved?.day===day?Number(saved.used):0;
 return {day,used:Number.isInteger(used)&&used>=0?Math.min(3,used):3};
}
export function assertPortalAllowed(storage,now=new Date()){if(portalAttemptState(storage,now).used>=3)throw new Error(PORTAL_LOCK_MESSAGE);}
export function recordWrongPassword(storage,now=new Date()){
 const state=portalAttemptState(storage,now);assertPortalAllowed(storage,now);state.used++;
 try{storage.setItem(PORTAL_ATTEMPT_KEY,JSON.stringify(state));}catch{throw new Error('Enable browser storage to use the Student Portal.');}
 return 3-state.used;
}
export function noteWrongPassword(doc){const remaining=recordWrongPassword(doc.defaultView.localStorage);doc.defaultView.dispatchEvent(new doc.defaultView.Event('student-password-attempts-changed'));return remaining;}
export function resetPortalAttempts(doc){doc.defaultView.localStorage.setItem(PORTAL_ATTEMPT_KEY,JSON.stringify({day:cairoDay(),used:0}));approved.delete(doc);doc.defaultView.dispatchEvent(new doc.defaultView.Event('student-password-attempts-changed'));}
export function clearFolderPasswords(doc){approved.delete(doc);}
export async function unlockStudentFolder(doc,key,title,password,host,options={}){
 assertPortalAllowed(doc.defaultView.localStorage);const day=cairoDay();let access=approved.get(doc);
 if(access?.day===day&&access.keys.has(key)){delete host.dataset.passwordLocked;return true;}
 if(!access||access.day!==day){access={day,keys:new Set()};approved.set(doc,access);}
 return new Promise(resolve=>{
  doc.dispatchEvent(new doc.defaultView.Event('student-folder-password-cancel'));
  const dialog=doc.createElement(options.popup?'dialog':'section');dialog.id='student-folder-password-dialog';dialog.className=options.popup?'action-popup portal-password-entry':'portal-password-entry';dialog.setAttribute('aria-label',title+' password');
  const heading=doc.createElement('h4');heading.textContent=title;const form=doc.createElement('form'),label=doc.createElement('label'),input=doc.createElement('input');label.textContent='Password';input.type='password';input.required=true;input.autocomplete='off';label.append(input);
  const message=doc.createElement('p');message.setAttribute('role','status');const controls=doc.createElement('div');controls.className='detail-actions';const cancel=doc.createElement('button'),open=doc.createElement('button');cancel.type='button';open.type='submit';cancel.className='button light';open.className='button';cancel.textContent='Cancel';open.textContent='Open folder';controls.append(cancel,open);form.append(label,message,controls);dialog.append(heading,form);host.dataset.passwordLocked='true';if(options.popup)doc.body.append(dialog);else host.querySelector(':scope>h3,:scope>summary')?.after(dialog);if(!dialog.parentElement)host.prepend(dialog);
  let done=false;const finish=value=>{if(done)return;done=true;doc.defaultView.removeEventListener('student-password-attempts-changed',changed);doc.removeEventListener('student-portal-locking',exit);doc.removeEventListener('student-folder-password-cancel',exit);if(value)delete host.dataset.passwordLocked;dialog.close?.();dialog.remove();resolve(value);};
  const changed=()=>{try{assertPortalAllowed(doc.defaultView.localStorage);}catch{finish(false);}},exit=()=>finish(false);
  form.onsubmit=async event=>{event.preventDefault();try{assertPortalAllowed(doc.defaultView.localStorage);open.disabled=true;const correct=typeof password==='function'?await password(input.value):input.value===password;if(done)return;assertPortalAllowed(doc.defaultView.localStorage);if(!correct){const remaining=noteWrongPassword(doc);message.textContent='Incorrect password. '+remaining+' attempt'+(remaining===1?'':'s')+' remaining.';input.select();return;}access.keys.add(key);finish(true);}catch(error){if(!done)message.textContent=error.message;}finally{open.disabled=false;}};
  cancel.onclick=()=>finish(false);dialog.addEventListener('cancel',event=>{event.preventDefault();finish(false);});if(options.popup)dialog.showModal();doc.defaultView.addEventListener('student-password-attempts-changed',changed);doc.addEventListener('student-portal-locking',exit);doc.addEventListener('student-folder-password-cancel',exit);input.focus();
 });
}
