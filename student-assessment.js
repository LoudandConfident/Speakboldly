import {withBerlitzBooks} from './berlitz-material.js?v=dim-default-1';
import {initializeMonthlyLearning} from './monthly-learning.js?v=hub-eight-2';
import {openLearningDocument,closeLearningDocument,updateLearningDocumentAccess} from './learning-document-viewer.js?v=embedded-books';
import {learningFolderPasswordGroup} from './learning-hub-sections.js?v=exam-rebuild';
import {initializeStudentContact} from './student-contact.js?v=mission-question';
import {chooseLearningLevel} from './learning-level-dialog.js?v=password-free-1';
import {learningDocumentTitle,learningDocumentLevel,learningDocumentCategory,createLearningDocumentCard} from './learning-document-cards.js?v=exam-rebuild';
import {ensurePortalFolderTree,portalItemFolder} from './portal-folder-tree.js?v=learning-space';
import {initializePractice} from './student-practice.js';
import {assertPortalAllowed,noteWrongPassword,PORTAL_ATTEMPT_KEY,PORTAL_LOCK_MESSAGE,clearFolderPasswords,unlockStudentFolder} from './student-portal-attempts.js?v=folder-popups';
import {materialProgram} from './material-program-folders.js?v=comprehension-listening';
import {initializeStudentBooking} from './student-booking.js?v=december-oct17';
import {attachTemporaryPortalUploads,getTemporaryOwnerConnection} from './temporary-portal-uploads.js?v=exam-rebuild';
import {createExamForm} from './exam-form.js?v=exam-rebuild';
import {openPopup} from './popups.js?v=mobile-assessment-page';

