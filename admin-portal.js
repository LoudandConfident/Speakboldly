import {CLIENT_LEVELS,PAYMENT_STATUSES,validateClient,clientTotals} from './admin-clients.js';
import {PORTAL_SECTIONS,filePermission} from './portal-access.js';
import {loadPortalMaterials} from './portal-materials.js';
// Fixed Admin portal convenience code, independent of each assigned Student Code.
const ADMIN_CODE='1962';
const STORAGE_KEY='speak-boldly-admin-clients-v1';
export function initializeAdminPortal(doc,loader=loadPortalMaterials){
 const root=doc.querySelector('#admin-portal');if(!root)return;
 const gate=root.querySelector('#admin-gate'),login=root.querySelector('#admin-login-form'),dashboard=root.querySelector('#admin-dashboard'),password=root.querySelector('#admin-code'),loginError=root.querySelector('#admin-login-error'),form=root.querySelector('#admin-client-form'),status=root.querySelector('#admin-client-status'),tbody=root.querySelector('#admin-client-rows');
 let unlocked=false,clients=[],editingId=null;let materialCatalog={};
 for(const [name,values]of [['level',CLIENT_LEVELS],['payment',PAYMENT_STATUSES]])for(const value of values){const option=doc.createElement('option');option.value=option.textContent=value;(name==='level'?root.querySelector('#admin-client-level-options'):form.elements[name]).append(option);}
 function renderAccess(selected=[]){
  const options=root.querySelector('#admin-access-options');options.replaceChildren();const allowed=new Set(selected);
  for(const [section,label]of Object.entries(PORTAL_SECTIONS)){
   const group=doc.createElement('div');group.className='admin-access-group';
   const folderLabel=doc.createElement('label'),folder=doc.createElement('input');folder.type='checkbox';folder.name='permissions';folder.value='section:'+section;folder.checked=allowed.has(folder.value);folderLabel.append(folder,doc.createTextNode(label));group.append(folderLabel);
   const files=doc.createElement('div');files.className='admin-access-files';
   for(const item of materialCatalog[section]||[]){const label=doc.createElement('label'),input=doc.createElement('input');input.type='checkbox';input.name='permissions';input.value=filePermission(section,item.url);input.checked=allowed.has(input.value);label.append(input,doc.createTextNode(item.title));files.append(label);input.onchange=()=>{if(input.checked)folder.checked=true;};}
   folder.onchange=()=>files.querySelectorAll('input').forEach(input=>input.checked=folder.checked);group.append(files);options.append(group);
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
 function clearForm(){editingId=null;form.reset();form.elements.hours.value='0';root.querySelector('#save-admin-client').textContent='Add client';root.querySelector('#cancel-admin-edit').hidden=true;renderAccess();}
 function render(){
  const total=clientTotals(clients);root.querySelector('#admin-total-hours').textContent=new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(total.hours);root.querySelector('#admin-total-clients').textContent=total.clients;tbody.replaceChildren();root.querySelector('#admin-no-clients').hidden=clients.length>0;
  for(const client of clients){const row=doc.createElement('tr');for(const value of [client.name,client.code||'Not assigned',client.level,client.payment,client.email,client.hours]){const cell=doc.createElement('td');cell.textContent=value;row.append(cell);}const cell=doc.createElement('td'),edit=doc.createElement('button');edit.type='button';edit.className='button light small';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+client.name);edit.onclick=()=>{if(!unlocked)return;editingId=client.id;for(const key of ['name','email','code','level','payment','hours'])form.elements[key].value=client[key]??'';root.querySelector('#save-admin-client').textContent='Save changes';root.querySelector('#cancel-admin-edit').hidden=false;renderAccess(client.permissions);openClientPage();status.textContent='Editing '+client.name;form.elements.name.focus();};cell.append(edit);row.append(cell);tbody.append(row);}
 }
 function openClientPage(){root.querySelector('#admin-overview').hidden=true;root.querySelector('#admin-client-page').hidden=false;root.querySelector('#admin-client-page-title').textContent=editingId?'Edit client folder':'Add client';doc.defaultView.location.hash='students-portal/client';}
 function showDashboard(){root.querySelector('#admin-overview').hidden=false;root.querySelector('#admin-client-page').hidden=true;doc.defaultView.location.hash='students-portal';}
 function lock(){unlocked=false;gate.hidden=false;dashboard.hidden=true;login.reset();loginError.textContent='';password.removeAttribute('aria-invalid');clearForm();tbody.replaceChildren();clients=[];status.textContent='';}
 login.addEventListener('submit',event=>{event.preventDefault();if(password.value!==ADMIN_CODE){loginError.textContent='Incorrect admin password. Please try again.';password.setAttribute('aria-invalid','true');password.focus();return;}unlocked=true;loginError.textContent='';password.value='';gate.hidden=true;dashboard.hidden=false;showDashboard();load();render();loadAccessOptions();});
 form.addEventListener('submit',event=>{event.preventDefault();if(!unlocked||!form.reportValidity())return;try{const data=new doc.defaultView.FormData(form);const input={...Object.fromEntries(data),permissions:data.getAll('permissions')};const client=validateClient(input,clients,editingId);if(editingId){const index=clients.findIndex(c=>c.id===editingId);clients[index]={id:editingId,...client};}else clients.push({id:doc.defaultView.crypto.randomUUID(),...client});const saved=save();doc.dispatchEvent(new doc.defaultView.CustomEvent('portal-permissions-changed'));clearForm();render();showDashboard();status.textContent=saved?'Client folder saved in this browser.':'Client updated for this visit only. Browser storage is unavailable.';}catch(error){status.textContent=error.message;}});
 root.querySelector('#cancel-admin-edit').onclick=()=>{clearForm();showDashboard();status.textContent='';};
 root.querySelector('#admin-add-client').onclick=()=>{if(!unlocked)return;clearForm();openClientPage();};
 root.querySelector('#admin-back-dashboard').onclick=()=>{clearForm();showDashboard();};
 root.querySelector('#admin-open-student-portal').onclick=()=>{if(!unlocked)return;doc.querySelector('[data-portal-area=client]').click();doc.dispatchEvent(new doc.defaultView.CustomEvent('portal-admin-preview'));};
 root.querySelector('#lock-admin-portal').onclick=()=>{lock();password.focus();};
 doc.querySelector('[data-portal-area="client"]').addEventListener('click',lock);
 doc.defaultView.addEventListener('hashchange',()=>{if(doc.defaultView.location.hash.split('/')[0]!=='#students-portal')lock();else if(doc.defaultView.location.hash==='#students-portal'&&unlocked){root.querySelector('#admin-overview').hidden=false;root.querySelector('#admin-client-page').hidden=true;}});
 lock();return{lock};
}
if(typeof document!=='undefined')initializeAdminPortal(document);
