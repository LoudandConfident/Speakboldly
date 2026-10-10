import {ownerConnected,request} from './exam-api.js';
import {openPopup} from './popups.js';
const STORAGE_KEY='speak-boldly-admin-sessions-v1';
export function sessionInitials(name){const words=name.trim().split(/\s+/u).filter(Boolean);return words.map(w=>Array.from(w)[0]).join('').toLocaleUpperCase();}
export function validateSession(input){
 const name=String(input.name||'').trim(),date=String(input.date||''),number=Number(input.number);
 if(!name||name.length>100)throw new Error('Enter a name (up to 100 characters).');
 if(!Number.isInteger(number)||number<1||number>9999)throw new Error('Enter a session number from 1 to 9999.');
 const parsed=new Date(date+'T12:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||date<'1900-01-01'||date>'9999-12-31')throw new Error('Choose a valid session date.');
 const clientId=String(input.clientId||'');if(!clientId||clientId.length>100)throw new Error('Choose an existing client.');
 const time=String(input.time||'');if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Choose a valid class time.');
 return{name,date,number,clientId,...(time?{time}:{})};
}
export function cairoToday(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=t=>parts.find(p=>p.type===t).value;return get('year')+'-'+get('month')+'-'+get('day');
}
export function initializeAdminCalendar(doc,isUnlocked,getClients,openClient){
 const root=doc.querySelector('#admin-calendar');if(!root)return;
 const form=root.querySelector('form'),grid=root.querySelector('.calendar-grid'),status=root.querySelector('[role=status]'),heading=root.querySelector('#calendar-month');
 const chooser=form.elements.clientId;
 function populateClients(){const previous=chooser.value;chooser.replaceChildren();const placeholder=doc.createElement('option');placeholder.value='';placeholder.textContent='Choose a client';chooser.append(placeholder);for(const client of getClients()){const option=doc.createElement('option');option.value=client.id;option.textContent=client.name+' — '+client.level;chooser.append(option);}chooser.value=previous;root.querySelector('.calendar-no-clients').hidden=getClients().length>0;}
 let sessions=[],selected=cairoToday(),month=selected.slice(0,7),storageReadable=true;
 const dateString=(year,m,day)=>String(year).padStart(4,'0')+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 function render(){
  const [year,m]=month.split('-').map(Number);heading.textContent=new Intl.DateTimeFormat('en',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(month+'-01T12:00:00Z'));grid.replaceChildren();
  const offset=new Date(Date.UTC(year,m-1,1)).getUTCDay(),count=new Date(Date.UTC(year,m,0)).getUTCDate();
  for(let i=0;i<offset;i++){const blank=doc.createElement('div');blank.className='calendar-blank';blank.setAttribute('aria-hidden','true');grid.append(blank);}
  const today=cairoToday();
  for(let day=1;day<=count;day++){
   const date=dateString(year,m-1,day),cell=doc.createElement('div');cell.className='calendar-day';cell.dataset.date=date;if(selected===date)cell.classList.add('calendar-selected');
   const header=doc.createElement('div');header.className='calendar-day-header';
   const number=doc.createElement('span');number.className='calendar-day-number';number.textContent=day;if(date===today)number.setAttribute('aria-current','date');
   const add=doc.createElement('button');add.type='button';add.className='calendar-add';add.textContent='+';add.setAttribute('aria-label','Add session on '+date);header.append(number,add);cell.append(header);
   const items=sessions.filter(s=>s.date===date&&s.reminderStatus!=='cancelled');
   for(const item of items){const client=getClients().find(c=>c.id===item.clientId),name=client?.name||item.name;const badge=doc.createElement('button');badge.type='button';badge.className='calendar-session';badge.textContent=sessionInitials(name)+' #'+item.number;badge.title=name+' — session '+item.number+(item.time?' — '+item.time+' Cairo time':'')+(item.reminderStatus?' — Reminder: '+item.reminderStatus:'');badge.setAttribute('aria-label','Open '+name+' client information, session '+item.number);badge.onclick=()=>{if(isUnlocked()&&client)openClient(client.id);};cell.append(badge);if(item.id&&item.reminderStatus!=='cancelled'){const cancel=doc.createElement('button');cancel.type='button';cancel.className='calendar-cancel';cancel.textContent='Cancel';cancel.setAttribute('aria-label','Cancel '+name+' session '+item.number);cancel.onclick=async()=>{if(!isUnlocked()||!doc.defaultView.confirm('Cancel this class and stop its pending reminder?'))return;cancel.disabled=true;try{await request('admin/classes/'+item.id+'/cancel',{role:'admin',method:'POST',data:{}});await load();}catch(error){status.textContent=error.message;cancel.disabled=false;}};cell.append(cancel);}}
   add.onclick=()=>{if(!isUnlocked())return;selected=date;form.elements.date.value=date;populateClients();render();openPopup(root.querySelector('#calendar-session-dialog'));chooser.focus();};grid.append(cell);
  }
 }
 async function load(){
  sessions=[];storageReadable=true;status.textContent='';
  try{const data=JSON.parse(doc.defaultView.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(data))throw new Error();sessions=data.map(entry=>validateSession(entry));}
  catch{storageReadable=false;status.textContent='Saved sessions could not be read. No records will be overwritten.';}
  if(ownerConnected()){try{const response=await request('admin/classes',{role:'admin'});if(!isUnlocked())return;sessions=response.classes;storageReadable=true;status.textContent=response.emailReady?'Private calendar connected. Reminders are sent 24 hours before class.':'Classes are stored privately, but email delivery is not configured yet.';}catch(error){storageReadable=false;status.textContent=error.message;}}
  populateClients();form.reset();selected=cairoToday();month=selected.slice(0,7);form.elements.date.value=selected;render();
 }
 function shift(step){if(!isUnlocked())return;const [year,m]=month.split('-').map(Number),date=new Date(Date.UTC(year,m-1+step,1));if(date.getUTCFullYear()<1900||date.getUTCFullYear()>9999)return;month=dateString(date.getUTCFullYear(),date.getUTCMonth(),1).slice(0,7);render();}
 root.querySelector('#calendar-previous').onclick=()=>shift(-1);root.querySelector('#calendar-next').onclick=()=>shift(1);
 root.querySelector('#calendar-today').onclick=()=>{if(!isUnlocked())return;selected=cairoToday();month=selected.slice(0,7);form.elements.date.value=selected;render();};
 form.onsubmit=async event=>{event.preventDefault();if(!isUnlocked()||!form.reportValidity())return;if(!storageReadable){status.textContent='Browser storage is unavailable or contains unreadable records. Existing sessions have been kept.';return;}
  try{const input=Object.fromEntries(new doc.defaultView.FormData(form)),client=getClients().find(c=>c.id===input.clientId);if(!client)throw new Error('Choose an existing client.');const record=validateSession({...input,name:client.name});if(!record.time)throw new Error('Choose a class time.');
   if(ownerConnected()){const response=await request('admin/classes',{role:'admin',method:'POST',data:record});if(!isUnlocked())return;await load();status.textContent='Session '+record.number+' saved for '+record.date+' at '+record.time+' Cairo time. '+(response.emailReady?'Reminder scheduled; bookings within 24 hours are reminded shortly.':'Email delivery is not configured yet.');}
   else{const updated=[...sessions,record];doc.defaultView.localStorage.setItem(STORAGE_KEY,JSON.stringify(updated));sessions=updated;selected=record.date;month=record.date.slice(0,7);form.reset();form.elements.date.value=selected;render();status.textContent=sessionInitials(record.name)+' #'+record.number+' saved in this browser. Automatic reminders require the private server and email connection.';}}

  catch(error){status.textContent=error.message;return;}
  root.querySelector('#calendar-session-dialog')?.close();
 };
 return{load,refresh(){if(ownerConnected())load();else{populateClients();render();}},lock(){sessions=[];grid.replaceChildren();heading.textContent='';form.reset();status.textContent='';const dialog=root.querySelector('#calendar-session-dialog');if(dialog?.open)dialog.close();}};
}
