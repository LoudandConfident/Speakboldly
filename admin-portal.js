import {CLIENT_LEVELS,PAYMENT_STATUSES,validateClient,clientTotals} from './admin-clients.js';
// Fixed Admin portal convenience code, independent of the rotating Student Code.
const ADMIN_CODE='1962';
const STORAGE_KEY='speak-boldly-admin-clients-v1';
export function initializeAdminPortal(doc){
 const root=doc.querySelector('#admin-portal');if(!root)return;
 const gate=root.querySelector('#admin-gate'),login=root.querySelector('#admin-login-form'),dashboard=root.querySelector('#admin-dashboard'),password=root.querySelector('#admin-code'),loginError=root.querySelector('#admin-login-error'),form=root.querySelector('#admin-client-form'),status=root.querySelector('#admin-client-status'),tbody=root.querySelector('#admin-client-rows');
 let unlocked=false,clients=[],editingId=null;
 for(const [name,values]of [['level',CLIENT_LEVELS],['payment',PAYMENT_STATUSES]])for(const value of values){const option=doc.createElement('option');option.value=option.textContent=value;form.elements[name].append(option);}
 function load(){
  clients=[];try{const data=JSON.parse(doc.defaultView.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(data))throw new Error();for(const entry of data){try{if(typeof entry.id!=='string'||clients.some(c=>c.id===entry.id))continue;clients.push({id:entry.id,...validateClient(entry,clients)});}catch{}}}catch{status.textContent='Stored client data could not be read. New entries will stay in this visit until storage works.';}
 }
 function save(){try{doc.defaultView.localStorage.setItem(STORAGE_KEY,JSON.stringify(clients));return true;}catch{return false;}}
 function clearForm(){editingId=null;form.reset();form.elements.hours.value='0';root.querySelector('#save-admin-client').textContent='Add client';root.querySelector('#cancel-admin-edit').hidden=true;}
 function render(){
  const total=clientTotals(clients);root.querySelector('#admin-total-hours').textContent=new Intl.NumberFormat('en',{maximumFractionDigits:2}).format(total.hours);root.querySelector('#admin-total-clients').textContent=total.clients;tbody.replaceChildren();root.querySelector('#admin-no-clients').hidden=clients.length>0;
  for(const client of clients){const row=doc.createElement('tr');for(const value of [client.name,client.level,client.payment,client.email,client.hours]){const cell=doc.createElement('td');cell.textContent=value;row.append(cell);}const cell=doc.createElement('td'),edit=doc.createElement('button');edit.type='button';edit.className='button light small';edit.textContent='Edit';edit.setAttribute('aria-label','Edit '+client.name);edit.onclick=()=>{if(!unlocked)return;editingId=client.id;for(const key of ['name','email','level','payment','hours'])form.elements[key].value=client[key];root.querySelector('#save-admin-client').textContent='Save changes';root.querySelector('#cancel-admin-edit').hidden=false;status.textContent='Editing '+client.name;form.elements.name.focus();};cell.append(edit);row.append(cell);tbody.append(row);}
 }
 function lock(){unlocked=false;gate.hidden=false;dashboard.hidden=true;login.reset();loginError.textContent='';password.removeAttribute('aria-invalid');clearForm();tbody.replaceChildren();clients=[];status.textContent='';}
 login.addEventListener('submit',event=>{event.preventDefault();if(password.value!==ADMIN_CODE){loginError.textContent='Incorrect admin password. Please try again.';password.setAttribute('aria-invalid','true');password.focus();return;}unlocked=true;loginError.textContent='';password.value='';gate.hidden=true;dashboard.hidden=false;load();render();form.elements.name.focus();});
 form.addEventListener('submit',event=>{event.preventDefault();if(!unlocked||!form.reportValidity())return;try{const input=Object.fromEntries(new doc.defaultView.FormData(form));const client=validateClient(input,clients,editingId);if(editingId){const index=clients.findIndex(c=>c.id===editingId);clients[index]={id:editingId,...client};}else clients.push({id:doc.defaultView.crypto.randomUUID(),...client});const saved=save();clearForm();render();status.textContent=saved?'Client record saved in this browser.':'Client updated for this visit only. Browser storage is unavailable.';}catch(error){status.textContent=error.message;}});
 root.querySelector('#cancel-admin-edit').onclick=()=>{clearForm();status.textContent='';};
 root.querySelector('#lock-admin-portal').onclick=()=>{lock();password.focus();};
 doc.querySelector('[data-portal-area="client"]').addEventListener('click',lock);
 doc.defaultView.addEventListener('hashchange',()=>{if(doc.defaultView.location.hash!=='#students-portal')lock();});
 lock();return{lock};
}
if(typeof document!=='undefined')initializeAdminPortal(document);
