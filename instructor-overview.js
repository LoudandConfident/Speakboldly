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
  root.replaceChildren();const heading=el('div','');heading.className='overview-heading';heading.append(el('h3','Today’s sessions'),button('Refresh',()=>refresh(true)));root.append(heading);
  const next=data.nextClass;if(next)root.append(el('p','Next: '+next.name+' · '+next.date+' · '+clockText12(next.time)+' Cairo'));
  if(!data.classes.length)root.append(el('p','No sessions scheduled for today.'));
  function sessionRow(item,dated=false){const row=el('div','');row.className='overview-session';row.append(button(item.name,()=>actions.openClient?.(item.clientId)),el('span',(dated?item.date+' · ':'')+clockText12(item.time)+' · '+(item.program||'Session')+' · Session '+item.number+(item.level?' · Level '+item.level:'')));return row;}
  for(const item of data.classes)root.append(sessionRow(item));
  const upcoming=doc.createElement('details');upcoming.className='overview-upcoming';upcoming.append(el('summary','Coming up · next 7 days ('+(data.upcomingClasses?.length||0)+')'));
  for(const item of data.upcomingClasses||[])upcoming.append(sessionRow(item,true));if(!data.upcomingClasses?.length)upcoming.append(el('p','No further sessions in the next seven days.'));root.append(upcoming);
  try{const url=new URL(data.zoomUrl);if(url.protocol==='https:'){const zoom=el('a','Open Zoom');zoom.href=url.href;zoom.target='_blank';zoom.rel='noopener noreferrer';zoom.className='button light small';root.append(zoom);}}catch{}
  renderBookingRequestCards(doc,root,data.registrationRequests||[],isUnlocked,actions.getClients?.()||[]);
  root.append(el('h3','Pending work'));
  const submissions=data.pendingReviews||[],reports=data.reportsToPrepare||[],prepared=data.preparedReports||[];
  if(!submissions.length&&!reports.length&&!prepared.length&&!data.drafts?.length)root.append(el('p','No pending work.'));
  if(submissions.length){const summary=el('p',submissions.length+' submitted examination'+(submissions.length===1?'':'s')+' awaiting your writing marks. Check your exam submission emails.');root.append(summary);const delayed=submissions.filter(item=>item.notificationStatus&&item.notificationStatus!=='sent');if(delayed.length)root.append(el('p',delayed.length+' examination email'+(delayed.length===1?' has':'s have')+' unconfirmed delivery. The answers remain saved in your sheet.'));}
  const reportKeys=new Set();for(const item of reports){const key=(item.clientId||item.name)+':'+item.level;if(reportKeys.has(key))continue;reportKeys.add(key);root.append(item.clientId?button('Prepare final report · '+item.name+' · Level '+item.level,()=>actions.openReport?.(item.clientId,'final')):el('p','Final report to prepare: '+item.name+' · Level '+item.level+' — add or select their client record.'));}
  for(const item of prepared)root.append(button('Prepared '+item.type+' · '+item.name,()=>actions.openReport?.(item.clientId,item.type)));
  if(data.drafts?.length)root.append(el('p',data.drafts.length+' saved report draft'+(data.drafts.length===1?'':'s')+'. Open Reports to continue.'));
  const note=el('p','Updated '+new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(data.refreshedAt))+' · Cairo');note.className='overview-updated';root.append(note);
  if(data.backupStatus){const backup=data.backupStatus;root.append(el('p',(backup.dailyEnabled?'Daily backups enabled. ':'')+(backup.lastSuccess?'Last backup: '+new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',dateStyle:'medium',timeStyle:'short',hour12:true}).format(new Date(backup.lastSuccess)):'No backup recorded yet. Open Backups to save a copy.')));}
 }
 async function refresh(force=false){if(!isUnlocked()||!clientSheetConnected())return;if(loading){if(force)pendingRefresh=true;return;}if(!force&&Date.now()-lastLoaded<15000)return;const epoch=generation;loading=true;if(!root.children.length)root.append(el('p','Loading today’s sessions…'));try{const data=await sheetLibraryRequest('instructorOverview');if(epoch!==generation||!isUnlocked())return;lastLoaded=Date.now();draw(data);}catch(error){if(epoch===generation&&isUnlocked()){root.replaceChildren(el('p','Today’s overview could not load. '+error.message),button('Retry',()=>refresh(true)));}}finally{if(epoch===generation){loading=false;if(pendingRefresh){pendingRefresh=false;refresh(true);}}}}
 doc.addEventListener('instructor-data-changed',()=>refresh(true));doc.addEventListener('client-sheet-configured',()=>refresh(true));doc.addEventListener('speak-boldly-app-resume',()=>refresh());doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refresh();});
 return{refresh,lock(){generation++;loading=false;pendingRefresh=false;lastLoaded=0;root.replaceChildren();}};
}
