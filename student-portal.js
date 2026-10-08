import {renderPdf} from './portal-document.js';
import {takeStudentAttempt} from './student-attempts.js';
import {showInteractiveExam} from './interactive-exams.js';
import {backendBase,loginStudent,clearStudent,fileBytes} from './exam-api.js';
import {findStudentAccess,canOpenSection,canOpenFile} from './portal-access.js';
import {portalResources} from './portal-config.js';
import {loadPortalMaterials} from './portal-materials.js';
export function initializeStudentPortal(doc,lookup,resources,loader=loadPortalMaterials){
 const root=doc.querySelector('#students-portal');if(!root)return;
 const areaButtons=[...root.querySelectorAll('[data-portal-area]')];
 areaButtons.forEach(button=>button.addEventListener('click',()=>{
  const area=button.dataset.portalArea;
  areaButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  root.querySelector('#client-portal').hidden=area!=='client';
  root.querySelector('#admin-portal').hidden=area!=='admin';
  if(area==='admin')lock(false);
  if(area==='client'&&unlocked)refreshMaterials();
 }));
 const form=root.querySelector('#student-code-form'),gate=root.querySelector('#portal-gate'),content=root.querySelector('#portal-content'),error=root.querySelector('#student-code-error'),input=form.querySelector('input');
 const tabs=[...root.querySelectorAll('[data-portal-tab]')],panels=[...root.querySelectorAll('[data-portal-panel]')];let unlocked=false;
 let access=null;const status=root.querySelector('#portal-access-status');
 const allowedSection=id=>access?.adminPreview||canOpenSection(access,id);
 const allowedFile=(id,url)=>access?.adminPreview||canOpenFile(access,id,url);
 const catalog={};
 function updateAccess(){root.querySelector('#student-folder-title').textContent=access?.adminPreview?'Admin — full library':'Client '+access?.number+' · Level / Program '+access?.level;tabs.forEach(tab=>{const allowed=allowedSection(tab.dataset.portalTab);tab.classList.toggle('portal-locked',!allowed);tab.setAttribute('aria-disabled',String(!allowed));tab.querySelector('.portal-lock-symbol')?.remove();if(!allowed){const mark=doc.createElement('span');mark.className='portal-lock-symbol';mark.textContent=' 🔒';tab.append(mark);}});panels.forEach(panel=>{panel.querySelector('.portal-document-viewer')?.remove();renderResources(panel,catalog[panel.dataset.portalPanel]||[]);});const first=tabs.find(t=>allowedSection(t.dataset.portalTab));panels.forEach(p=>p.hidden=true);if(first)select(first.dataset.portalTab);status.textContent=access?.adminPreview?'Admin preview — all materials':first?'':'Your teacher has not assigned access yet.';}
 function select(id,focus=false){
  if(!unlocked)return;
  status.textContent=allowedSection(id)?'':'🔒 Your teacher has not granted access to this folder.';
  tabs.forEach(tab=>{const active=tab.dataset.portalTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
  panels.forEach(panel=>panel.hidden=panel.dataset.portalPanel!==id);
 }
 let materialsLoaded=false,loading=false;
 function showDocument(panel,title,url){
  panel.querySelector('.portal-document-viewer')?.remove();
  const viewer=doc.createElement('section');viewer.className='portal-document-viewer';
  const heading=doc.createElement('h4');heading.textContent=title;heading.tabIndex=-1;
  const close=doc.createElement('button');close.type='button';close.className='button light small';close.textContent='Close document';close.onclick=()=>viewer.remove();
  viewer.append(heading,close);
  const examLevel=panel.dataset.portalPanel==='exams'?url.pathname.match(/Level-([1-6])-Exam\.pdf$/i):null;
  if(examLevel&&!access?.adminPreview){showInteractiveExam(doc,panel,Number(examLevel[1]),access);return;}
  if(examLevel){const action=doc.createElement('button');action.type='button';action.className='button';action.textContent='Take interactive exam';action.onclick=()=>showInteractiveExam(doc,panel,Number(examLevel[1]),access);viewer.append(action);}
  if(/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(url.pathname)){const img=doc.createElement('img');if(url.pathname.startsWith('/api/files/'))fileBytes(url.href).then(bytes=>{if(viewer.isConnected){const objectUrl=URL.createObjectURL(new Blob([bytes]));img.src=objectUrl;close.addEventListener('click',()=>URL.revokeObjectURL(objectUrl),{once:true});}}).catch(()=>{status.textContent='File could not load.';});else img.src=url.href;img.alt=title;img.className='portal-document-image';viewer.append(img);}
  else if(/\.pdf$/i.test(url.pathname)){renderPdf(doc,viewer,url.href);}
  else if(/\.(mp4|webm|mp3|wav|ogg)$/i.test(url.pathname)){const media=doc.createElement(/\.(mp4|webm)$/i.test(url.pathname)?'video':'audio');if(url.pathname.startsWith('/api/files/'))fileBytes(url.href).then(bytes=>{if(viewer.isConnected){const objectUrl=URL.createObjectURL(new Blob([bytes]));media.src=objectUrl;close.addEventListener('click',()=>URL.revokeObjectURL(objectUrl),{once:true});}}).catch(()=>{status.textContent='File could not load.';});else media.src=url.href;media.controls=true;media.setAttribute('controlsList','nodownload');viewer.append(media);}
  else{const message=doc.createElement('p');message.textContent='This file format cannot be shown inline. Please ask your teacher for a PDF or image version.';viewer.append(message);}
  panel.append(viewer);heading.focus();
 }
 function renderResources(panel,items){
  catalog[panel.dataset.portalPanel]=items;const list=panel.querySelector('ul');list.replaceChildren();
  for(const item of items){
   if(!item||typeof item.title!=='string'||typeof item.url!=='string')continue;
   let url;try{url=new URL(item.url,doc.baseURI);}catch{continue;}
   if(!['http:','https:'].includes(url.protocol))continue;
   const li=doc.createElement('li'),button=doc.createElement('button');button.type='button';button.textContent=item.title;button.className='portal-resource';const allowed=allowedFile(panel.dataset.portalPanel,url.href);button.classList.toggle('portal-locked',!allowed);button.setAttribute('aria-disabled',String(!allowed));if(!allowed)button.textContent+=' 🔒';button.onclick=()=>{if(allowedFile(panel.dataset.portalPanel,url.href))showDocument(panel,item.title,url);else status.textContent='🔒 Your teacher has not granted access to this file.';};if(panel.dataset.portalPanel==='exams'){
    const match=item.title.match(/^Level[ -]+([1-6])[ -]+Exam$/i);
    if(match){li.className='portal-exam-partition';const heading=doc.createElement('h4');heading.textContent='Level '+['one','two','three','four','five','six'][Number(match[1])-1]+' exam:';li.append(heading);button.textContent='Open exam'+(allowed?'':' 🔒');button.setAttribute('aria-label','Open level '+match[1]+' exam');}
   }li.append(button);list.append(li);
  }
  panel.querySelector('.portal-empty').hidden=list.children.length>0;
 }
 panels.forEach(panel=>renderResources(panel,resources[panel.dataset.portalPanel]||[]));
 async function refreshMaterials(){
  if(!unlocked||loading)return;loading=true;let failed=false;
  await Promise.all(panels.map(async panel=>{
   let status=panel.querySelector('.portal-load-status');if(!status){status=doc.createElement('p');status.className='portal-load-status demo-note';status.setAttribute('role','status');panel.append(status);}status.textContent='Loading materials…';
   try{const items=await loader(panel.dataset.portalPanel);renderResources(panel,[...(resources[panel.dataset.portalPanel]||[]),...items]);status.textContent='';}
   catch{failed=true;status.textContent='Materials could not load. Please reopen the Student portal to try again.';}
  }));
  materialsLoaded=!failed;loading=false;
 }
 let generation=0;
 function lock(focus=true){
  generation++;doc.dispatchEvent(new doc.defaultView.Event('student-portal-locking'));
  unlocked=false;access=null;clearStudent();panels.forEach(panel=>panel.querySelector('.portal-document-viewer')?.remove());gate.hidden=false;content.hidden=true;panels.forEach(panel=>panel.hidden=true);form.reset();error.textContent='';input.removeAttribute('aria-invalid');if(focus)input.focus();
 }
 form.addEventListener('submit',async event=>{
  event.preventDefault();const epoch=generation;let found;const code=input.value.trim();try{if(code!=='1962'&&!backendBase())takeStudentAttempt(doc.defaultView.localStorage);found=backendBase()&&code!=='1962'?await loginStudent(code):lookup(code);}catch(message){error.textContent=message.message;return;}if(!found){error.textContent='That Student Code is incorrect. Please ask your teacher for your code.';input.setAttribute('aria-invalid','true');input.focus();return;}
  if(epoch!==generation){clearStudent();return;}access=found;unlocked=true;error.textContent='';input.removeAttribute('aria-invalid');input.value='';gate.hidden=true;content.hidden=false;updateAccess();refreshMaterials();
 });
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab.dataset.portalTab));
  tab.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%tabs.length;else if(event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();select(tabs[index].dataset.portalTab,true);});
 });
 doc.addEventListener('portal-permissions-changed',()=>{if(!unlocked||access?.adminPreview)return;const next=lookup(access.code);if(!next){lock(false);return;}access=next;updateAccess();});
 doc.addEventListener('portal-admin-preview',()=>{access={adminPreview:true};unlocked=true;gate.hidden=true;content.hidden=false;updateAccess();refreshMaterials();});
 doc.defaultView.addEventListener('hashchange',()=>{if(!doc.defaultView.location.hash.startsWith('#students-portal'))lock(false);});
 doc.defaultView.addEventListener('pagehide',()=>lock(false));
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden&&unlocked)lock(false);});
 root.addEventListener('contextmenu',event=>{if(unlocked&&event.target.closest('#portal-content'))event.preventDefault();});
 root.addEventListener('dragstart',event=>{if(unlocked&&event.target.closest('#portal-content'))event.preventDefault();});
 doc.addEventListener('keydown',event=>{if(unlocked&&(event.ctrlKey||event.metaKey)&&['s','p'].includes(event.key.toLowerCase()))event.preventDefault();});
 root.querySelector('#lock-student-portal').addEventListener('click',()=>lock());
 lock(false);
}
if(typeof document!=='undefined')initializeStudentPortal(document,code=>findStudentAccess(code,document.defaultView.localStorage),portalResources);
