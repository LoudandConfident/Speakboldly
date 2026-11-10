// Keep the page help control outside scrolling/animated page containers.
export function initializeFixedPageHelp(doc){
 if(doc.querySelector('#sb-fixed-page-help'))return;
 const win=doc.defaultView,button=doc.createElement('button');button.id='sb-fixed-page-help';button.type='button';button.textContent='?';button.hidden=true;button.setAttribute('aria-haspopup','dialog');doc.body.append(button);doc.body.classList.add('sb-fixed-help-ready');let target=null,queued=false;
 const visible=element=>{if(!element||!element.isConnected)return false;for(let node=element;node&&node!==doc.body;node=node.parentElement){if(node.hidden||win.getComputedStyle(node).display==='none')return false;}return true;};
 function update(){queued=false;let next=null;const root=doc.querySelector('#students-portal');
  if(visible(root)&&visible(root.querySelector('#portal-content'))){
   const panel=[...root.querySelectorAll('[data-portal-panel]')].find(visible);
   if(panel)next=panel.querySelector('.daily-fixed-help .sb-help-button,.real-english-side>.sb-help .sb-help-button,:scope>.section-guide');
   else next=root.querySelector('.dashboard-help-circle');
  }
  if(!next){const contact=doc.querySelector('#contact');if(visible(contact))next=contact.querySelector('.contact-promotion-rail>.sb-help .sb-help-button');}
  target=visible(next)?next:null;button.hidden=!target;if(target){const label=target.getAttribute('aria-label')||'Help for this page';if(button.getAttribute('aria-label')!==label)button.setAttribute('aria-label',label);}
 }
 const schedule=()=>{if(!queued){queued=true;win.requestAnimationFrame(update);}};
 button.onclick=()=>{if(target&&visible(target))target.click();};
 doc.addEventListener('close',event=>{if(event.target.matches?.('.sb-help-popup,.section-guide-popup')&&!button.hidden)button.focus({preventScroll:true});},true);
 new win.MutationObserver(records=>{if(records.some(record=>record.target!==button))schedule();}).observe(doc.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','class','style','aria-selected']});
 win.addEventListener('hashchange',schedule);win.addEventListener('resize',schedule);win.addEventListener('pageshow',schedule);update();
}
