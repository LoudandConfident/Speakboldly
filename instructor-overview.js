import {renderBookingRequestCards} from './booking-request-cards.js?v=domain-email-routing';
import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=domain-email-routing';
import {clockText12} from './platform-time.js';
export function initializeInstructorOverview(doc,isUnlocked,actions={}){
 const host=doc.querySelector('#admin-overview');if(!host)return;
 const root=doc.createElement('section');root.className='instructor-overview';host.prepend(root);
 let generation=0,loading=false,lastLoaded=0,pendingRefresh=false;
 function el(tag,value){const node=doc.createElement(tag);node.textContent=value;return node;}
 function button(label,fn){const node=el('button',label);node.type='button';node.className='button light small';node.onclick=fn;return node;}
 function draw(data){
  root.replaceChildren();const requests=data.registrationRequests||[];root.hidden=!requests.length;
  renderBookingRequestCards(doc,root,requests,isUnlocked,actions.getClients?.()||[]);
  let zoom=doc.querySelector('#instructor-open-zoom');try{const url=new URL(data.zoomUrl);if(url.protocol==='https:'){if(!zoom){zoom=el('a','Open Zoom');zoom.id='instructor-open-zoom';zoom.className='button light small';zoom.target='_blank';zoom.rel='noopener noreferrer';(doc.querySelector('#admin-calendar .calendar-primary-actions')||doc.querySelector('#admin-calendar .calendar-toolbar'))?.append(zoom);}zoom.href=url.href;}}catch{}
 }
 draw({registrationRequests:[]});
 async function refresh(force=false){if(!isUnlocked())return;if(!clientSheetConnected()){draw({registrationRequests:[]});return;}if(loading){if(force)pendingRefresh=true;return;}if(!force&&Date.now()-lastLoaded<15000)return;const epoch=generation;loading=true;if(!lastLoaded){root.hidden=false;root.setAttribute('aria-busy','true');root.replaceChildren(el('p','Loading your dashboard…'));}try{const data=await sheetLibraryRequest('instructorOverview');if(epoch!==generation||!isUnlocked())return;lastLoaded=Date.now();draw(data);}catch(error){if(epoch===generation&&isUnlocked()){root.hidden=false;root.replaceChildren(el('p','Booking requests could not load. '+error.message),button('Retry',()=>refresh(true)));}}finally{if(epoch===generation){root.removeAttribute('aria-busy');loading=false;if(pendingRefresh){pendingRefresh=false;refresh(true);}}}}
 doc.addEventListener('instructor-data-changed',()=>refresh(true));doc.addEventListener('client-sheet-configured',()=>refresh(true));doc.addEventListener('speak-boldly-app-resume',()=>refresh());doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refresh();});
 return{refresh,lock(){generation++;loading=false;pendingRefresh=false;lastLoaded=0;root.removeAttribute('aria-busy');root.replaceChildren();root.hidden=true;doc.querySelector('#instructor-open-zoom')?.remove();}};
}


