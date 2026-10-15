import {initializeInstructorOverview} from './instructor-overview.js?v=weekly-requests';
import {cleanupRequestedPortalClients} from './requested-client-cleanup.js';
import {openClientReportTab} from './report-tabs.js?v=instructor-app';
import {CLIENT_PROGRAMS,suggestedSessionProgram} from './session-programs.js?v=momentum-and-uploads';
import {initializeWeeklyPortalPasswords} from './weekly-portal-passwords.js?v=horizontal-cards';
import {confirmClientEmail} from './client-email-confirmation.js?v=registration-approval';
import {initializePortalSwitches} from './portal-switches.js?v=horizontal-cards';
import {initializeTeacherDocuments} from './teacher-documents.js?v=instructor-app';
import {initializeClientSheet,clientSheetConnected,syncClientToSheet,loadClientsFromSheet,mergeSheetClients,sendSheetClientEmail,loadSheetSessions,sheetLibraryRequest} from './client-sheet.js?v=level-history';
import {ownerConnected,savePrivateClient,uploadPrivateFile,request} from './exam-api.js';
import {initializeAdminCalendar} from './admin-calendar.js?v=session-series';
import {CLIENT_LEVELS,PAYMENT_STATUSES,validateClient,clientTotals,removeBrowserClient} from './admin-clients.js?v=client-levels-eight';
import {PORTAL_SECTIONS,filePermission} from './portal-access.js?v=four-digit-restored';
import {loadPortalMaterials} from './portal-materials.js';
// Fixed Admin portal convenience code, independent of each assigned Student Code.
const ADMIN_CODE='1962';
const STORAGE_KEY='speak-boldly-admin-clients-v1';
export function initializeAdminPortal(doc,loader=loadPortalMaterials){
 const root=doc.querySelector('#admin-portal');if(!root)return;
 const gate=root.querySelector('#admin-gate'),login=root.querySelector('#admin-login-form'),dashboard=root.querySelector('#admin-dashboard'),password=root.querySelector('#admin-code'),loginError=root.querySelector('#admin-login-error'),form=root.querySelector('#admin-client-form'),status=root.querySelector('#admin-client-status'),tbody=root.querySelector('#admin-client-rows');
 const clientsList=root.querySelector('#admin-students-list'),clientsHeading=clientsList?.querySelector('.admin-clients-heading');const clientsToggle=doc.createElement('button');clientsToggle.type='button';clientsToggle.className='button light small mobile-clients-toggle';clientsToggle.id='show-clients-toggle';clientsToggle.setAttribute('aria-expanded','false');const updateClientsToggle=()=>{const expanded=clientsList.classList.contains('clients-expanded');clientsToggle.textContent=(expanded?'Hide clients':'Show clients')+(clients.length?' ('+clients.length+')':'');clientsToggle.setAttribute('aria-expanded',String(expanded));};clientsToggle.onclick=()=>{clientsList.classList.toggle('clients-expanded');updateClientsToggle();};clientsHeading?.append(clientsToggle);
 let sheetGeneration=0,sheetLoading=false;
 let unlocked=false,clients=[],editingId=null,editingHistoryId=null,isAdvancing=false,pendingClientId=null;let materialCatalog={};updateClientsToggle();
 const programLabel=doc.createElement('label');programLabel.textContent='Program';const programChooser=doc.createElement('select');programChooser.name='program';programChooser.append(new doc.defaultView.Option('Choose a program',''));for(const program of CLIENT_PROGRAMS)programChooser.append(new doc.defaultView.Option(program.title,program.title));programLabel.append(programChooser);form.elements.level.closest('label').after(programLabel);
 const advance=doc.createElement('button');advance.type='button';advance.className='button light small';advance.textContent='Move to next level';advance.hidden=true;root.querySelector('#save-admin-client').before(advance);
 advance.onclick=()=>{if(!unlocked||!editingId||editingHistoryId)return;const client=clients.find(item=>item.id===editingId);if(Number(client.level)>=8){status.textContent='This client is already at Level 8.';return;}isAdvancing=true;const next=/^\d+$/.test(client.level)?String(Number(client.level)+1):'1';form.elements.level.value=next;programChooser.value=client.program||suggestedSessionProgram(client)||'';status.textContent='Choose the next level and program, then Save changes. The previous line will stay dimmed and editable.';form.elements.level.focus();};
 const clientSheet=initializeClientSheet(doc);
 const authorization=doc.createElement('dialog');authorization.id='client-authorization-dialog';authorization.className='action-popup';authorization.setAttribute('aria-labelledby','client-authorization-title');authorization.innerHTML='<button type="button" class="popup-close" aria-label="Close client actions">×</button><h2 id="client-authorization-title">Actions</h2><p id="client-authorization-name"></p><div class="client-authorization-actions"><button type="button" class="button light small" data-authorize-action="confirmation">Send e-mail confirmation</button><button type="button" class="button light small" data-authorize-action="progress">Send Progress Report</button><button type="button" class="button light small" data-authorize-action="final">Send final Report</button><button type="button" class="button light small" data-authorize-action="notes">Notes</button><button type="button" class="button light small" data-authorize-action="registration">Send Payment and registration confirmation</button></div><p id="client-authorization-status" role="status"></p>';doc.body.append(authorization);authorization.querySelector('.popup-close').onclick=()=>authorization.close();
 let authorizationClientId=null,confirmationId=null;
 function openAuthorization(client){authorization.querySelectorAll('[data-authorize-action]').forEach(b=>b.disabled=false);authorizationClientId=client.id;confirmationId=null;authorization.querySelector('#client-authorization-name').textContent=client.name+' · '+client.email+' · Passcode '+client.code;authorization.querySelector('[role=status]').textContent='';if(!authorization.open)authorization.showModal();authorization.scrollTop=0;}
 authorization.querySelectorAll('[data-authorize-action]').forEach(button=>button.addEventListener('click',async()=>{
  if(!unlocked)return;const client=clients.find(c=>c.id===authorizationClientId);if(!client)return;const action=button.dataset.authorizeAction,note=authorization.querySelector('[role=status]');
  if(action!=='confirmation'){try{openClientReportTab(doc.defaultView,action,client,root.querySelector('#client-sheet-connect').elements.endpoint.defaultValue);authorization.close();}catch(error){note.textContent=error.message;}return;}
  if(!clientSheetConnected()){note.textContent='Connect your Clients sheet first.';return;}
  button.disabled=true;note.textContent='Loading upcoming session…';const previewClientId=client.id;
  try{
   const response=await loadSheetSessions();if(!unlocked||authorizationClientId!==previewClientId)return;
   const next=response.classes.filter(item=>item.clientId===client.id&&item.reminderStatus!=='cancelled'&&Date.parse(item.startsAt)>Date.now()).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))[0];
   if(!next)throw new Error('No upcoming session is saved for this client.');
   const approved=await confirmClientEmail(doc,'Send class confirmation to '+client.name+' ('+client.email+')?',{details:{Program:next.course||next.program||client.program||'Session',Appointment:next.program||'Session',Duration:(next.duration||90)+' minutes',Level:next.level||client.level,Session:next.number,Date:next.date,Time:next.time+' · Cairo'}});
   if(!approved||!unlocked||authorizationClientId!==previewClientId){if(unlocked&&authorizationClientId===previewClientId)note.textContent='';return;}
   note.textContent='Sending confirmation…';confirmationId ||= doc.defaultView.crypto.randomUUID();
   const result=await sheetLibraryRequest('sendClientEmail',{clientId:client.id,kind:'confirmation',requestId:confirmationId,sessionId:next.id});note.textContent='Email sent to '+result.recipient+'.';
  }catch(error){note.textContent=error.message;}finally{button.disabled=false;}

 }));
 doc.addEventListener('instructor-booking-reviewed',()=>{if(unlocked)refreshSheetClients(true);});
 const syncExisting=root.querySelector('#sync-existing-clients');
 const refreshClients=doc.createElement('button');refreshClients.type='button';refreshClients.className='button light small';refreshClients.textContent='Refresh';refreshClients.id='refresh-sheet-clients';
 root.querySelector('.admin-clients-heading')?.append(refreshClients);
 refreshClients.onclick=async()=>{if(!unlocked||sheetLoading)return;if(clientSheetConnected()){await refreshSheetClients();return;}load();render();await calendar?.load();documents?.refresh();status.textContent='Dashboard refreshed.';};
 doc.addEventListener('client-sheet-configured',()=>{if(unlocked)refreshSheetClients();});
 async function refreshSheetClients(background=false){
  if(!unlocked||sheetLoading)return false;
  if(!clientSheetConnected()){status.textContent='Connect Google Sheets on this device using your private connection key to load your students.';return false;}
  if(editingId||form.dataset.saving){status.textContent='Finish editing this client before refreshing students.';return false;}
  const epoch=sheetGeneration;sheetLoading=true;refreshClients.disabled=true;root.querySelector('#admin-add-client').disabled=true;
  status.textContent='Loading students from Google Sheets…';
  try{
   const remote=cleanupRequestedPortalClients(await loadClientsFromSheet(),doc.defaultView.localStorage);
   if(!unlocked||epoch!==sheetGeneration)return false;
   try{if(clients.some(client=>!remote.some(item=>item.id===client.id)))doc.defaultView.localStorage.setItem('speak-boldly-clients-before-sheet-refresh-v1',JSON.stringify(clients));}catch{}clients=mergeSheetClients(clients,remote);save();render();documents?.refresh();overview?.refresh();calendar?.refresh(background);
   status.textContent=remote.length+' students loaded from Google Sheets.';
   return true;
  }catch(error){if(unlocked&&epoch===sheetGeneration)status.textContent='Students could not load. '+error.message;return false;}
  finally{if(epoch===sheetGeneration){sheetLoading=false;refreshClients.disabled=false;root.querySelector('#admin-add-client').disabled=false;}}
 }
 let syncTimer;
 function refreshConnected(){if(unlocked&&!doc.hidden&&clientSheetConnected()&&!editingId&&!form.dataset.saving&&!doc.querySelector('dialog[open]'))refreshSheetClients(true);}
 doc.addEventListener('speak-boldly-app-resume',()=>{
  if(!unlocked||doc.hidden||editingId||form.dataset.saving||doc.querySelector('dialog[open]'))return;
  refreshConnected();
  if(root.querySelector('#weekly-portal-passwords')?.open)weeklyPasswords?.refresh();
 });
 function startSyncTimer(){doc.defaultView.clearInterval(syncTimer);syncTimer=doc.defaultView.setInterval(refreshConnected,60000);}
 startSyncTimer();doc.defaultView.addEventListener('focus',refreshConnected);doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refreshConnected();});doc.defaultView.addEventListener('pagehide',()=>doc.defaultView.clearInterval(syncTimer));doc.defaultView.addEventListener('pageshow',startSyncTimer);
 syncExisting?.addEventListener('click',async()=>{
  if(!unlocked||sheetLoading)return;
  const note=doc.querySelector('#client-sheet-status');
  if(!clientSheetConnected()){note.textContent='Enter your Apps Script URL and private connection key first.';return;}
  const records=clients.map(client=>({...client}));
  if(!records.length){note.textContent='No existing students are saved in this browser.';return;}
  syncExisting.disabled=true;
  let count=0;
  try{
   for(const client of records){
    if(!unlocked)return;
    note.textContent='Syncing student '+(count+1)+' of '+records.length+'…';
    await syncClientToSheet(client);count++;
   }
   note.textContent=count+' student'+(count===1?'':'s')+' synced to Google Sheets. Existing matching records were updated.';
  }catch(error){note.textContent=count+' of '+records.length+' students synced. '+error.message+' You can retry; students already synced will not be duplicated.';}
  finally{syncExisting.disabled=false;}
 });
 const weeklyPasswords=initializeWeeklyPortalPasswords(doc,()=>unlocked);
 const switches=initializePortalSwitches(doc,()=>unlocked,loader);
 const calendar=initializeAdminCalendar(doc,()=>unlocked,()=>clients,openClientInfo);
 const documents=initializeTeacherDocuments(doc,()=>unlocked,()=>clients,loader);
 const overview=initializeInstructorOverview(doc,()=>unlocked,{getClients:()=>clients,openClient:openClientInfo,openReport:(id,type)=>{const client=clients.find(c=>c.id===id);if(client)openClientReportTab(doc.defaultView,type,client,root.querySelector('#client-sheet-connect').elements.endpoint.defaultValue);}});

 for(const [name,values]of [['level',CLIENT_LEVELS],['payment',PAYMENT_STATUSES]])for(const value of values){const option=doc.createElement('option');option.value=option.textContent=value;form.elements[name].append(option);}
 function renderAccess(selected=[]){
  const options=root.querySelector('#admin-access-options');options.replaceChildren();const allowed=new Set(selected);
  for(const [section,label]of Object.entries(PORTAL_SECTIONS)){
   const group=doc.createElement('div');group.className='admin-access-group';
   const folderLabel=doc.createElement('label'),folder=doc.createElement('input');folder.type='checkbox';folder.name='permissions';folder.value='section:'+section;folder.checked=allowed.has(folder.value);folderLabel.append(folder,doc.createTextNode(label));const heading=doc.createElement('div');heading.className='admin-folder-heading';heading.append(folderLabel);group.append(heading);
   const files=doc.createElement('div');files.className='admin-access-files';files.id='admin-folder-files-'+section;files.hidden=true;const toggle=doc.createElement('button');toggle.type='button';toggle.className='button light small admin-folder-toggle';toggle.setAttribute('aria-controls',files.id);toggle.setAttribute('aria-expanded','false');heading.append(toggle);function updateFileCount(){const count=files.querySelectorAll('input:checked').length;toggle.textContent=(files.hidden?'Choose files':'Hide files')+(count?' ('+count+' selected)':'');}toggle.onclick=()=>{files.hidden=!files.hidden;toggle.setAttribute('aria-expanded',String(!files.hidden));updateFileCount();};
   for(const item of materialCatalog[section]||[]){const label=doc.createElement('label'),input=doc.createElement('input');input.type='checkbox';input.name='permissions';input.value=filePermission(section,item.url);input.checked=allowed.has(input.value);label.append(input,doc.createTextNode(item.title));files.append(label);input.onchange=()=>{if(input.checked)folder.checked=true;updateFileCount();};}
   folder.onchange=()=>{files.querySelectorAll('input').forEach(input=>input.checked=folder.checked);updateFileCount();};updateFileCount();group.append(files);options.append(group);
  }
  // Preserve existing file grants when a network failure prevents listing those files.
  const displayed=new Set([...options.querySelectorAll('input')].map(input=>input.value));for(const value of allowed){if(displayed.has(value))continue;const input=doc.createElement('input');input.type='hidden';input.name='permissions';input.value=value;options.append(input);}
 }
 async function loadAccessOptions(){
  if(root.querySelector('.admin-access-detail')?.hidden){materialCatalog={};return;}
  const status=root.querySelector('#admin-access-status');status.textContent='Loading file permissions…';let failed=false;
  await Promise.all(Object.keys(PORTAL_SECTIONS).map(async section=>{try{materialCatalog[section]=await loader(section);}catch{failed=true;}}));
  const selected=editingId?clients.find(c=>c.id===editingId)?.permissions||[]:[...new doc.defaultView.FormData(form).getAll('permissions')];renderAccess(selected);status.textContent=failed?'Some files could not be listed. Existing permissions are kept; reopen the dashboard to retry.':'';
 }
 function load(){
  clients=[];try{const data=JSON.parse(doc.defaultView.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(data))throw new Error();for(const entry of cleanupRequestedPortalClients(data,doc.defaultView.localStorage)){try{if(typeof entry.id!=='string'||clients.some(c=>c.id===entry.id))continue;clients.push({id:entry.id,...validateClient(entry,clients,null,{allowLegacy:true})});}catch{}}}catch{status.textContent='Stored client data could not be read. New entries will stay in this visit until storage works.';}
 }
 function save(){try{doc.defaultView.localStorage.setItem(STORAGE_KEY,JSON.stringify(clients));return true;}catch{return false;}}
 function clearForm(){editingId=null;editingHistoryId=null;isAdvancing=false;advance.hidden=true;pendingClientId=null;form.reset();form.elements.hours.value='0';form.elements.amountPaid.value='0';root.querySelector('#save-admin-client').textContent='Add client';root.querySelector('#cancel-admin-edit').hidden=true;renderAccess();}
 function render(){updateClientsToggle();
  const target=root.querySelector('#upload-client');if(target){const selected=target.value;target.replaceChildren();const all=doc.createElement('option');all.value='';all.textContent='Full library';target.append(all);for(const c of clients){const option=doc.createElement('option');option.value=c.id;option.textContent=c.name;target.append(option);}target.value=selected;}
  const total=clientTotals(clients);root.querySelector('#admin-total-hours').textContent=new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(total.hours);root.querySelector('#admin-total-clients').textContent=total.clients;tbody.replaceChildren();root.querySelector('#admin-no-clients').hidden=clients.length>0;
  for(const client of clients){const row=doc.createElement('tr');for(const value of [client.name,client.code||'Not assigned',client.level+(client.program?' · '+client.program:''),client.payment,new Intl.NumberFormat('en',{minimumFractionDigits:2,maximumFractionDigits:2}).format(client.amountPaid??0),client.email,client.hours]){const cell=doc.createElement('td');cell.dataset.label=['Name','Student Code','Level / Program','Payment status','Amount paid','Email address','Hours taught'][row.children.length];cell.textContent=value;row.append(cell);}const cell=doc.createElement('td'),edit=doc.createElement('button');cell.dataset.label='Action';edit.type='button';edit.className='button light small';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+client.name);edit.onclick=()=>{if(!sheetLoading)openClientInfo(client.id);};cell.className='admin-client-actions';const authorize=doc.createElement('button');authorize.type='button';authorize.className='button light small';authorize.textContent='Actions';authorize.setAttribute('aria-label','Actions for '+client.name);authorize.onclick=()=>{if(unlocked)openAuthorization(clients.find(current=>current.id===client.id)||client);};cell.append(edit,authorize);row.append(cell);tbody.append(row);
   for(const entry of (client.enrollmentHistory||[]).filter(entry=>entry.id.startsWith('advanced-')||entry.reason==='advanced')){const previous=doc.createElement('tr');previous.className=entry.id.startsWith('advanced-')||entry.reason==='advanced'?'admin-client-history':'admin-client-history-undimmed';previous.dataset.historyId=entry.id;for(const [index,value]of [client.name,client.code||'Not assigned',entry.level+(entry.program?' · '+entry.program:'')+(entry.id.startsWith('advanced-')||entry.reason==='advanced'?' · Previous level':' · History'),client.payment,new Intl.NumberFormat('en',{minimumFractionDigits:2,maximumFractionDigits:2}).format(client.amountPaid??0),client.email,client.hours].entries()){const td=doc.createElement('td');td.dataset.label=['Name','Student Code','Level / Program','Payment status','Amount paid','Email address','Hours taught'][index];td.textContent=value;previous.append(td);}const actions=doc.createElement('td');actions.dataset.label='Action';actions.className='admin-client-actions';const editHistory=doc.createElement('button');editHistory.type='button';editHistory.className='button light small';editHistory.textContent='Edit';editHistory.setAttribute('aria-label','Edit '+client.name+' previous level '+entry.level);editHistory.onclick=()=>{if(!sheetLoading)openClientInfo(client.id,entry.id);};actions.append(editHistory);previous.append(actions);tbody.append(previous);}
  }
 }
 function openClientInfo(id,historyId=null){const client=clients.find(c=>c.id===id);if(!client||!unlocked)return;const history=historyId?client.enrollmentHistory?.find(entry=>entry.id===historyId):null;if(historyId&&!history)return;editingId=client.id;editingHistoryId=historyId;isAdvancing=false;for(const key of ['name','email','code','level','payment','amountPaid','hours'])form.elements[key].value=key==='level'&&history?history.level:client[key]??(key==='amountPaid'?0:'');const program=history?history.program:client.program||'';if(program&&![...programChooser.options].some(option=>option.value===program))programChooser.append(new doc.defaultView.Option(program,program));programChooser.value=program;advance.hidden=Boolean(history);root.querySelector('#save-admin-client').textContent='Save changes';root.querySelector('#cancel-admin-edit').hidden=false;renderAccess(client.permissions);openClientPage();status.textContent=history?'Editing previous level '+history.level+' for '+client.name+'. Their current level stays unchanged.':'Editing '+client.name;form.elements.name.focus();}
 function openClientPage(){root.querySelector('#admin-overview').hidden=true;root.querySelector('#admin-client-page').hidden=false;root.querySelector('#admin-client-page-title').textContent=editingId?'Edit client folder':'Add client';doc.defaultView.location.hash='students-portal/client';}
 function showDashboard(){root.querySelector('#admin-overview').hidden=false;root.querySelector('#admin-client-page').hidden=true;doc.defaultView.location.hash='students-portal/teacher';}
 function lock(){if(authorization.open)authorization.close();authorizationClientId=null;confirmationId=null;sheetGeneration++;sheetLoading=false;refreshClients.disabled=false;root.querySelector('#admin-add-client').disabled=false;const dialog=root.querySelector('#teacher-login-dialog');if(dialog?.open)dialog.close();if(!root.hidden)doc.querySelector('#students-portal').classList.remove('portal-session-active');unlocked=false;overview?.lock();documents?.lock();switches?.lock();weeklyPasswords?.lock();clientSheet?.lock();calendar?.lock();gate.hidden=false;dashboard.hidden=true;login.reset();loginError.textContent='';password.removeAttribute('aria-invalid');clearForm();tbody.replaceChildren();clients=[];status.textContent='';}
 login.addEventListener('submit',event=>{event.preventDefault();if(password.value!==ADMIN_CODE){loginError.textContent='Incorrect admin password. Please try again.';password.setAttribute('aria-invalid','true');password.focus();return;}unlocked=true;loginError.textContent='';password.value='';gate.hidden=true;dashboard.hidden=false;dashboard.querySelectorAll('details').forEach(section=>section.open=false);root.querySelector('#teacher-login-dialog')?.close();doc.querySelector('#students-portal').classList.add('portal-session-active');doc.defaultView.scrollTo({top:0,left:0,behavior:'instant'});showDashboard();load();clientSheet?.restore();overview?.refresh();weeklyPasswords?.refresh();documents?.refresh();render();calendar?.load();loadAccessOptions();if(clientSheetConnected())refreshSheetClients();else status.textContent='Connect Google Sheets on this device to load students saved from your other devices.';});
 form.addEventListener('submit',async event=>{event.preventDefault();if(!unlocked||sheetLoading||!form.reportValidity()||form.dataset.saving)return;form.dataset.saving='true';const saveButton=root.querySelector('#save-admin-client');saveButton.disabled=true;try{const data=new doc.defaultView.FormData(form);const input={...Object.fromEntries(data),permissions:data.getAll('permissions')};const previous=clients.find(item=>item.id===editingId),historyEdit=editingHistoryId?{id:editingHistoryId,level:input.level,program:input.program}:null;if(historyEdit){input.level=previous.level;input.program=previous.program||'';}let client=validateClient(input,clients,editingId);client.enrollmentHistory=[...(previous?.enrollmentHistory||[])].map(entry=>({...entry}));if(historyEdit){const entry=client.enrollmentHistory.find(entry=>entry.id===historyEdit.id);Object.assign(entry,{level:historyEdit.level,program:historyEdit.program});}else if(isAdvancing&&previous){if(previous.level===client.level)throw new Error('Choose a different level to move this client.');client.enrollmentHistory.push({id:'advanced-'+doc.defaultView.crypto.randomUUID(),level:previous.level,program:previous.program||'',closedAt:new Date().toISOString(),reason:'advanced'});}if(ownerConnected())client=await savePrivateClient({...client,...(editingId?{id:editingId}:{})});client={...client,id:editingId||client.id||(pendingClientId ||= doc.defaultView.crypto.randomUUID())};if(clientSheetConnected()){status.textContent='Saving client to Google Sheets…';const result=await syncClientToSheet({...client,hoursChanged:!previous||Number(input.hours)!==Number(previous.hours),...(historyEdit?{historyEdit}:{}),...(isAdvancing?{advanceLevel:true,advanceFromLevel:previous.level}:{})});if(result.enrollmentHistory)client.enrollmentHistory=result.enrollmentHistory;if(result.program!==undefined)client.program=result.program;if(result.hours!==undefined)client.hours=result.hours;}if(editingId){const index=clients.findIndex(c=>c.id===editingId);clients[index]=client;}else clients.push(client);const saved=ownerConnected()?true:save();doc.dispatchEvent(new doc.defaultView.CustomEvent('portal-permissions-changed'));clearForm();render();calendar?.refresh();overview?.refresh();showDashboard();status.textContent=clientSheetConnected()?'Client saved to Google Sheets.':ownerConnected()?'Client saved in private storage.':saved?'Client saved in this browser only — not sent to Google Sheets. Connect the client sheet to sync it.':'Client updated for this visit only. Browser storage is unavailable.';}catch(error){status.textContent=error.message;}finally{delete form.dataset.saving;saveButton.disabled=false;}});
 root.querySelector('#cancel-admin-edit').onclick=()=>{clearForm();showDashboard();status.textContent='';};
 root.querySelector('#admin-add-client').onclick=()=>{if(!unlocked)return;clearForm();openClientPage();};
 root.querySelector('#admin-back-dashboard').onclick=()=>{clearForm();showDashboard();};
 doc.addEventListener('portal-sign-out',lock);
 doc.querySelector('[data-portal-area="client"]').addEventListener('click',lock);
 doc.defaultView.addEventListener('hashchange',()=>{if(doc.defaultView.location.hash.split('/')[0]!=='#students-portal')lock();else if(doc.defaultView.location.hash==='#students-portal'&&unlocked){root.querySelector('#admin-overview').hidden=false;root.querySelector('#admin-client-page').hidden=true;}});

 lock();return{lock};
}
if(typeof document!=='undefined')initializeAdminPortal(document);
