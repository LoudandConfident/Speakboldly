import {attachTemporaryPortalUploads} from './temporary-portal-uploads.js';
import {createExamForm} from './exam-form.js';
import {getLevelExamText} from './exam-questions.js';
import {openPopup} from './popups.js?v=mobile-assessment-page';

const SESSION_KEY='speak-boldly-assessment-session-v1';
export function initializeStudentAssessment(doc) {
 const root=doc.querySelector('#students-portal'),content=root.querySelector('#portal-content'),status=root.querySelector('#portal-access-status'),panel=root.querySelector('#portal-exams');
 const endpoint=root.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 const tabs=[...root.querySelectorAll('[data-portal-tab]')].filter(el=>['exercises','material','exams'].includes(el.dataset.portalTab));
 let token='',student=null,epoch=0,saveTimer,tick,queue=Promise.resolve(),busy=false;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 async function call(action,data={}) {
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try {
   const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,...data}),signal:controller.signal});
   const result=await response.json();
   if(!response.ok||!result.ok)throw new Error(/Incorrect connection key|Not authorized|Invalid action/.test(result.error||'')?'Your instructor needs to deploy the updated portal script first.':result.error||'The assessment could not be saved.');
   return result;
  }catch(error){if(error.name==='AbortError')throw new Error('Google Sheets took too long to respond. Retry; submitted answers will not be duplicated.');if(error instanceof TypeError)throw new Error('Could not reach the portal. Please check your connection and try again.');throw error;}
  finally{clearTimeout(timer);}
 }
 const collect=form=>{const answers={A:{},B:{},C:{},D:'',E:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [section,number]=name.split('.');if(number)answers[section][number]=section==='A'?Number(value):value;else answers[section]=value;}return answers;};
 function remember(level){try{doc.defaultView.sessionStorage.setItem(SESSION_KEY,JSON.stringify({token,student,level}));}catch{}}
 function lock(){epoch++;clearTimeout(saveTimer);clearInterval(tick);token='';student=null;busy=false;content.hidden=true;panel.replaceChildren();root.classList.remove('portal-session-active');}
 function select(id){tabs.forEach(tab=>{const active=tab.dataset.portalTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;});root.querySelectorAll('[data-portal-panel]').forEach(p=>p.hidden=p.dataset.portalPanel!==id);}
 tabs.forEach(tab=>tab.onclick=()=>select(tab.dataset.portalTab));
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
   const examForm=createExamForm(doc,getLevelExamText(level));
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
  for(const [section,id,title]of [['exercises','portal-exercises','Exercises'],['levels','portal-material','Levels']]){
   const target=root.querySelector('#'+id);target.replaceChildren(text('h3',title));
   for(const item of items.filter(item=>item.section===section)){
    const row=doc.createElement('div');row.className='student-portal-file';let control;
    if(item.enabled&&/^https:\/\//.test(item.url)){control=text('a',item.title);control.href=item.url;control.target='_blank';control.rel='noopener noreferrer';}
    else{control=text('button',item.title+' · Closed');control.type='button';control.disabled=true;}
    control.className='button light';row.append(control);target.append(row);
   }
   if(target.children.length===1)target.append(text('p','Your instructor will add files here.'));
  }
 }
 function showAssessment(items){
  panel.replaceChildren(text('h3','Assessment'));
  const selection=doc.createElement('form');selection.className='student-assessment-start';selection.id='student-assessment-start';
  const name=text('label','Name:'),nameInput=doc.createElement('input');nameInput.name='name';nameInput.maxLength=100;nameInput.autocomplete='name';nameInput.required=true;nameInput.value=student?.name||'';name.append(nameInput);
  const program=text('label','Program:'),programInput=doc.createElement('input');programInput.name='program';programInput.maxLength=100;programInput.required=true;programInput.placeholder='e.g. General English';programInput.value=student?.program||'';program.append(programInput);
  const level=text('label','Level:'),selectLevel=doc.createElement('select');selectLevel.name='level';selectLevel.required=true;
  selectLevel.append(Object.assign(text('option','Choose your level'),{value:''}));
  for(const item of items.filter(item=>item.section==='tests')){const option=text('option',item.title+(item.enabled?'':' · Closed'));option.value=item.id.split(':')[1];option.disabled=!item.enabled;selectLevel.append(option);}level.append(selectLevel);
  const start=text('button','Start assessment');start.className='button';start.type='submit';selection.append(name,program,level,start);panel.append(selection);
  selection.onsubmit=async event=>{
   event.preventDefault();if(busy){status.textContent='Finish the current assessment before starting another.';return;}const current=epoch;start.disabled=true;
   try{const response=await call('studentExamLogin',{name:nameInput.value.trim(),program:programInput.value.trim()});if(current!==epoch)return;token=response.token;student=response.student;await openLevel(Number(selectLevel.value));}
   catch(error){if(current===epoch)status.textContent=error.message;}finally{start.disabled=false;}
  };
 }
 async function openStudent(){
  const current=epoch;content.hidden=false;root.classList.add('portal-session-active');root.querySelector('#student-folder-title').textContent='Student portal';select('exams');status.textContent='Loading available files and assessments…';renderFiles([]);showAssessment([]);attachTemporaryPortalUploads(doc);
  try{const response=await call('studentPortalAccess');if(current!==epoch)return;
   let saved;try{saved=JSON.parse(doc.defaultView.sessionStorage.getItem(SESSION_KEY)||'null');}catch{}
   if(saved?.token&&saved?.student){token=saved.token;student=saved.student;}
   renderFiles(response.items);showAssessment(response.items);attachTemporaryPortalUploads(doc);status.textContent='Dimmed items are currently closed. Your instructor controls what is open.';
   if(token&&Number.isInteger(saved.level))await openLevel(saved.level);
  }catch(error){if(current===epoch)status.textContent=error.message;}
 }
 root.querySelector('#portal-sign-out')?.addEventListener('click',()=>{
  if(busy&&!doc.defaultView.confirm('Leave this assessment? The 20-minute timer will keep running. Saved answers will still be submitted.'))return;
  lock();doc.dispatchEvent(new doc.defaultView.Event('portal-sign-out'));root.querySelector('#client-portal').hidden=true;root.querySelector('#admin-portal').hidden=true;doc.defaultView.location.hash='students-portal';
 });
 root.querySelectorAll('[data-portal-area]').forEach(button=>button.addEventListener('click',()=>{
  const client=button.dataset.portalArea==='client';if(busy&&!client&&!doc.defaultView.confirm('Leave the assessment? The timer will keep running.'))return;
  lock();root.querySelectorAll('[data-portal-area]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));root.querySelector('#client-portal').hidden=!client;root.querySelector('#admin-portal').hidden=client;
  if(client){doc.defaultView.location.hash='students-portal/student';Promise.resolve().then(openStudent);}
  else if(root.querySelector('#admin-dashboard').hidden)openPopup(root.querySelector('#teacher-login-dialog'));
 }));
 doc.defaultView.addEventListener('hashchange',()=>{if(!doc.defaultView.location.hash.startsWith('#students-portal'))lock();});
 doc.defaultView.addEventListener('pagehide',lock);
 lock();
}
