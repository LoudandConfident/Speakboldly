import {STUDENT_CODE,portalResources} from './portal-config.js';
export function initializeStudentPortal(doc,code,resources){
 const root=doc.querySelector('#students-portal');if(!root)return;
 const form=root.querySelector('#student-code-form'),gate=root.querySelector('#portal-gate'),content=root.querySelector('#portal-content'),error=root.querySelector('#student-code-error'),input=form.querySelector('input');
 const tabs=[...root.querySelectorAll('[data-portal-tab]')],panels=[...root.querySelectorAll('[data-portal-panel]')];let unlocked=false;
 function select(id,focus=false){
  if(!unlocked)return;
  tabs.forEach(tab=>{const active=tab.dataset.portalTab===id;tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;if(active&&focus)tab.focus();});
  panels.forEach(panel=>panel.hidden=panel.dataset.portalPanel!==id);
 }
 for(const panel of panels){
  const list=panel.querySelector('ul'),items=resources[panel.dataset.portalPanel]||[];list.replaceChildren();
  for(const item of items){
   if(!item||typeof item.title!=='string'||typeof item.url!=='string')continue;
   let url;try{url=new URL(item.url,doc.baseURI);}catch{continue;}
   if(!['http:','https:'].includes(url.protocol))continue;
   const li=doc.createElement('li'),link=doc.createElement('a');link.textContent=item.title;link.href=url.href;link.className='portal-resource';link.target='_blank';link.rel='noopener noreferrer';if(panel.dataset.portalPanel==='reports')link.download='';li.append(link);list.append(li);
  }
  panel.querySelector('.portal-empty').hidden=list.children.length>0;
 }
 function lock(focus=true){
  unlocked=false;gate.hidden=false;content.hidden=true;panels.forEach(panel=>panel.hidden=true);form.reset();error.textContent='';input.removeAttribute('aria-invalid');if(focus)input.focus();
 }
 form.addEventListener('submit',event=>{
  event.preventDefault();if(!String(code).trim()||input.value.trim()!==String(code)){error.textContent='That Student Code is incorrect. Please try again.';input.setAttribute('aria-invalid','true');input.focus();return;}
  unlocked=true;error.textContent='';input.removeAttribute('aria-invalid');input.value='';gate.hidden=true;content.hidden=false;select('exercises',true);
 });
 tabs.forEach((tab,i)=>{
  tab.addEventListener('click',()=>select(tab.dataset.portalTab));
  tab.addEventListener('keydown',event=>{let index;if(event.key==='ArrowRight')index=(i+1)%tabs.length;else if(event.key==='ArrowLeft')index=(i+tabs.length-1)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();select(tabs[index].dataset.portalTab,true);});
 });
 root.querySelector('#lock-student-portal').addEventListener('click',()=>lock());
 lock(false);
}
if(typeof document!=='undefined')initializeStudentPortal(document,STUDENT_CODE,portalResources);
