import {assertPortalAllowed,noteWrongPassword,PORTAL_ATTEMPT_KEY,PORTAL_LOCK_MESSAGE,clearFolderPasswords,unlockStudentFolder} from './student-portal-attempts.js?v=weekly-passwords';
import {initializeMaterialOwnerLibrary} from './material-owner-library.js';
import {MATERIAL_PROGRAM_FOLDERS,materialProgram} from './material-program-folders.js?v=comprehension-listening';
import {initializeStudentBooking} from './student-booking.js?v=weekly-passwords';
import {attachTemporaryPortalUploads} from './temporary-portal-uploads.js?v=major-folders';
import {createExamForm} from './exam-form.js';
import {openPopup} from './popups.js?v=mobile-assessment-page';

const SESSION_KEY='speak-boldly-assessment-session-v1';
export function initializeStudentAssessment(doc) {
 const root=doc.querySelector('#students-portal'),content=root.querySelector('#portal-content'),status=root.querySelector('#portal-access-status'),panel=root.querySelector('#portal-exams');
 const blocked=doc.createElement('p');blocked.id='student-portal-lockout';blocked.hidden=true;blocked.setAttribute('role','alert');content.before(blocked);
 const booking=initializeStudentBooking(doc);
 const ownerLibrary=initializeMaterialOwnerLibrary(doc);
 const profile=doc.createElement('dialog');profile.id='student-assessment-profile';profile.className='action-popup';profile.setAttribute('aria-label','Assessment details');doc.body.append(profile);
 const endpoint=root.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 const tabs=[...root.querySelectorAll('[data-portal-tab]')].filter(el=>['exercises','material','comprehension','listening','exams','calendar'].includes(el.dataset.portalTab));
 let passwordMetadata=null;
 let token='',student=null,epoch=0,saveTimer,tick,accessTimer,queue=Promise.resolve(),busy=false;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 async function call(action,data={}) {
  assertPortalAllowed(doc.defaultView.localStorage);
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try {
   const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,...data}),signal:controller.signal});
   const result=await response.json();
   if(!response.ok||!result.ok)throw new Error(/Incorrect connection key|Not authorized|Invalid action/.test(result.error||'')?'This part of the portal is not ready yet. Please contact your instructor.':result.error||'The assessment could not be saved.');
   return result;
  }catch(error){if(error.name==='AbortError')throw new Error('Google Sheets took too long to respond. Retry; submitted answers will not be duplicated.');if(error instanceof TypeError)throw new Error('Could not reach the portal. Please check your connection and try again.');throw error;}
  finally{clearTimeout(timer);}
 }
 const collect=form=>{const answers={A:{},B:{},C:{},D:'',E:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [section,number]=name.split('.');if(number)answers[section][number]=section==='A'?Number(value):value;else answers[section]=value;}return answers;};
 function remember(level){try{doc.defaultView.sessionStorage.setItem(SESSION_KEY,JSON.stringify({token,student,level}));}catch{}}
 function lock(){epoch++;doc.dispatchEvent(new doc.defaultView.Event('student-portal-locking'));clearFolderPasswords(doc);clearTimeout(saveTimer);clearInterval(tick);clearInterval(accessTimer);if(profile.open)profile.close();booking.lock();ownerLibrary.lock();token='';student=null;busy=false;content.hidden=true;panel.replaceChildren();root.classList.remove('portal-session-active');}
 function select(id){assertPortalAllowed(doc.defaultView.localStorage);if(id==='material')ownerLibrary.refresh();tabs.forEach(tab=>{const active=tab.dataset.portalTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});root.querySelectorAll('[data-portal-panel]').forEach(p=>p.hidden=p.dataset.portalPanel!==id);}
 function updatePasswordMetadata(response){
  const next=response.passwordSettings||null;
  if(passwordMetadata&&next?.revision!==passwordMetadata.revision){clearFolderPasswords(doc);root.querySelectorAll('#portal-material details').forEach(folder=>folder.open=false);if(tabs.some(tab=>['material','exercises','comprehension','listening'].includes(tab.dataset.portalTab)&&tab.getAttribute('aria-selected')==='true'))select('exams');status.textContent='The weekly passwords have changed. Please ask your instructor for this week’s password.';}
  passwordMetadata=next;
 }
 async function unlockFolder(key,title){
  const response=await call('studentPortalAccess');updatePasswordMetadata(response);
  const group=key==='exercises'||['program:comprehension','program:listening'].includes(key)?'exercises':'material';
  return unlockStudentFolder(doc,passwordMetadata?.weekly?group:key,title,async passcode=>{
   if(!passwordMetadata?.weekly)return passcode==='16219';
   try{const result=await call('studentFolderLogin',{folder:key,passcode});if(result.revision!==passwordMetadata.revision){clearFolderPasswords(doc);throw new Error('The weekly password changed. Close this card and try again.');}return true;}catch(error){if(/Incorrect folder password/.test(error.message))return false;throw error;}
  });
 }
 tabs.forEach(tab=>tab.onclick=async()=>{try{assertPortalAllowed(doc.defaultView.localStorage);const id=tab.dataset.portalTab;if(['exercises','material','comprehension','listening'].includes(id)&&!await unlockFolder(['comprehension','listening'].includes(id)?'program:'+id:id,{exercises:'Exercises',material:'Material',comprehension:'Comprehension',listening:'Listening'}[id]))return;select(id);}catch(error){status.textContent=error.message;}});
 root.querySelector('#portal-material').addEventListener('click',async event=>{const summary=event.target.closest('[data-material-program]>summary,[data-material-level]>summary');if(!summary)return;const folder=summary.parentElement;if(folder.open)return;event.preventDefault();const key=folder.dataset.materialLevel?'level:'+folder.dataset.materialLevel:'program:'+folder.dataset.materialProgram;try{if(await unlockFolder(key,summary.textContent))folder.open=true;}catch(error){status.textContent=error.message;}});
 function result(attempt,viewer){
  clearInterval(tick);busy=false;viewer.replaceChildren(text('h4','Level '+attempt.level),text('p',attempt.status==='Reviewed'?'Score: '+attempt.score+' / 100':'Assessment submitted — awaiting your instructor’s correction.'));
  if(attempt.feedback)viewer.append(text('p',attempt.feedback));
  const refresh=text('button','Refresh result');refresh.type='button';refresh.className='button light small';viewer.append(refresh);
  refresh.onclick=async()=>{const current=epoch;refresh.disabled=true;try{const updated=await call('studentExamGet',{level:attempt.level});if(current===epoch&&viewer.isConnected)result(updated.attempt,viewer);}catch(error){if(current===epoch)status.textContent=error.message;}finally{refresh.disabled=false;}};
 }
 async function openLevel(level){
  const current=epoch;status.textContent='Loading Level '+level+'…';
  try{
   const response=await call('studentExamGet',{level});if(current!==epoch)return;
   let attempt=response.attempt;remember(level);panel.querySelector('.portal-document-viewer')?.remove();
   const viewer=doc.createElement('section');viewer.className='portal-document-viewer interactive-exam';panel.append(viewer);status.textContent='';
   if(attempt.submittedAt){result(attempt,viewer);return;}
   busy=true;viewer.append(text('h4','Level '+level),text('p','20 minutes. Answers are saved as you work. Your instructor will correct the five sections and save your score out of 100. For listening, use the recording or instructions supplied by your instructor.'));
   const timer=text('p','20:00 remaining');timer.className='student-assessment-timer';timer.setAttribute('role','timer');timer.setAttribute('aria-label','Time remaining');viewer.append(timer);
   const templateResponse=await doc.defaultView.fetch('./student-files/interactive-assessments/level-'+level+'.json');if(!templateResponse.ok)throw new Error('Assessment file could not load. Please retry.');const template=await templateResponse.json();if(current!==epoch)return;const examForm=createExamForm(doc,template);
   for(const el of examForm.elements){const [section,number]=el.name.split('.'),value=number?attempt.answers?.[section]?.[number]:attempt.answers?.[section];if(value!==undefined){if(el.type==='radio')el.checked=el.value===String(value);else el.value=value;}}
   const note=text('p',''),controls=doc.createElement('div');note.setAttribute('role','status');controls.className='assessment-save-controls';
   const save=text('button','Save answers'),submit=text('button','Submit assessment');save.type='button';submit.type='submit';save.className='button light';submit.className='button';controls.append(save,submit);examForm.append(text('p','Check your answers before submitting. When the timer reaches zero, your saved answers are submitted automatically.'),controls,note);viewer.append(examForm);
   let submitting=false,conflict=false,offset=attempt.serverNow-Date.now(),retryAt=0;
   function persist(action){
    clearTimeout(saveTimer);const answers=collect(examForm);
    const task=queue.catch(()=>{}).then(async()=>{
     if(current!==epoch||!viewer.isConnected)return;
     if(conflict)throw new Error('Reopen the assessment to load the saved version.');
     note.textContent=action==='studentExamSubmit'?'Submitting…':'Saving answers…';
     try{const response=await call(action,{level,attemptId:attempt.id,version:attempt.version,answers});if(current!==epoch)return;attempt=response.attempt;offset=attempt.serverNow-Date.now();note.textContent='Answers saved.';if(attempt.submittedAt)result(attempt,viewer);return attempt;}
     catch(error){if(/another tab|assessment has changed/.test(error.message)){conflict=true;save.disabled=true;submit.disabled=true;}if(current===epoch)note.textContent='Not saved: '+error.message;throw error;}
    });queue=task;return task;
   }
   async function finish(automatic=false){
    if(submitting||conflict)return;
    if(!automatic&&!doc.defaultView.confirm('Submit the assessment for '+student.name+' — Level '+level+'?'))return;
    submitting=true;save.disabled=submit.disabled=true;const pending=persist('studentExamSubmit');examForm.querySelectorAll('input,textarea').forEach(el=>el.disabled=true);
    try{await pending;}catch{submitting=false;save.disabled=conflict;submit.disabled=conflict;if(!automatic)examForm.querySelectorAll('input,textarea').forEach(el=>el.disabled=false);retryAt=Date.now()+10000;}
   }
   examForm.addEventListener('input',()=>{if(submitting||conflict)return;clearTimeout(saveTimer);note.textContent='Unsaved changes…';saveTimer=setTimeout(()=>persist('studentExamDraft').catch(()=>{}),1000);});
   save.onclick=async()=>{save.disabled=true;try{await persist('studentExamDraft');}catch{}finally{save.disabled=submitting||conflict;}};
   examForm.onsubmit=event=>{event.preventDefault();finish();};
   function countdown(){if(current!==epoch||!viewer.isConnected){clearInterval(tick);return;}const seconds=Math.max(0,Math.ceil((attempt.deadline-Date.now()-offset)/1000));timer.textContent=Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')+' remaining';if(seconds===0){timer.textContent='Time is up — submitting saved answers';if(Date.now()>=retryAt)finish(true);}}
   clearInterval(tick);tick=setInterval(countdown,250);countdown();
  }catch(error){if(current===epoch){status.textContent=error.message;busy=false;}}
 }
 function renderFiles(items){
  for(const [section,id,title]of [['exercises','portal-exercises','Exercises'],['levels','portal-material','Material'],['levels','portal-comprehension','Comprehension'],['levels','portal-listening','Listening']]){
   const target=root.querySelector('#'+id),previousFolders=new Map([...target.querySelectorAll('[data-material-level],[data-material-program]')].map(folder=>[folder.dataset.materialLevel||folder.dataset.materialProgram,{open:folder.open,uploads:folder.querySelector(':scope>.temporary-portal-uploads')}])),uploads=target.querySelector(':scope>.temporary-portal-uploads'),library=target.querySelector('#teacher-full-library');target.replaceChildren(text('h3',title));if(uploads)target.append(uploads);if(library)target.append(library);
   const skill=target.dataset.materialProgram,folders=new Map();if(section==='levels'&&!skill){for(let n=1;n<=8;n++){const folder=doc.createElement('details');folder.className='material-level-folder';folder.dataset.materialLevel=n;folder.append(text('summary','Level '+n));const previous=previousFolders.get(String(n));if(previous){folder.open=previous.open;if(previous.uploads)folder.append(previous.uploads);}target.append(folder);folders.set(n,folder);}for(const program of MATERIAL_PROGRAM_FOLDERS.filter(program=>!['comprehension','listening'].includes(program.id))){const folder=doc.createElement('details');folder.className='material-level-folder';folder.dataset.materialProgram=program.id;folder.append(text('summary',program.title));const previous=previousFolders.get(program.id);if(previous){folder.open=previous.open;if(previous.uploads)folder.append(previous.uploads);}target.append(folder);folders.set(program.id,folder);}}
   for(const item of items.filter(item=>item.section===section&&(section!=='levels'||(skill?materialProgram(item)?.id===skill:!['comprehension','listening'].includes(materialProgram(item)?.id))))){
    const row=doc.createElement('div');row.className='student-portal-file';let control;
    if(item.enabled&&/^https:\/\//.test(item.url)){control=text('a',item.title);control.href=item.url;control.target='_blank';control.rel='noopener noreferrer';control.onclick=async event=>{event.preventDefault();const current=epoch,tab=doc.defaultView.open('about:blank','_blank');if(tab)tab.document.body.textContent='Checking access…';try{const data=await call('studentPortalAccess'),fresh=data.items.find(entry=>entry.id===item.id);if(current!==epoch||!fresh?.enabled){tab?.close();status.textContent='This file is currently dimmed by your instructor.';return;}if(tab)tab.location.href=fresh.url;else status.textContent='Allow popups to open this file.';}catch(error){tab?.close();if(current===epoch)status.textContent=error.message;}};}
    else{control=text('button',item.title+' · Closed');control.type='button';control.disabled=true;}
    control.className='button light';row.append(control);if(section==='levels'&&!skill){let source=item.title+' '+item.url;try{source=decodeURIComponent(source);}catch{}const match=source.match(/\blevel[ _-]*([1-8])\b/i);const program=materialProgram(item);if(program)folders.get(program.id).append(row);else if(match)folders.get(Number(match[1])).append(row);else{let other=folders.get(0);if(!other){other=doc.createElement('details');other.className='material-level-folder';other.append(text('summary','Other material'));target.append(other);folders.set(0,other);}other.append(row);}}else target.append(row);
   }
   for(const folder of folders.values())if(!folder.querySelector('.student-portal-file'))folder.append(text('p','Material will be added here.'));
   if((section!=='levels'||skill)&&!target.querySelector('.student-portal-file'))target.append(text('p','Your instructor will add files here.'));
  }
 }
 function showAssessment(items,open=true){
  panel.replaceChildren(text('h3','Assessment'));const files=doc.createElement('div');files.className='interactive-assessment-files';for(let n=1;n<=6;n++){const item=items.find(entry=>entry.id==='test:'+n),button=text('button','Level '+n);button.type='button';button.className='button light assessment-file';button.dataset.assessmentLevel=n;button.disabled=!item?.enabled;button.setAttribute('aria-label','Level '+n+' assessment'+(item?.enabled?'':' — Closed'));button.onclick=()=>{const form=profile.querySelector('#student-assessment-start');form.elements.level.value=n;if(!profile.open)profile.showModal();form.elements.name.focus();};files.append(button);}panel.append(files);
  const password=text('label','Assessment password:'),passwordInput=doc.createElement('input');passwordInput.name='assessmentPassword';passwordInput.type='password';passwordInput.required=true;passwordInput.autocomplete='off';password.append(passwordInput);
  const selection=doc.createElement('form');selection.className='student-assessment-start';selection.id='student-assessment-start';
  const name=text('label','Name:'),nameInput=doc.createElement('input');nameInput.name='name';nameInput.maxLength=100;nameInput.autocomplete='name';nameInput.required=true;nameInput.value=student?.name||'';name.append(nameInput);
  const age=text('label','Age:'),ageInput=doc.createElement('input');ageInput.name='age';ageInput.type='number';ageInput.min=1;ageInput.max=120;ageInput.required=true;ageInput.value=student?.age||'';age.append(ageInput);
  const program=text('label','Program:'),programInput=doc.createElement('input');programInput.name='program';programInput.maxLength=100;programInput.required=true;programInput.placeholder='e.g. General English';programInput.value=student?.program||'';program.append(programInput);
  const level=text('label','Level:'),selectLevel=doc.createElement('select');selectLevel.name='level';selectLevel.required=true;
  selectLevel.append(Object.assign(text('option','Choose your level'),{value:''}));
  for(const item of items.filter(item=>item.section==='tests')){const option=text('option',item.title+(item.enabled?'':' · Closed'));option.value=item.id.split(':')[1];option.disabled=!item.enabled;selectLevel.append(option);}level.append(selectLevel);
  const start=text('button','Start assessment');start.className='button';start.type='submit';selection.append(password,name,level,age,program,start);const close=text('button','×');close.type='button';close.className='popup-close';close.setAttribute('aria-label','Close assessment details');close.onclick=()=>profile.close();profile.replaceChildren(close,text('h2','Assessment details'),selection);
  selection.onsubmit=async event=>{
   event.preventDefault();if(busy){status.textContent='Finish the current assessment before starting another.';return;}try{assertPortalAllowed(doc.defaultView.localStorage);}catch(error){showBlocked(error.message);return;}const current=epoch;start.disabled=true;
   try{const response=await call('studentExamLogin',{passcode:passwordInput.value,name:nameInput.value.trim(),program:programInput.value.trim(),age:Number(ageInput.value)});if(current!==epoch)return;token=response.token;student=response.student;profile.close();await openLevel(Number(selectLevel.value));}
   catch(error){if(/Incorrect assessment password/.test(error.message)){try{const remaining=noteWrongPassword(doc);if(current===epoch){status.textContent=error.message+' '+remaining+' attempts remaining.';passwordInput.setCustomValidity(error.message);passwordInput.reportValidity();passwordInput.oninput=()=>passwordInput.setCustomValidity('');}}catch{}}else if(current===epoch)status.textContent=error.message;}finally{start.disabled=false;}
  };
 }
 async function openStudent(){
  try{assertPortalAllowed(doc.defaultView.localStorage);}catch(error){showBlocked(error.message);return;}blocked.hidden=true;
  const current=epoch;content.hidden=false;root.classList.add('portal-session-active');root.querySelector('#student-folder-title').textContent='Student portal';select(doc.defaultView.location.hash.endsWith('/calendar')?'calendar':'exams');status.textContent='Loading available files and assessments…';renderFiles([]);showAssessment([],false);attachTemporaryPortalUploads(doc);
  try{const response=await call('studentPortalAccess');if(current!==epoch)return;updatePasswordMetadata(response);
   let saved;try{saved=JSON.parse(doc.defaultView.sessionStorage.getItem(SESSION_KEY)||'null');}catch{}
   if(saved?.token&&saved?.student){token=saved.token;student=saved.student;}
   renderFiles(response.items);showAssessment(response.items);attachTemporaryPortalUploads(doc);status.textContent='Dimmed items are currently closed. Your instructor controls what is open.';
   if(token&&Number.isInteger(saved.level)&&!doc.defaultView.location.hash.endsWith('/calendar')){if(profile.open)profile.close();await openLevel(saved.level);}
   clearInterval(accessTimer);accessTimer=setInterval(async()=>{if(current!==epoch||doc.hidden)return;try{const updated=await call('studentPortalAccess');if(current!==epoch)return;updatePasswordMetadata(updated);renderFiles(updated.items);attachTemporaryPortalUploads(doc);panel.querySelectorAll('[data-assessment-level]').forEach(button=>{const item=updated.items.find(entry=>entry.id==='test:'+button.dataset.assessmentLevel);button.disabled=!item?.enabled;button.setAttribute('aria-label','Level '+button.dataset.assessmentLevel+' assessment'+(item?.enabled?'':' — Closed'));});const selectLevel=profile.querySelector('[name=level]');if(selectLevel)for(const option of selectLevel.options){if(!option.value)continue;const item=updated.items.find(entry=>entry.id==='test:'+option.value);option.disabled=!item?.enabled;option.textContent='Level '+option.value+(item?.enabled?'':' · Closed');}}catch{}},20000);
  }catch(error){if(current===epoch)status.textContent=error.message;}
 }
 function showBlocked(message=PORTAL_LOCK_MESSAGE){lock();blocked.textContent=message;blocked.hidden=false;root.classList.add('portal-session-active');}
 function checkAttempts(){try{assertPortalAllowed(doc.defaultView.localStorage);if(!blocked.hidden){blocked.hidden=true;if(!root.querySelector('#client-portal').hidden)openStudent();}}catch(error){if(!root.querySelector('#client-portal').hidden)showBlocked(error.message);}}
 doc.defaultView.addEventListener('student-password-attempts-changed',checkAttempts);doc.defaultView.addEventListener('storage',event=>{if(event.key===PORTAL_ATTEMPT_KEY)checkAttempts();});
 root.querySelector('#portal-sign-out')?.addEventListener('click',()=>{
  if(busy&&!doc.defaultView.confirm('Leave this assessment? The 20-minute timer will keep running. Saved answers will still be submitted.'))return;
  lock();doc.dispatchEvent(new doc.defaultView.Event('portal-sign-out'));root.querySelector('#client-portal').hidden=true;root.querySelector('#admin-portal').hidden=true;doc.defaultView.location.hash='students-portal';
 });
 root.querySelectorAll('[data-portal-area]').forEach(button=>button.addEventListener('click',()=>{
  const client=button.dataset.portalArea==='client';if(busy&&!client&&!doc.defaultView.confirm('Leave the assessment? The timer will keep running.'))return;
  lock();root.querySelectorAll('[data-portal-area]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.querySelector('#client-portal').hidden=!client;root.querySelector('#admin-portal').hidden=client;
  if(client){doc.defaultView.location.hash=doc.defaultView.location.hash.endsWith('/calendar')?'students-portal/calendar':'students-portal/student';Promise.resolve().then(openStudent);}
  else if(root.querySelector('#admin-dashboard').hidden)openPopup(root.querySelector('#teacher-login-dialog'));
 }));
 doc.defaultView.addEventListener('hashchange',()=>{if(!doc.defaultView.location.hash.startsWith('#students-portal'))lock();});
 doc.defaultView.addEventListener('pagehide',lock);
 lock();
 if(doc.defaultView.location.hash.endsWith('/calendar'))Promise.resolve().then(()=>root.querySelector('[data-portal-area=client]').click());
}
