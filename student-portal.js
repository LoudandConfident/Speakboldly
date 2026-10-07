import {getStudentCode,portalResources} from './portal-config.js';
import {loadPortalMaterials} from './portal-materials.js';
export function initializeStudentPortal(doc,code,resources,loader=loadPortalMaterials){
 const root=doc.querySelector('#students-portal');if(!root)return;
 const areaButtons=[...root.querySelectorAll('[data-portal-area]')];
 areaButtons.forEach(button=>button.addEventListener('click',()=>{
  const area=button.dataset.portalArea;
  areaButtons.forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
  root.querySelector('#client-portal').hidden=area!=='client';
  root.querySelector('#admin-portal').hidden=area!=='admin';
  if(area==='client'&&unlocked)refreshMaterials();
 }));
 const form=root.querySelector('#student-code-form'),gate=root.querySelector('#portal-gate'),content=root.querySelector('#portal-content'),error=root.querySelector('#student-code-error'),input=form.querySelector('input');
 const tabs=[...root.querySelectorAll('[data-portal-tab]')],panels=[...root.querySelectorAll('[data-portal-panel]')];let unlocked=false;
 const readCode=()=>String(typeof code==='function'?code():code);let currentCode=readCode();
 function select(id,focus=false){
  if(!unlocked)return;
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
  if(/\.(png|jpe?g|webp|gif|avif|svg)$/i.test(url.pathname)){const img=doc.createElement('img');img.src=url.href;img.alt=title;img.className='portal-document-image';viewer.append(img);}
  else if(/\.pdf$/i.test(url.pathname)){const iframe=doc.createElement('iframe');const source=new URL(url.href);source.hash='toolbar=0&navpanes=0';iframe.src=source.href;iframe.title=title;iframe.className='portal-document-frame';viewer.append(iframe);}
  else if(/\.(mp4|webm|mp3|wav|ogg)$/i.test(url.pathname)){const media=doc.createElement(/\.(mp4|webm)$/i.test(url.pathname)?'video':'audio');media.src=url.href;media.controls=true;media.setAttribute('controlsList','nodownload');viewer.append(media);}
  else{const message=doc.createElement('p');message.textContent='This file format cannot be shown inline. Please ask your teacher for a PDF or image version.';viewer.append(message);}
  panel.append(viewer);heading.focus();
 }
 function renderResources(panel,items){
  const list=panel.querySelector('ul');list.replaceChildren();
  for(const item of items){
   if(!item||typeof item.title!=='string'||typeof item.url!=='string')continue;
   let url;try{url=new URL(item.url,doc.baseURI);}catch{continue;}
   if(!['http:','https:'].includes(url.protocol))continue;
   const li=doc.createElement('li'),button=doc.createElement('button');button.type='button';button.textContent=item.title;button.className='portal-resource';button.onclick=()=>showDocument(panel,item.title,url);li.append(button);list.append(li);
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
 function lock(focus=true){
  unlocked=false;gate.hidden=false;content.hidden=true;panels.forEach(panel=>panel.hidden=true);form.reset();error.textContent='';input.removeAttribute('aria-invalid');if(focus)input.focus();
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();refreshCode();if(!currentCode.trim()||input.value.trim()!==currentCode){error.textContent='That Student Code is incorrect. Please try again.';input.setAttribute('aria-invalid','true');input.focus();return;}
  unlocked=true;error.textContent='';input.removeAttribute('aria-invalid');input.value='';gate.hidden=true;content.hidden=false;select('exercises',true);if(!materialsLoaded)refreshMaterials();
 });
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab.dataset.portalTab));
  tab.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%tabs.length;else if(event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();select(tabs[index].dataset.portalTab,true);});
 });
 function refreshCode(){const next=readCode();if(next!==currentCode){currentCode=next;lock(false);error.textContent='The Student Code has changed. Please enter your code again.';}}
 doc.defaultView.setInterval(refreshCode,30000);
 doc.addEventListener('visibilitychange',refreshCode);
 root.querySelector('#lock-student-portal').addEventListener('click',()=>lock());
 lock(false);
}
if(typeof document!=='undefined')initializeStudentPortal(document,getStudentCode,portalResources);