const SESSION_KEY='speak-boldly-assessment-session-v1';
export function initializeStudentAssessment(doc) {
 const root=doc.querySelector('#students-portal'),content=root.querySelector('#portal-content'),status=root.querySelector('#portal-access-status'),panel=root.querySelector('#portal-exams');
 const blocked=doc.createElement('p');blocked.id='student-portal-lockout';blocked.hidden=true;blocked.setAttribute('role','alert');content.before(blocked);
 const booking=initializeStudentBooking(doc);
 const monthly=initializeMonthlyLearning(doc);
 const contact=initializeStudentContact(doc);
 const profile=doc.createElement('section');profile.id='student-assessment-profile';profile.className='assessment-entry';profile.hidden=true;profile.setAttribute('aria-label','Assessment details');
 const endpoint=root.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 initializePractice(doc);

 const tabs=[...root.querySelectorAll('[data-portal-tab]')].filter(el=>['exercises','material','exams','contact','calendar','practice','listening','monthly','mission','studio','accent'].includes(el.dataset.portalTab));
 let learningLevel=null,learningPasscode='',examPasscode='',latestItems=[];
 let exercisesUnlocked=false;
 let passwordMetadata=null,assessmentUnlocked=false,resumableSession=null;
 let token='',student=null,epoch=0,saveTimer,tick,accessTimer,queue=Promise.resolve(),busy=false;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 async function call(action,data={}) {
  
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try {
   const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,...data}),signal:controller.signal});
   const result=await response.json();if(action==='studentPortalAccess'&&Array.isArray(result.items))result.items=withBerlitzBooks(result.items.map(item=>({...item,enabled:result.passwordFreeFiles===true&&item.enabled})));
   if(!response.ok||!result.ok)throw new Error(/Incorrect connection key|Not authorized|Invalid action/.test(result.error||'')?'This part of the portal is not ready yet. Please contact your instructor.':result.error||'The assessment could not be saved.');
   return result;
  }catch(error){if(error.name==='AbortError')throw new Error(action==='studentPortalAccess'?'The shared file list took too long to load. Reopen the folder to retry.':action==='studentExamDraft'?'Saving answers took too long. Retry Save answers; your current answers are still on this page.':action==='studentExamSubmit'?'Submission confirmation took too long. Retry Submit assessment; the same attempt will not be duplicated.':'Google Sheets took too long to respond. Please try again.');if(error instanceof TypeError)throw new Error('Could not reach the portal. Please check your connection and try again.');throw error;}
  finally{clearTimeout(timer);}
 }
 const collect=form=>{const answers=form.dataset.examVersion==='2'?{examVersion:2,A:{},B:{},C:{},D:{},E:'',F:{}}:{A:{},B:{},C:{},D:'',E:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [section,number]=name.split('.');if(number)answers[section][number]=(section==='A'||(answers.examVersion===2&&section==='C'))?Number(value):value;else answers[section]=value;}return answers;};
 function remember(level){try{doc.defaultView.sessionStorage.setItem(SESSION_KEY,JSON.stringify({token,student,level}));}catch{}}
 function lock(){crumbs.hidden=true;crumbs.replaceChildren();epoch++;doc.dispatchEvent(new doc.defaultView.Event('student-portal-locking'));clearFolderPasswords(doc);learningLevel=null;learningPasscode='';examPasscode='';exercisesUnlocked=false;delete root.querySelector('#portal-contact').dataset.passwordLocked;clearTimeout(saveTimer);clearInterval(tick);clearInterval(accessTimer);profile.hidden=true;booking.lock();contact.lock();monthly.lock();token='';student=null;assessmentUnlocked=false;resumableSession=null;busy=false;content.hidden=true;panel.replaceChildren();root.classList.remove('portal-session-active');}
 const crumbs=doc.createElement('nav');crumbs.className='learning-breadcrumbs';crumbs.setAttribute('aria-label','Learning Hub breadcrumb');crumbs.hidden=true;root.querySelector('[data-learning-back]')?.after(crumbs);
 function publicSectionSelected(){return tabs.some(tab=>['contact','calendar','monthly','mission','studio','accent'].includes(tab.dataset.portalTab)&&tab.getAttribute('aria-selected')==='true');}
 function select(id){retryFiles.hidden=true;if(['contact','calendar','monthly','mission','studio','accent'].includes(id))status.textContent='';root.classList.toggle('learning-section-open',Boolean(id));if(id!=='mission')doc.dispatchEvent(new doc.defaultView.Event('daily-mission-pause'));closeLearningDocument(doc);crumbs.replaceChildren();crumbs.hidden=!id;if(id){const home=text('button','Learning Hub');home.type='button';home.onclick=()=>select(null);crumbs.append(home,text('span',' → '+({exercises:'Practice Zone',material:'Learning Library',exams:'Test Yourself',practice:'Practice Zone',listening:'Listening Lab',calendar:'Session Calendar',contact:'Contact Instructor',monthly:'Real English',mission:'Daily Challenge',studio:'SB Studio',accent:'Accent'}[id]||id)+(learningLevel&&!['calendar','contact','monthly','mission','studio','accent','exercises','exams'].includes(id)?' → Level '+learningLevel:'')));}tabs.forEach((tab,index)=>{const active=tab.dataset.portalTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active||(!id&&index===0)?0:-1;});root.querySelectorAll('[data-portal-panel]').forEach(p=>p.hidden=p.dataset.portalPanel!==id);const back=root.querySelector('[data-learning-back]');if(back)back.hidden=!id;if(id)doc.defaultView.scrollTo({top:0,behavior:'instant'});}
 doc.addEventListener('daily-mission-contact',event=>{status.textContent='';delete root.querySelector('#portal-contact').dataset.passwordLocked;select('contact');contact.open(event.detail?.message);});
 doc.addEventListener('daily-mission-home',()=>{select(null);root.querySelector('.learning-space-heading')?.scrollIntoView({block:'start',behavior:'auto'});});
 root.querySelector('[data-learning-back]')?.addEventListener('click',()=>{select(null);root.querySelector('.learning-space-heading')?.scrollIntoView({block:'start',behavior:'auto'});});
 root.querySelectorAll('[data-learning-open]').forEach(button=>button.onclick=()=>root.querySelector('[data-portal-tab="'+button.dataset.learningOpen+'"]')?.click());
 const retryFiles=text('button','Retry loading files');retryFiles.type='button';retryFiles.className='button light small';retryFiles.hidden=true;status.after(retryFiles);
 let catalogRequest=0,catalogInFlight=0;
 function fileLoadError(error){if(publicSectionSelected()||content.hidden)return;status.textContent=error.message;retryFiles.hidden=false;}
 async function reloadFiles(){const current=epoch,request=++catalogRequest;catalogInFlight++;retryFiles.hidden=true;if(!publicSectionSelected())status.textContent='Loading files…';try{const response=await call('studentPortalAccess');if(current!==epoch||request!==catalogRequest)return;updatePasswordMetadata(response);updateLearningDocumentAccess(doc,response.items);renderFiles(response.items);if(!busy)showAssessment(response.items);attachTemporaryPortalUploads(doc);if(!publicSectionSelected())status.textContent='';return response;}catch(error){if(current===epoch&&request===catalogRequest)fileLoadError(error);throw error;}finally{catalogInFlight--;}}
 retryFiles.onclick=async()=>{retryFiles.disabled=true;try{await reloadFiles();}catch{}finally{retryFiles.disabled=false;}};
 function updatePasswordMetadata(response){passwordMetadata=null;}
 tabs.forEach(tab=>tab.onclick=async()=>{
  try{const id=tab.dataset.portalTab;if(busy&&id==='exams'){select(id);return;}if(busy&&!['contact','calendar','monthly','mission','studio','accent'].includes(id)){status.textContent='Finish your current examination before opening another section.';return;}
   if(id==='accent'){blocked.hidden=true;status.textContent='';select(id);return;}
   if(id==='studio'){blocked.hidden=true;status.textContent='';select(id);return;}
   if(id==='mission'){blocked.hidden=true;status.textContent='';select(id);doc.dispatchEvent(new doc.defaultView.Event('daily-mission-open'));return;}
   if(id==='monthly'){status.textContent='';select(id);monthly.open();return;}
   if(id==='contact'){status.textContent='';delete root.querySelector('#portal-contact').dataset.passwordLocked;select(id);contact.open();return;}
   if(id==='calendar'){status.textContent='';select(id);await booking.open();return;}
   if(id==='exercises'){exercisesUnlocked=true;select(id);await reloadFiles();return;}
   if(id==='exams'){assessmentUnlocked=true;select(id);await reloadFiles();profile.hidden=true;return;}
   const labels={exercises:'Practice Zone',material:'Learning Library',listening:'Listening Lab',practice:'Practice Zone',exams:'Test Yourself'};
   const owner=getTemporaryOwnerConnection(doc);
   const chosen=await chooseLearningLevel(doc,labels[id],async(level,passcode)=>{
    const response=await call('studentPortalAccess');latestItems=response.items;updatePasswordMetadata(response);
    if(owner){const check=await doc.defaultView.fetch(owner.endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'checkConnection',key:owner.key})});const result=await check.json();if(!check.ok||!result.ok)throw new Error('Reconnect Google Sheets in Instructor Portal before uploading.');return true;}
    return true;
   },{owner:Boolean(owner),passwordless:true});
   if(!chosen)return;if(learningLevel!==chosen.level)root.querySelectorAll('.temporary-portal-uploads').forEach(controls=>controls.remove());learningLevel=chosen.level;learningPasscode=chosen.passcode;assessmentUnlocked=false;select(id);renderFiles(latestItems);attachTemporaryPortalUploads(doc);
   if(id==='exams'){showAssessment(latestItems);attachTemporaryPortalUploads(doc);}
  }catch(error){if(!publicSectionSelected())status.textContent=error.message;}
 });
 tabs.forEach((tab,index)=>tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();}));
 function result(attempt,viewer){
  clearInterval(tick);busy=false;viewer.replaceChildren(text('h4','Level '+attempt.level),text('p','Assessment submitted. Your instructor will review it and send your final report separately.'));
 }
 async function openLevel(level){
  const current=epoch;status.textContent='Loading Level '+level+'…';
  try{
   const response=await call('studentExamGet',{level,examVersion:2});if(current!==epoch)return;
   let attempt=response.attempt;remember(level);panel.querySelector('.portal-document-viewer')?.remove();
   const viewer=doc.createElement('section');viewer.className='portal-document-viewer interactive-exam';panel.append(viewer);status.textContent='';
   if(attempt.submittedAt){result(attempt,viewer);return;}
   busy=true;viewer.append(text('h4','Level '+level),text('p','20 minutes. Answers are saved as you work. Your instructor will review your answers and prepare your final report. Complete each section before submitting.'));
   const timer=text('p','20:00 remaining');timer.className='student-assessment-timer';timer.setAttribute('role','timer');timer.setAttribute('aria-label','Time remaining');viewer.append(timer);
   const templateResponse=await doc.defaultView.fetch('./student-files/interactive-assessments/level-'+level+(attempt.answers?.examVersion===2?'-v2':'')+'.json');if(!templateResponse.ok)throw new Error('Assessment file could not load. Please retry.');const template=await templateResponse.json();if(current!==epoch)return;const examForm=createExamForm(doc,template);examForm.dataset.examVersion=String(template.version||1);
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
     catch(error){if(/another tab|assessment has changed/.test(error.message)){conflict=true;save.disabled=true;submit.disabled=true;}if(current===epoch)note.textContent=(action==='studentExamSubmit'?'Submission not confirmed: ':'Save not confirmed: ')+error.message;throw error;}
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
 async function openDocument(item,event){
  event.preventDefault();const current=epoch;status.textContent='Opening document…';
  try{const response=await call('studentPortalAccess'),fresh=response.items.find(entry=>entry.id===item.id);if(current!==epoch)return;if(!fresh?.enabled){status.textContent='This document is currently closed by your instructor.';return;}openLearningDocument(doc,{...fresh,title:learningDocumentTitle(fresh.title)});status.textContent='';}catch(error){if(current===epoch)status.textContent=error.message;}
 }
 function renderFiles(items){
  latestItems=items;
  for(const id of ['material','listening','practice','exercises']){
   const target=root.querySelector('#portal-'+id);delete target.dataset.passwordLocked;
   const existing=target.querySelector(':scope>.temporary-portal-uploads'),oldGrid=target.querySelector('.learning-document-grid');oldGrid?.remove();
   if(id!=='practice'){target.replaceChildren(text('h3',{material:'Learning Library',listening:'Listening Lab',exercises:'Practice Zone'}[id]),text('p',id==='exercises'?'Practice sheets and resources':learningLevel?'Level '+learningLevel:'Choose your level to view documents.'));if(existing)target.append(existing);}
   if(id==='exercises'?!exercisesUnlocked:!learningLevel){delete target.dataset.learningLevel;continue;}target.dataset.learningLevel=learningLevel||1;target.dataset.learningCategory=id;
   const grid=doc.createElement('div');grid.className='learning-document-grid';
   for(const item of items.filter(item=>(id==='exercises'||learningDocumentLevel(item)===learningLevel)&&(learningDocumentCategory(item)===id||(id==='material'&&learningDocumentCategory(item)==='listening')))){
    const card=createLearningDocumentCard(doc,item,event=>openDocument(item,event));grid.append(card);
   }
   if(!grid.children.length)grid.append(text('p','No documents have been added for Level '+learningLevel+' yet.'));
   target.append(grid);
  }
 }
 function openAssessmentGate(){const form=profile.querySelector('#student-assessment-start');if(!form)return;profile.hidden=false;form.elements.name.focus();}
 function showAssessment(items,open=true){
  delete panel.dataset.learningLevel;delete panel.dataset.learningCategory;
  panel.replaceChildren(text('h3','Test Yourself'),text('p','Enter your name and choose your level to begin your interactive examination. Your instructor reviews the submission privately.'));const gate=doc.createElement('div');gate.dataset.assessmentGate='';gate.hidden=true;gate.append(text('p','Choose an examination opened by your instructor, then enter your name to start.'));const openGate=text('button','Open Examinations');openGate.type='button';openGate.className='button light';openGate.onclick=openAssessmentGate;gate.append(openGate);panel.append(gate,profile);profile.hidden=true;const files=doc.createElement('div');files.className='interactive-assessment-files';files.hidden=!assessmentUnlocked;for(let n=1;n<=8;n++){const item=items.find(entry=>entry.id==='test:'+n),button=text('button','Level '+n);button.type='button';button.className='learning-exam-card assessment-file';const preview=doc.createElement('img');preview.src='./images/exam-previews/level-'+Math.min(n,6)+'.png';preview.alt='First page of the Level '+n+' examination';preview.loading='lazy';const caption=text('span','Level '+n+' examination');if(n<=6)button.replaceChildren(preview,caption);else{const cover=text('span','Interactive examination');cover.className='learning-document-placeholder';button.replaceChildren(cover,caption);}button.dataset.assessmentLevel=n;button.disabled=!item?.enabled;button.classList.toggle('learning-document-closed',!item?.enabled);button.setAttribute('aria-label','Level '+n+' interactive examination'+(!item?.enabled?' — closed by instructor':''));button.onclick=()=>{if(!item?.enabled)return;const form=profile.querySelector('#student-assessment-start');form.elements.level.value=n;profile.hidden=false;form.elements.name.focus();};files.append(button);}panel.append(files);  const password=text('label','Examination password:'),passwordInput=doc.createElement('input');password.hidden=true;passwordInput.name='assessmentPassword';passwordInput.value=examPasscode;passwordInput.type='password';passwordInput.required=false;passwordInput.autocomplete='off';password.append(passwordInput);
  const selection=doc.createElement('form');selection.className='student-assessment-start';selection.id='student-assessment-start';
  const name=text('label','Name:'),nameInput=doc.createElement('input');nameInput.name='name';nameInput.maxLength=100;nameInput.autocomplete='name';nameInput.required=true;nameInput.value=student?.name||'';name.append(nameInput);
  const age=text('label','Age:'),ageInput=doc.createElement('input');ageInput.name='age';ageInput.type='number';ageInput.min=1;ageInput.max=120;ageInput.required=false;ageInput.value=student?.age||'';age.append(ageInput);
  const program=text('label','Program:'),programInput=doc.createElement('input');programInput.name='program';programInput.maxLength=100;programInput.required=false;programInput.placeholder='e.g. General English';programInput.value=student?.program||'';program.append(programInput);
  const level=text('label','Level:'),selectLevel=doc.createElement('select');selectLevel.name='level';selectLevel.required=true;
  selectLevel.append(Object.assign(text('option','Choose your level'),{value:''}));
  for(let n=1;n<=8;n++){const option=text('option','Level '+n);option.value=String(n);option.disabled=!items.find(item=>item.id==='test:'+n)?.enabled;selectLevel.append(option);}level.append(selectLevel);
  const start=text('button','Start assessment');start.className='button';start.type='submit';level.hidden=false;selectLevel.value='';age.hidden=true;program.hidden=true;selection.append(password,name,level,age,program,start);const close=text('button','Hide details');close.type='button';close.className='button light small';close.onclick=()=>profile.hidden=true;profile.replaceChildren(text('h4','Assessment details'),selection,close);
  selection.onsubmit=async event=>{
   event.preventDefault();if(busy){status.textContent='Finish the current assessment before starting another.';return;}const current=epoch;start.disabled=true;
   try{const response=await call('studentExamLogin',{name:nameInput.value.trim(),program:programInput.value.trim(),...(ageInput.value?{age:Number(ageInput.value)}:{}),level:Number(selectLevel.value)});if(current!==epoch)return;token=response.token;student=response.student;const selectedLevel=Number(selectLevel.value),resume=resumableSession;if(resume?.token&&resume.level===selectedLevel&&resume.student?.name===student.name&&resume.student?.program===student.program){try{await call('studentExamGet',{token:resume.token,level:selectedLevel});token=resume.token;}catch(error){if(!/Your session expired/.test(error.message))throw error;}}if(current!==epoch)return;resumableSession=null;assessmentUnlocked=true;gate.hidden=true;files.hidden=false;profile.hidden=true;await openLevel(selectedLevel);}
   catch(error){if(/Incorrect assessment password/.test(error.message)){try{const remaining=noteWrongPassword(doc);if(current===epoch){status.textContent=error.message+' '+remaining+' attempts remaining.';passwordInput.setCustomValidity(error.message);passwordInput.reportValidity();passwordInput.oninput=()=>passwordInput.setCustomValidity('');}}catch{}}else if(current===epoch)status.textContent=error.message;}finally{start.disabled=false;}
  };
 }
 async function openStudent(){
  blocked.hidden=true;
  const current=epoch,request=++catalogRequest;catalogInFlight++;content.hidden=false;root.classList.add('portal-session-active');root.querySelector('#student-folder-title').textContent='Welcome back!';select(doc.defaultView.location.hash.endsWith('/calendar')?'calendar':null);if(doc.defaultView.location.hash.endsWith('/calendar'))booking.open();status.textContent='Loading available files and assessments…';renderFiles([]);showAssessment([],false);attachTemporaryPortalUploads(doc);
  try{const response=await call('studentPortalAccess');if(current!==epoch||request!==catalogRequest)return;updatePasswordMetadata(response);
   let saved;try{saved=JSON.parse(doc.defaultView.sessionStorage.getItem(SESSION_KEY)||'null');}catch{}
   if(saved?.token&&saved?.student){resumableSession=saved;student=saved.student;}
   renderFiles(response.items);showAssessment(response.items);attachTemporaryPortalUploads(doc);status.textContent='';
   
  }catch(error){if(current===epoch&&request===catalogRequest)fileLoadError(error);}finally{catalogInFlight--;}
  if(current!==epoch)return;clearInterval(accessTimer);accessTimer=setInterval(async()=>{if(current!==epoch||doc.hidden||publicSectionSelected()||busy||catalogInFlight)return;try{await reloadFiles();}catch{}},20000);
 }
 doc.addEventListener('portal-files-uploaded',async()=>{try{await reloadFiles();}catch{}});
 function showBlocked(message=PORTAL_LOCK_MESSAGE){lock();content.hidden=false;blocked.textContent=message;blocked.hidden=false;root.classList.add('portal-session-active');}
 function checkAttempts(){}
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
 function openCalendarRoute(){
  if(doc.defaultView.location.hash!=='#students-portal/calendar')return;
  if(root.querySelector('#client-portal').hidden||content.hidden){root.querySelector('[data-portal-area=client]').click();return;}
  select('calendar');booking.open();
 }
 doc.defaultView.addEventListener('hashchange',()=>{if(!doc.defaultView.location.hash.startsWith('#students-portal'))lock();else openCalendarRoute();});
 doc.defaultView.addEventListener('pagehide',lock);
 lock();
 if(doc.defaultView.location.hash.endsWith('/calendar'))Promise.resolve().then(openCalendarRoute);
 else if(new URL(doc.defaultView.location.href).searchParams.get('app')==='learner'&&(!doc.defaultView.location.hash||doc.defaultView.location.hash.startsWith('#students-portal')))Promise.resolve().then(()=>root.querySelector('[data-portal-area=client]').click());
}





