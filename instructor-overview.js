import {renderBookingRequestCards} from './booking-request-cards.js?v=registration-approval';
import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=level-history';
export function initializeInstructorOverview(doc,isUnlocked,actions={}){
 const host=doc.querySelector('#admin-overview');if(!host)return;
 const root=doc.createElement('section');root.className='instructor-overview';host.prepend(root);
 let generation=0,loading=false,lastLoaded=0;
 function el(tag,value){const node=doc.createElement(tag);node.textContent=value;return node;}
 function button(label,fn){const node=el('button',label);node.type='button';node.className='button light small';node.onclick=fn;return node;}
 function draw(data){
  root.replaceChildren();const heading=el('div','');heading.className='overview-heading';heading.append(el('h3','Today’s sessions'),button('Refresh',()=>refresh(true)));root.append(heading);
  const next=data.nextClass;if(next)root.append(el('p','Next: '+next.name+' · '+next.date+' · '+next.time+' Cairo'));
  if(!data.classes.length)root.append(el('p','No sessions scheduled for today.'));
  for(const item of data.classes){const row=el('div','');row.className='overview-session';row.append(button(item.name,()=>actions.openClient?.(item.clientId)),el('span',item.time+' · '+(item.program||'Session')+' · Session '+item.number+(item.level?' · Level '+item.level:'')));root.append(row);}
  try{const url=new URL(data.zoomUrl);if(url.protocol==='https:'){const zoom=el('a','Open Zoom');zoom.href=url.href;zoom.target='_blank';zoom.rel='noopener noreferrer';zoom.className='button light small';root.append(zoom);}}catch{}
  renderBookingRequestCards(doc,root,data.registrationRequests||[],isUnlocked,actions.getClients?.()||[]);
  root.append(el('h3','Pending work'));
  const reviews=data.pendingReviews||[],reports=data.reportsToPrepare||[],prepared=data.preparedReports||[];
  if(!reviews.length&&!reports.length&&!prepared.length&&!data.drafts?.length)root.append(el('p','No pending work.'));
  if(reviews.length)root.append(button(reviews.length+' examination'+(reviews.length===1?'':'s')+' to review',()=>actions.openReview?.()));
  for(const item of reports)root.append(item.clientId?button('Prepare final report · '+item.name+' · Level '+item.level,()=>actions.openReport?.(item.clientId,'final')):el('p','Final report to prepare: '+item.name+' · Level '+item.level+' — add or select their client record.'));
  for(const item of prepared)root.append(button('Prepared '+item.type+' · '+item.name,()=>actions.openReport?.(item.clientId,item.type)));
  if(data.drafts?.length)root.append(el('p',data.drafts.length+' saved report draft'+(data.drafts.length===1?'':'s')+'. Open Reports to continue.'));
  const note=el('p','Updated '+new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit'}).format(new Date(data.refreshedAt))+' · Cairo');note.className='overview-updated';root.append(note);
 }
 async function refresh(force=false){if(!isUnlocked()||!clientSheetConnected()||loading||(!force&&Date.now()-lastLoaded<15000))return;const epoch=generation;loading=true;if(!root.children.length)root.append(el('p','Loading today’s sessions…'));try{const data=await sheetLibraryRequest('instructorOverview');if(epoch!==generation||!isUnlocked())return;lastLoaded=Date.now();draw(data);}catch(error){if(epoch===generation&&isUnlocked()){root.replaceChildren(el('p','Today’s overview could not load. '+error.message),button('Retry',()=>refresh(true)));}}finally{loading=false;}}
 doc.addEventListener('instructor-data-changed',()=>refresh(true));doc.addEventListener('client-sheet-configured',()=>refresh(true));doc.addEventListener('speak-boldly-app-resume',()=>refresh());doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refresh();});
 return{refresh,lock(){generation++;lastLoaded=0;root.replaceChildren();}};
}
