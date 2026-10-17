import {renderBookingRequestCards} from './booking-request-cards.js?v=reliability';
import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=level-history';
import {clockText12} from './platform-time.js';
export function initializeInstructorOverview(doc,isUnlocked,actions={}){
 const host=doc.querySelector('#admin-overview');if(!host)return;
 const root=doc.createElement('section');root.className='instructor-overview';host.prepend(root);
 let generation=0,loading=false,lastLoaded=0,pendingRefresh=false;
 function el(tag,value){const node=doc.createElement(tag);node.textContent=value;return node;}
 function button(label,fn){const node=el('button',label);node.type='button';node.className='button light small';node.onclick=fn;return node;}
 function draw(data){
  root.replaceChildren();const heading=el('div','');heading.className='overview-heading';heading.append(el('h3','Your dashboard'),button('Refresh',()=>refresh(true)));root.append(heading);
  const controls=el('div','');controls.className='calendar-toolbar';const openCalendar=()=>{const calendar=doc.querySelector('#admin-calendar');if(!calendar)return;const panel=calendar.closest('details');if(panel)panel.open=true;calendar.scrollIntoView({behavior:'smooth',block:'start'});};controls.append(button('Calendar',openCalendar));
  const label=el('label','Choose view'),view=doc.createElement('select');view.setAttribute('aria-label','Choose calendar view');for(const value of ['month','week','day'])view.append(new doc.defaultView.Option(value[0].toUpperCase()+value.slice(1),value));view.onchange=()=>{doc.dispatchEvent(new doc.defaultView.CustomEvent('instructor-calendar-view',{detail:view.value}));openCalendar();};label.append(view);controls.append(label);
  try{const url=new URL(data.zoomUrl);if(url.protocol==='https:'){const zoom=el('a','Open Zoom');zoom.href=url.href;zoom.target='_blank';zoom.rel='noopener noreferrer';zoom.className='button light small';controls.append(zoom);}}catch{const zoom=button('Open Zoom',()=>{const note=doc.querySelector('#client-sheet-status');if(note){note.textContent='Set your Zoom link in Apps Script properties to enable Open Zoom.';note.scrollIntoView({block:'center'});}});controls.append(zoom);}
  root.append(controls);
  renderBookingRequestCards(doc,root,data.registrationRequests||[],isUnlocked,actions.getClients?.()||[]);
  if(data.refreshedAt){const note=el('p','Updated '+new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(data.refreshedAt))+' · Cairo');note.className='overview-updated';root.append(note);}
  if(data.backupStatus){const backup=data.backupStatus;root.append(el('p',(backup.dailyEnabled?'Daily backups enabled. ':'')+(backup.lastSuccess?'Last backup: '+new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',dateStyle:'medium',timeStyle:'short',hour12:true}).format(new Date(backup.lastSuccess)):'No backup recorded yet. Open Backups to save a copy.')));}
 }
 draw({registrationRequests:[]});
 async function refresh(force=false){if(!isUnlocked())return;if(!clientSheetConnected()){draw({registrationRequests:[]});return;}if(loading){if(force)pendingRefresh=true;return;}if(!force&&Date.now()-lastLoaded<15000)return;const epoch=generation;loading=true;if(!root.children.length)root.append(el('p','Loading today’s sessions…'));try{const data=await sheetLibraryRequest('instructorOverview');if(epoch!==generation||!isUnlocked())return;lastLoaded=Date.now();draw(data);}catch(error){if(epoch===generation&&isUnlocked()){root.replaceChildren(el('p','Today’s overview could not load. '+error.message),button('Retry',()=>refresh(true)));}}finally{if(epoch===generation){loading=false;if(pendingRefresh){pendingRefresh=false;refresh(true);}}}}
 doc.addEventListener('instructor-data-changed',()=>refresh(true));doc.addEventListener('client-sheet-configured',()=>refresh(true));doc.addEventListener('speak-boldly-app-resume',()=>refresh());doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refresh();});
 return{refresh,lock(){generation++;loading=false;pendingRefresh=false;lastLoaded=0;root.replaceChildren();}};
}

