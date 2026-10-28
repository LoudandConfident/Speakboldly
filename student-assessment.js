import {initializeGeneralEnglishExams} from './general-english-exams.js?v=45-minute-1';
import {readDriveFolderFile} from './drive-folder-files.js?v=1';
import {renderPracticeZone,practiceAccessKey} from './practice-zone.js';
import {renderMaterialLibrary} from './material-library.js?v=program-cards-1';
import {createLoadingNotice} from './loading-notice.js?v=visible-loading';
import {enterHubLevel,hubGrantPayload,hubEntry,refreshHubAccess,updateHubAccess,hasHubGrant} from './hub-level-access.js?v=practice-zone-monthly-1';
import {withBerlitzBooks} from './berlitz-material.js?v=drive-folders-1';
import {initializeMonthlyLearning} from './monthly-learning.js?v=library-folders';
import {openLearningDocument,closeLearningDocument,updateLearningDocumentAccess} from './learning-document-viewer.js?v=drive-folders-1';
import {learningFolderPasswordGroup} from './learning-hub-sections.js?v=ask-coach-1';
import {initializeStudentContact} from './student-contact.js?v=submissions-1';
import {chooseLearningLevel} from './learning-level-dialog.js?v=password-free-1';
import {learningDocumentTitle,learningDocumentLevel,learningDocumentCategory,learningDocumentPart,createLearningDocumentCard} from './learning-document-cards.js?v=library-folders';
import {ensurePortalFolderTree,portalItemFolder} from './portal-folder-tree.js?v=learning-space';
import {initializePractice} from './student-practice.js';
import {assertPortalAllowed,noteWrongPassword,PORTAL_ATTEMPT_KEY,PORTAL_LOCK_MESSAGE,clearFolderPasswords,unlockStudentFolder} from './student-portal-attempts.js?v=ask-coach-1';
import {initializeStudentBooking} from './student-booking.js?v=success-return-1';
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
 const loadingNotice=createLoadingNotice(doc,root.querySelector('#client-portal'),'hub-loading-status'),pendingCatalog=new Map();
 initializePractice(doc);

 const tabs=[...root.querySelectorAll('[data-portal-tab]')].filter(el=>['exercises','material','exams','contact','calendar','practice','listening','monthly','mission','studio','accent'].includes(el.dataset.portalTab));
 let activeLearningSection=null,documentRequest=0;
 let learningLevel=null,learningPasscode='',examPasscode='',latestItems=[];
 let exercisesUnlocked=false;
 let passwordMetadata=null,assessmentUnlocked=false,resumableSession=null;
 let token='',student=null,epoch=0,saveTimer,tick,accessTimer,queue=Promise.resolve(),busy=false;
 const generalExams=initializeGeneralEnglishExams(doc,{call,panel,setBusy:value=>{busy=value;}});
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 async function performCall(action,data={}) {
  
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),30000);
  try {
   const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,hubGrants:hubGrantPayload(),...data}),signal:controller.signal});
   const result=await response.json();if(result.hubAccess)updateHubAccess(result.hubAccess,doc);if(action==='studentPortalAccess'&&Array.isArray(result.items))result.items=withBerlitzBooks(result.items.map(item=>({...item,enabled:result.passwordFreeFiles===true&&item.enabled})));
   if(!response.ok||!result.ok)throw new Error(/Incorrect connection key|Not authorized|Invalid action/.test(result.error||'')?'This part of the portal is not ready yet. Please contact your instructor.':result.error||'The assessment could not be saved.');
   return result;
  }catch(error){if(error.name==='AbortError')throw new Error(action==='studentPortalAccess'?'The shared file list took too long to load. Reopen the folder to retry.':action==='studentExamDraft'?'Saving answers took too long. Retry Save answers; your current answers are still on this page.':action==='studentExamSubmit'?'Submission confirmation took too long. Retry Submit assessment; the same attempt will not be duplicated.':'Google Sheets took too long to respond. Please try again.');if(error instanceof TypeError)throw new Error('Could not reach the portal. Please check your connection and try again.');throw error;}
  finally{clearTimeout(timer);}
 }
 function call(action,data={}){if(action!=='studentPortalAccess')return performCall(action,data);const signature=JSON.stringify([token,hubGrantPayload(),data]);if(pendingCatalog.has(signature))return pendingCatalog.get(signature);const promise=performCall(action,data).finally(()=>{if(pendingCatalog.get(signature)===promise)pendingCatalog.delete(signature);});pendingCatalog.set(signature,promise);return promise;}
 const collect=form=>{const answers=form.dataset.examVersion==='2'?{examVersion:2,A:{},B:{},C:{},D:{},E:'',F:{}}:{A:{},B:{},C:{},D:'',E:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [section,number]=name.split('.');if(number)answers[section][number]=(section==='A'||(answers.examVersion===2&&section==='C'))?Number(value):value;else answers[section]=value;}return answers;};
 function remember(level){try{doc.defaultView.sessionStorage.setItem(SESSION_KEY,JSON.stringify({token,student,level}));}catch{}}
 function lock(){generalExams.lock();activeLearningSection=null;loadingNotice.clear();pendingCatalog.clear();crumbs.hidden=true;crumbs.replaceChildren();epoch++;doc.dispatchEvent(new doc.defaultView.Event('student-portal-locking'));clearFolderPasswords(doc);learningLevel=null;learningPasscode='';examPasscode='';exercisesUnlocked=false;delete root.querySelector('#portal-contact').dataset.passwordLocked;clearTimeout(saveTimer);clearInterval(tick);clearInterval(accessTimer);profile.hidden=true;booking.lock();contact.lock();monthly.lock();token='';student=null;assessmentUnlocked=false;resumableSession=null;busy=false;content.hidden=true;panel.replaceChildren();root.classList.remove('portal-session-active');}
 const crumbs=doc.createElement('nav');crumbs.className='learning-breadcrumbs';crumbs.setAttribute('aria-label','Learning Hub breadcrumb');crumbs.hidden=true;root.querySelector('[data-learning-back]')?.after(crumbs);
 function publicSectionSelected(){return tabs.some(tab=>['contact','calendar','monthly','mission','studio','accent'].includes(tab.dataset.portalTab)&&tab.getAttribute('aria-selected')==='true');}
 function select(id){if(id==='contact'){const previous=tabs.find(tab=>tab.getAttribute('aria-selected')==='true')?.dataset.portalTab;if(previous!=='contact')root.dataset.contactReturnPanel=previous||'';}loadingNotice.clear();retryFiles.hidden=true;if(['contact','calendar','monthly','mission','studio','accent'].includes(id))status.textContent='';root.classList.toggle('learning-section-open',Boolean(id));if(id!=='mission')doc.dispatchEvent(new doc.defaultView.Event('daily-mission-pause'));closeLearningDocument(doc);crumbs.replaceChildren();crumbs.hidden=!id;if(id){const home=text('button','Learning Hub');home.type='button';home.onclick=()=>select(null);crumbs.append(home,text('span',' → '+({exercises:'Practice Zone',material:'Learning Library',exams:'Test Yourself',practice:'Practice Zone',listening:'Listening Lab',calendar:'Session Calendar',contact:'Ask your coach',monthly:'Real English',mission:'Daily Challenge',studio:'SB Studio',accent:'Accent'}[id]||id)+(learningLevel&&!['calendar','contact','monthly','mission','studio','accent','exercises','practice','exams'].includes(id)?' → Level '+learningLevel:'')));}tabs.forEach((tab,index)=>{const active=tab.dataset.portalTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active||(!id&&index===0)?0:-1;});root.querySelectorAll('[data-portal-panel]').forEach(p=>p.hidden=p.dataset.portalPanel!==id);const back=root.querySelector('[data-learning-back]');if(back)back.hidden=!id;if(id)doc.defaultView.scrollTo({top:0,behavior:'instant'});}
 doc.addEventListener('student-contact-sent-return',()=>select(root.dataset.contactReturnPanel||null));
 doc.addEventListener('daily-mission-contact',event=>{status.textContent='';delete root.querySelector('#portal-contact').dataset.passwordLocked;select('contact');contact.open(event.detail?.message);});
 doc.addEventListener('daily-mission-home',()=>{select(null);root.querySelector('.learning-space-heading')?.scrollIntoView({block:'start',behavior:'auto'});});
 root.querySelector('[data-learning-back]')?.addEventListener('click',()=>{select(null);root.querySelector('.learning-space-heading')?.scrollIntoView({block:'start',behavior:'auto'});});
 root.querySelectorAll('[data-learning-open]').forEach(button=>button.onclick=()=>root.querySelector('[data-portal-tab="'+button.dataset.learningOpen+'"]')?.click());
 const retryFiles=text('button','Retry loading files');retryFiles.type='button';retryFiles.className='button light small';retryFiles.hidden=true;status.after(retryFiles);
 let catalogRequest=0,catalogInFlight=0;
 function fileLoadError(error){if(publicSectionSelected()||content.hidden)return;status.textContent=error.message;retryFiles.hidden=false;}
 async function reloadFiles(silent=false){const endLoading=silent?()=>{}:loadingNotice.start('Loading your files…');const current=epoch,request=++catalogRequest;catalogInFlight++;retryFiles.hidden=true;if(!publicSectionSelected())status.textContent='Loading files…';try{const response=await call('studentPortalAccess');if(current!==epoch||request!==catalogRequest)return;updatePasswordMetadata(response);updateLearningDocumentAccess(doc,response.items);renderFiles(response.items);if(!busy)showAssessment(response.items);if(!publicSectionSelected())status.textContent='';return response;}catch(error){if(current===epoch&&request===catalogRequest)fileLoadError(error);throw error;}finally{catalogInFlight--;endLoading();}}
 retryFiles.onclick=async()=>{retryFiles.disabled=true;try{await reloadFiles();}catch{}finally{retryFiles.disabled=false;}};
 function updatePasswordMetadata(response){passwordMetadata=null;}
 tabs.forEach(tab=>tab.onclick=async()=>{
  const endLoading=loadingNotice.start('Loading '+tab.querySelector('.learning-space-card-title').textContent+'…');
  try{const id=tab.dataset.portalTab;if(busy&&id==='exams'){select(id);return;}if(busy&&!['contact','calendar','monthly','mission','studio','accent'].includes(id)){status.textContent='Finish your current examination before opening another section.';return;}
   if(id==='accent'){blocked.hidden=true;status.textContent='';select(id);return;}
   if(id==='studio'){blocked.hidden=true;status.textContent='';select(id);return;}
   if(id==='mission'){if(!await enterHubLevel(doc,'mission'))return;blocked.hidden=true;status.textContent='';select(id);doc.dispatchEvent(new doc.defaultView.Event('daily-mission-open'));return;}
   if(id==='monthly'){if(!await enterHubLevel(doc,'monthly'))return;status.textContent='';select(id);monthly.open();return;}
   if(id==='contact'){status.textContent='';delete root.querySelector('#portal-contact').dataset.passwordLocked;select(id);contact.open();return;}
   if(id==='calendar'){status.textContent='';select(id);await booking.open();return;}
   if(id==='exercises'&&!await enterHubLevel(doc,'exercises:1'))return;
   if(['exercises','material','listening','exams'].includes(id)){learningLevel=null;if(id==='material')libraryFolder=null;activeLearningSection=id;assessmentUnlocked=id==='exams';exercisesUnlocked=id==='exercises';select(id);if(id==='exams')showAssessment(latestItems);else renderFiles(latestItems);await reloadFiles();profile.hidden=true;return;}
  }catch(error){status.textContent=error.message;}finally{endLoading();}
 });
 tabs.forEach((tab,index)=>tab.addEventListener('keydown',event=>{let next;if(event.key==='ArrowRight')next=(index+1)%tabs.length;else if(event.key==='ArrowLeft')next=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=tabs.length-1;else return;event.preventDefault();tabs[next].focus();}));
 async function openDocument(item,event){
  event.preventDefault();const current=epoch,reading=++documentRequest;status.textContent='Opening document…';
  try{if(learningDocumentCategory(item)==='exercises'&&(item.requiresAccess||!item.url)){const key=practiceAccessKey(item,hubEntry);if(!key)throw new Error('Practice Zone is currently closed by your instructor.');if(!await enterHubLevel(doc,key))return;}const response=await call('studentPortalAccess'),fresh=response.items.find(entry=>entry.id===item.id);if(current!==epoch)return;if(!fresh?.enabled){status.textContent='This document is currently closed by your instructor.';return;}if(fresh.driveFolder){const inline=await readDriveFolderFile(call,fresh,{valid:()=>current===epoch&&reading===documentRequest,progress:percent=>{status.textContent='Loading material… '+percent+'%';}});if(!inline)return;openLearningDocument(doc,{...fresh,title:learningDocumentTitle(fresh.title),inline});}else if(/^https:\/\/drive\.google\.com\/file\/d\//.test(fresh.url)&&/^Level[\s_-]*(?:1[0-2]|[1-9])\s*[—:-]\s*(Main Book|Activity|Audio|Practice)\s*[—:-]/i.test(fresh.title)){const file=await call('studentLibraryRead',{itemId:fresh.id});if(current!==epoch)return;openLearningDocument(doc,{...fresh,title:learningDocumentTitle(fresh.title),inline:file});}else openLearningDocument(doc,{...fresh,title:learningDocumentTitle(fresh.title)});status.textContent='';}catch(error){if(current===epoch)status.textContent=error.message;}
 }
 const sectionNames={material:'Learning Library',listening:'Listening Lab',exercises:'Practice Zone'};
 function matchingFiles(id,level,items){return items.filter(item=>(learningDocumentLevel(item)===level||(id==='exercises'&&!learningDocumentLevel(item)))&&(learningDocumentCategory(item)===id||(id==='material'&&learningDocumentCategory(item)==='listening')));}
 let libraryFolder=null;
 function renderFiles(items){latestItems=items;
  for(const id of ['material','listening','exercises']){const target=root.querySelector('#portal-'+id);delete target.dataset.passwordLocked;target.replaceChildren(text('h3',sectionNames[id]));
   if(id==='exercises'){renderPracticeZone(doc,target,items,openDocument);continue;}
   if(id==='material'){renderMaterialLibrary(doc,target,{folder:libraryFolder,level:learningLevel,items:learningLevel?matchingFiles(id,learningLevel,items):[],enabled:n=>hubEntry('material:'+n)?.enabled,chooseFolder:async key=>{if(key==='general'){libraryFolder=key;learningLevel=null;renderFiles(latestItems);return;}try{if(!await enterHubLevel(doc,'material:1'))return;await reloadFiles();libraryFolder=key;learningLevel=1;activeLearningSection='material';renderFiles(latestItems);select('material');}catch(e){status.textContent=e.message;}},chooseLevel:async n=>{try{if(!await enterHubLevel(doc,'material:'+n))return;await reloadFiles();learningLevel=n;activeLearningSection='material';renderFiles(latestItems);select('material');}catch(e){status.textContent=e.message;}},back:()=>{if(libraryFolder==='general'&&learningLevel)learningLevel=null;else{libraryFolder=null;learningLevel=null;}renderFiles(latestItems);},open:openDocument});continue;}

   if(activeLearningSection===id&&learningLevel){target.dataset.learningLevel=learningLevel;target.dataset.learningCategory=id;const back=text('button','Choose another level');back.type='button';back.className='button light small';back.onclick=()=>{learningLevel=null;renderFiles(latestItems);};target.append(text('p','Level '+learningLevel),back);const grid=doc.createElement('div');grid.className='learning-document-grid';const matched=matchingFiles(id,learningLevel,items);if(id==='material'){for(const [part,label]of [['book','Main book'],['activity','Activities'],['audio','Audio']]){const section=doc.createElement('section');section.className='library-level-part';section.dataset.libraryPart=part;section.append(text('h4',label));const files=doc.createElement('div');files.className='learning-document-grid';for(const item of matched.filter(i=>learningDocumentPart(i)===part))files.append(createLearningDocumentCard(doc,item,event=>openDocument(item,event)));if(!files.children.length)files.append(text('p','No files uploaded yet.'));section.append(files);grid.append(section);}grid.className='library-level-parts';}else for(const item of matched)grid.append(createLearningDocumentCard(doc,item,event=>openDocument(item,event)));target.append(grid);continue;}
   delete target.dataset.learningLevel;target.append(text('p','Choose your level. Closed levels will be opened by your instructor.'));const grid=doc.createElement('div');grid.className='portal-level-menu';grid.setAttribute('aria-label',sectionNames[id]+' levels');
   for(let n=1;n<=12;n++){const button=text('button','Level '+n);button.type='button';button.className='portal-level-button';button.disabled=!hubEntry(id+':'+n)?.enabled;button.setAttribute('aria-label',sectionNames[id]+' Level '+n+(button.disabled?' — currently closed':''));button.onclick=async()=>{try{if(!await enterHubLevel(doc,id+':'+n))return;await reloadFiles();learningLevel=n;activeLearningSection=id;renderFiles(latestItems);select(id);}catch(e){status.textContent=e.message;}};grid.append(button);}target.append(grid);
  }
 }
 function openAssessmentGate(){const form=profile.querySelector('#student-assessment-start');if(!form)return;profile.hidden=false;form.elements.name.focus();}
 function showAssessment(){profile.hidden=true;generalExams.show(activeLearningSection==='exams');}
 async function openStudent(){
  blocked.hidden=true;
  const current=epoch,request=++catalogRequest;catalogInFlight++;content.hidden=false;root.classList.add('portal-session-active');root.querySelector('#student-folder-title').textContent='Welcome back!';select(doc.defaultView.location.hash.endsWith('/calendar')?'calendar':null);const endLoading=loadingNotice.start('Loading your dashboard…');if(doc.defaultView.location.hash.endsWith('/calendar'))booking.open();status.textContent='Loading available files and assessments…';renderFiles([]);showAssessment([],false);
  try{const response=await call('studentPortalAccess');if(current!==epoch||request!==catalogRequest)return;updatePasswordMetadata(response);
   let saved;try{saved=JSON.parse(doc.defaultView.sessionStorage.getItem(SESSION_KEY)||'null');}catch{}
   if(saved?.token&&saved?.student){resumableSession=saved;student=saved.student;}
   renderFiles(response.items);showAssessment(response.items);status.textContent='';
   
  }catch(error){if(current===epoch&&request===catalogRequest)fileLoadError(error);}finally{catalogInFlight--;endLoading();}
  if(current!==epoch)return;clearInterval(accessTimer);accessTimer=setInterval(async()=>{if(current!==epoch||doc.hidden||busy||catalogInFlight)return;const freeTab=tabs.find(t=>['mission','monthly'].includes(t.dataset.portalTab)&&t.getAttribute('aria-selected')==='true');if(freeTab){try{await refreshHubAccess(doc,true);if(!hasHubGrant(freeTab.dataset.portalTab)){select(null);status.textContent='This section now needs the password shared by your instructor.';}}catch{}return;}if(publicSectionSelected())return;if(tabs.some(t=>t.dataset.portalTab==='exercises'&&t.getAttribute('aria-selected')==='true')&&!hasHubGrant('exercises:1')){select(null);status.textContent='Enter the current monthly Practice Zone password to continue.';return;}const filesOpen=tabs.some(tab=>['material','exercises','exams','listening'].includes(tab.dataset.portalTab)&&tab.getAttribute('aria-selected')==='true');if(!filesOpen)return;try{await reloadFiles(true);}catch{}},20000);
 }
 doc.addEventListener('portal-files-uploaded',async()=>{try{await reloadFiles();}catch{}});
 function showBlocked(message=PORTAL_LOCK_MESSAGE){lock();content.hidden=false;blocked.textContent=message;blocked.hidden=false;root.classList.add('portal-session-active');}
 function checkAttempts(){}
 doc.defaultView.addEventListener('student-password-attempts-changed',checkAttempts);doc.defaultView.addEventListener('storage',event=>{if(event.key===PORTAL_ATTEMPT_KEY)checkAttempts();});
 root.querySelector('#portal-sign-out')?.addEventListener('click',()=>{
  if(busy&&!doc.defaultView.confirm('Leave this assessment? The 45-minute timer will keep running. Saved answers will still be submitted.'))return;
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







