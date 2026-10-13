import {initializeBookingSettings} from './booking-settings.js';
import {confirmClientEmail} from './client-email-confirmation.js';
import {initializePortalSwitches} from './portal-switches.js?v=global-tests';
import {initializeTeacherLibrary} from './teacher-library.js?v=popup-email';
import {initializeTeacherDocuments} from './teacher-documents.js?v=popup-email';
import {initializeClientSheet,clientSheetConnected,syncClientToSheet,loadClientsFromSheet,mergeSheetClients,sendSheetClientEmail} from './client-sheet.js?v=full-library';
import {initializeExamReview} from './sheet-exam-review.js?v=individual-pdfs';
import {ownerConnected,savePrivateClient,uploadPrivateFile,request} from './exam-api.js';
import {initializeAdminCalendar} from './admin-calendar.js?v=appointment-x';
import {CLIENT_LEVELS,PAYMENT_STATUSES,validateClient,clientTotals,removeBrowserClient} from './admin-clients.js?v=four-digit-restored';
import {PORTAL_SECTIONS,filePermission} from './portal-access.js?v=four-digit-restored';
import {loadPortalMaterials} from './portal-materials.js';
// Fixed Admin portal convenience code, independent of each assigned Student Code.
const ADMIN_CODE='1962';
const STORAGE_KEY='speak-boldly-admin-clients-v1';
export function initializeAdminPortal(doc,loader=loadPortalMaterials){
 const root=doc.querySelector('#admin-portal');if(!root)return;
 const gate=root.querySelector('#admin-gate'),login=root.querySelector('#admin-login-form'),dashboard=root.querySelector('#admin-dashboard'),password=root.querySelector('#admin-code'),loginError=root.querySelector('#admin-login-error'),form=root.querySelector('#admin-client-form'),status=root.querySelector('#admin-client-status'),tbody=root.querySelector('#admin-client-rows');
 let sheetGeneration=0,sheetLoading=false;
 let unlocked=false,clients=[],editingId=null,pendingClientId=null;let materialCatalog={};
 const clientSheet=initializeClientSheet(doc);
 const authorization=doc.createElement('dialog');authorization.id='client-authorization-dialog';authorization.className='action-popup';authorization.setAttribute('aria-labelledby','client-authorization-title');authorization.innerHTML='<button type="button" class="popup-close" aria-label="Close client actions">×</button><h2 id="client-authorization-title">Actions</h2><p id="client-authorization-name"></p><div class="client-authorization-actions"><button type="button" class="button light small" data-authorize-action="confirmation">Send e-mail confirmation</button><button type="button" class="button light small" data-authorize-action="progress">Send Progress Report</button><button type="button" class="button light small" data-authorize-action="final">Send final Report</button><button type="button" class="button light small" data-authorize-action="registration">Send Payment and registration confirmation</button></div><p id="client-authorization-status" role="status"></p>';doc.body.append(authorization);authorization.querySelector('.popup-close').onclick=()=>authorization.close();
 let authorizationClientId=null,confirmationId=null;
 function openAuthorization(client){authorization.querySelectorAll('[data-authorize-action]').forEach(b=>b.disabled=false);authorizationClientId=client.id;confirmationId=null;authorization.querySelector('#client-authorization-name').textContent=client.name+' · '+client.email+' · Passcode '+client.code;authorization.querySelector('[role=status]').textContent='';authorization.showModal();}
 authorization.querySelectorAll('[data-authorize-action]').forEach(button=>button.addEventListener('click',async()=>{
  if(!unlocked)return;const client=clients.find(c=>c.id===authorizationClientId);if(!client)return;const action=button.dataset.authorizeAction,note=authorization.querySelector('[role=status]');
  if(action!=='confirmation'){try{authorization.close();await documents.openForClient(action,client);}catch(error){note.textContent=error.message;}return;}
  if(!clientSheetConnected()){note.textContent='Connect your Clients sheet first.';return;}
  if(!await confirmClientEmail(doc,'Send class confirmation to the client '+client.name+' ('+client.email+')?')||!unlocked)return;button.disabled=true;note.textContent='Sending confirmation…';
  try{confirmationId ||= doc.defaultView.crypto.randomUUID();const result=await sendSheetClientEmail(client.id,'confirmation',{requestId:confirmationId});note.textContent='Email sent to '+result.recipient+'.';}catch(error){note.textContent=error.message;button.disabled=false;}
 }));
 const syncExisting=root.querySelector('#sync-existing-clients');
 const refreshClients=doc.createElement('button');refreshClients.type='button';refreshClients.className='button light small';refreshClients.textContent='Refresh';refreshClients.id='refresh-sheet-clients';
 root.querySelector('.admin-clients-heading')?.append(refreshClients);
 refreshClients.onclick=async()=>{if(!unlocked||sheetLoading)return;if(clientSheetConnected()){await refreshSheetClients();return;}load();render();await calendar?.load();documents?.refresh();fullLibrary?.refresh();status.textContent='Dashboard refreshed.';};
 doc.addEventListener('client-sheet-configured',()=>{if(unlocked)refreshSheetClients();});
 async function refreshSheetClients(){
  if(!unlocked||sheetLoading)return false;
  if(!clientSheetConnected()){status.textContent='Connect Google Sheets on this device using your private connection key to load your students.';return false;}
  if(editingId||form.dataset.saving){status.textContent='Finish editing this client before refreshing students.';return false;}
  const epoch=sheetGeneration;sheetLoading=true;refreshClients.disabled=true;root.querySelector('#admin-add-client').disabled=true;
  status.textContent='Loading students from Google Sheets…';
  try{
   const remote=await loadClientsFromSheet();
   if(!unlocked||epoch!==sheetGeneration)return false;
   clients=mergeSheetClients(clients,remote);save();render();documents?.refresh();fullLibrary?.refresh();calendar?.refresh();
   status.textContent=remote.length+' students loaded from Google Sheets.'+(clients.length>remote.length?' '+(clients.length-remote.length)+' students on this device still need Sync existing students.':'');
   return true;
  }catch(error){if(unlocked&&epoch===sheetGeneration)status.textContent='Students could not load. '+error.message;return false;}
  finally{if(epoch===sheetGeneration){sheetLoading=false;refreshClients.disabled=false;root.querySelector('#admin-add-client').disabled=false;}}
 }
 let syncTimer;
 function refreshConnected(){if(unlocked&&!doc.hidden&&clientSheetConnected()&&!editingId&&!form.dataset.saving&&!doc.querySelector('dialog[open]'))refreshSheetClients();}
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
 const bookingSettings=initializeBookingSettings(doc,()=>unlocked);
 const switches=initializePortalSwitches(doc,()=>unlocked,loader);
 const review=initializeExamReview(doc,()=>unlocked,records=>{clients=records;clearForm();render();calendar?.refresh();loadAccessOptions();});
 const calendar=initializeAdminCalendar(doc,()=>unlocked,()=>clients,openClientInfo);
 const documents=initializeTeacherDocuments(doc,()=>unlocked,()=>clients,loader);
 const fullLibrary=initializeTeacherLibrary(doc,()=>unlocked,()=>clients,loader);

 for(const [name,values]of [['level',CLIENT_LEVELS],['payment',PAYMENT_STATUSES]])for(const value of values){const option=doc.createElement('option');option.value=option.textContent=value;(name==='level'?root.querySelector('#admin-client-level-options'):form.elements[name]).append(option);}
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
  const status=root.querySelector('#admin-access-status');status.textContent='Loading file permissions…';let failed=false;
  await Promise.all(Object.keys(PORTAL_SECTIONS).map(async section=>{try{materialCatalog[section]=await loader(section);}catch{failed=true;}}));
  const selected=editingId?clients.find(c=>c.id===editingId)?.permissions||[]:[...new doc.defaultView.FormData(form).getAll('permissions')];renderAccess(selected);status.textContent=failed?'Some files could not be listed. Existing permissions are kept; reopen the dashboard to retry.':'';
 }
 function load(){
  clients=[];try{const data=JSON.parse(doc.defaultView.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(data))throw new Error();for(const entry of data){try{if(typeof entry.id!=='string'||clients.some(c=>c.id===entry.id))continue;clients.push({id:entry.id,...validateClient(entry,clients,null,{allowLegacy:true})});}catch{}}}catch{status.textContent='Stored client data could not be read. New entries will stay in this visit until storage works.';}
 }
 function save(){try{doc.defaultView.localStorage.setItem(STORAGE_KEY,JSON.stringify(clients));return true;}catch{return false;}}
 function clearForm(){editingId=null;pendingClientId=null;form.reset();form.elements.hours.value='0';form.elements.amountPaid.value='0';root.querySelector('#save-admin-client').textContent='Add client';root.querySelector('#cancel-admin-edit').hidden=true;renderAccess();}
 function render(){
  const target=root.querySelector('#upload-client');if(target){const selected=target.value;target.replaceChildren();const all=doc.createElement('option');all.value='';all.textContent='Full library';target.append(all);for(const c of clients){const option=doc.createElement('option');option.value=c.id;option.textContent=c.name;target.append(option);}target.value=selected;}
  const total=clientTotals(clients);root.querySelector('#admin-total-hours').textContent=new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(total.hours);root.querySelector('#admin-total-clients').textContent=total.clients;tbody.replaceChildren();root.querySelector('#admin-no-clients').hidden=clients.length>0;
  for(const client of clients){const row=doc.createElement('tr');for(const value of [client.name,client.code||'Not assigned',client.level,client.payment,new Intl.NumberFormat('en',{minimumFractionDigits:2,maximumFractionDigits:2}).format(client.amountPaid??0),client.email,client.hours]){const cell=doc.createElement('td');cell.dataset.label=['Name','Student Code','Level / Program','Payment status','Amount paid','Email address','Hours taught'][row.children.length];cell.textContent=value;row.append(cell);}const cell=doc.createElement('td'),edit=doc.createElement('button');cell.dataset.label='Action';edit.type='button';edit.className='button light small';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+client.name);edit.onclick=()=>{if(!sheetLoading)openClientInfo(client.id);};const remove=doc.createElement('button');remove.type='button';remove.className='button light small admin-delete-client';remove.textContent='Delete';remove.setAttribute('aria-label','Delete '+client.name);remove.onclick=async()=>{if(!unlocked||sheetLoading)return;if(clientSheetConnected()){status.textContent='This list is connected to Google Sheets. Remove a client from the private sheet, then refresh; browser deletion would not remove their sheet record.';return;}if(ownerConnected()){status.textContent='This client is in private storage. Deletion requires a connected server delete service.';return;}if(!doc.defaultView.confirm('Delete '+client.name+' and their sessions from this dashboard? Rows already copied to Google Sheets are kept.'))return;try{removeBrowserClient(doc.defaultView.localStorage,client.id);clients=clients.filter(c=>c.id!==client.id);if(editingId===client.id)clearForm();render();await calendar?.load();doc.dispatchEvent(new doc.defaultView.CustomEvent('portal-permissions-changed'));status.textContent='Student deleted from this dashboard. Any existing Google Sheets row is unchanged.';}catch(error){status.textContent=error.message;}};cell.className='admin-client-actions';const authorize=doc.createElement('button');authorize.type='button';authorize.className='button light small';authorize.textContent='Actions';authorize.setAttribute('aria-label','Actions for '+client.name);authorize.onclick=()=>{if(unlocked&&!sheetLoading)openAuthorization(client);};cell.append(edit,authorize,remove);row.append(cell);tbody.append(row);}
 }
 function openClientInfo(id){const client=clients.find(c=>c.id===id);if(!client)return;if(!unlocked)return;editingId=client.id;for(const key of ['name','email','code','level','payment','amountPaid','hours'])form.elements[key].value=client[key]??(key==='amountPaid'?0:'');root.querySelector('#save-admin-client').textContent='Save changes';root.querySelector('#cancel-admin-edit').hidden=false;renderAccess(client.permissions);openClientPage();status.textContent='Editing '+client.name;form.elements.name.focus();}
 function openClientPage(){root.querySelector('#admin-overview').hidden=true;root.querySelector('#admin-client-page').hidden=false;root.querySelector('#admin-client-page-title').textContent=editingId?'Edit client folder':'Add client';doc.defaultView.location.hash='students-portal/client';}
 function showDashboard(){root.querySelector('#admin-overview').hidden=false;root.querySelector('#admin-client-page').hidden=true;doc.defaultView.location.hash='students-portal/teacher';}
 function lock(){if(authorization.open)authorization.close();authorizationClientId=null;confirmationId=null;sheetGeneration++;sheetLoading=false;refreshClients.disabled=false;root.querySelector('#admin-add-client').disabled=false;const dialog=root.querySelector('#teacher-login-dialog');if(dialog?.open)dialog.close();if(!root.hidden)doc.querySelector('#students-portal').classList.remove('portal-session-active');unlocked=false;documents?.lock();fullLibrary?.lock();switches?.lock();bookingSettings?.lock();clientSheet?.lock();review?.lock();calendar?.lock();gate.hidden=false;dashboard.hidden=true;login.reset();loginError.textContent='';password.removeAttribute('aria-invalid');clearForm();tbody.replaceChildren();clients=[];status.textContent='';}
 login.addEventListener('submit',event=>{event.preventDefault();if(password.value!==ADMIN_CODE){loginError.textContent='Incorrect admin password. Please try again.';password.setAttribute('aria-invalid','true');password.focus();return;}unlocked=true;loginError.textContent='';password.value='';gate.hidden=true;dashboard.hidden=false;root.querySelector('#teacher-login-dialog')?.close();doc.querySelector('#students-portal').classList.add('portal-session-active');doc.defaultView.scrollTo({top:0,left:0,behavior:'instant'});showDashboard();load();clientSheet?.restore();documents?.refresh();render();calendar?.load();loadAccessOptions();if(clientSheetConnected())refreshSheetClients();else status.textContent='Connect Google Sheets on this device to load students saved from your other devices.';});
 form.addEventListener('submit',async event=>{event.preventDefault();if(!unlocked||sheetLoading||!form.reportValidity()||form.dataset.saving)return;form.dataset.saving='true';const saveButton=root.querySelector('#save-admin-client');saveButton.disabled=true;try{const data=new doc.defaultView.FormData(form);const input={...Object.fromEntries(data),permissions:data.getAll('permissions')};let client=validateClient(input,clients,editingId);if(ownerConnected())client=await savePrivateClient({...client,...(editingId?{id:editingId}:{})});client={...client,id:editingId||client.id||(pendingClientId ||= doc.defaultView.crypto.randomUUID())};if(clientSheetConnected()){status.textContent='Saving client to Google Sheets…';await syncClientToSheet(client);}if(editingId){const index=clients.findIndex(c=>c.id===editingId);clients[index]=client;}else clients.push(client);const saved=ownerConnected()?true:save();doc.dispatchEvent(new doc.defaultView.CustomEvent('portal-permissions-changed'));clearForm();render();calendar?.refresh();showDashboard();status.textContent=clientSheetConnected()?'Client saved to Google Sheets.':ownerConnected()?'Client saved in private storage.':saved?'Client saved in this browser only — not sent to Google Sheets. Connect the client sheet to sync it.':'Client updated for this visit only. Browser storage is unavailable.';}catch(error){status.textContent=error.message;}finally{delete form.dataset.saving;saveButton.disabled=false;}});
 root.querySelector('#cancel-admin-edit').onclick=()=>{clearForm();showDashboard();status.textContent='';};
 root.querySelector('#admin-add-client').onclick=()=>{if(!unlocked)return;clearForm();openClientPage();};
 root.querySelector('#admin-back-dashboard').onclick=()=>{clearForm();showDashboard();};
 doc.addEventListener('portal-sign-out',lock);
 doc.querySelector('[data-portal-area="client"]').addEventListener('click',lock);
 doc.defaultView.addEventListener('hashchange',()=>{if(doc.defaultView.location.hash.split('/')[0]!=='#students-portal')lock();else if(doc.defaultView.location.hash==='#students-portal'&&unlocked){root.querySelector('#admin-overview').hidden=false;root.querySelector('#admin-client-page').hidden=true;}});

 lock();return{lock};
}
if(typeof document!=='undefined')initializeAdminPortal(document);
