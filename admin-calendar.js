import {removedPortalClientIds} from './requested-client-cleanup.js';
import {confirmClientEmail} from './client-email-confirmation.js?v=calendar-popup';
import {SESSION_PROGRAMS,SESSION_TYPES,calendarProgramForType,nextSessionNumber,suggestedSessionProgram} from './session-programs.js?v=appointment-types';
import {clientSheetConnected,loadSheetSessions,saveSheetSession,cancelSheetSession} from './client-sheet.js?v=level-history';
import {ownerConnected,request} from './exam-api.js';
import {openPopup} from './popups.js?v=mobile-assessment-page';
const STORAGE_KEY='speak-boldly-admin-sessions-v1';
export function calendarSlots(date){
 const weekday=new Date(date+'T12:00:00Z').getUTCDay();
 if([2,3,4].includes(weekday))return[{time:'18:00',label:'6–7:30pm'},{time:'19:30',label:'7:30–9pm'}];
 if(weekday===6)return[{time:'10:00',label:'10–11:30am'},{time:'11:30',label:'11:30am–1pm'}];
 return[];
}
export function sessionInitials(name){const words=name.trim().split(/\s+/u).filter(Boolean);return words.map(w=>Array.from(w)[0]).join('').toLocaleUpperCase();}
export function validateSession(input){
 const name=String(input.name||'').trim(),date=String(input.date||''),number=Number(input.number);
 if(!name||name.length>100)throw new Error('Enter a name (up to 100 characters).');
 if(!Number.isInteger(number)||number<1||number>9999)throw new Error('Enter a session number from 1 to 9999.');
 const parsed=new Date(date+'T12:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||date<'1900-01-01'||date>'9999-12-31')throw new Error('Choose a valid session date.');
 const clientId=String(input.clientId||'');if(!clientId||clientId.length>100)throw new Error('Choose an existing client.');
 const time=String(input.time||'');if(time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Choose a valid class time.');
 const program=String(input.program||'').trim(),level=String(input.level||'').trim();if(program&&program!=='Assessment'&&!SESSION_PROGRAMS.some(item=>item.title===program))throw new Error('Choose a valid program.');if(level&&(!/^[1-9]\d{0,3}$/.test(level)&&!['Not assessed','A1','A2','B1','B2','C1','C2'].includes(level)))throw new Error('Choose a valid session level.');
 return{name,date,number,clientId,...(time?{time}:{}),...(program?{program}:{}),...(level?{level}:{})};
}
export function cairoToday(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=t=>parts.find(p=>p.type===t).value;return get('year')+'-'+get('month')+'-'+get('day');
}
export function initializeAdminCalendar(doc,isUnlocked,getClients,openClient){
 const root=doc.querySelector('#admin-calendar');if(!root)return;
 const form=root.querySelector('form'),grid=root.querySelector('.calendar-grid'),status=root.querySelector('[role=status]'),heading=root.querySelector('#calendar-month');
 const chooser=form.elements.clientId;
 const typeLabel=doc.createElement('label');typeLabel.textContent='Appointment type';const type=doc.createElement('select');type.name='appointmentType';type.required=true;for(const item of SESSION_TYPES)type.append(new doc.defaultView.Option(item.title,item.id));typeLabel.append(type);chooser.closest('label').after(typeLabel);
 const programLabel=doc.createElement('label');programLabel.textContent='Program';const program=doc.createElement('select');program.name='program';program.required=true;program.append(new doc.defaultView.Option('Choose a program',''));for(const item of SESSION_PROGRAMS.filter(item=>item.id!=='trial'))program.append(new doc.defaultView.Option(item.title,item.title));programLabel.append(program);typeLabel.after(programLabel);
 const levelLabel=doc.createElement('label');levelLabel.textContent='Level for this session';const level=doc.createElement('select');level.name='level';level.required=true;for(const item of ['Not assessed',...Array.from({length:12},(_,i)=>String(i+1)),'A1','A2','B1','B2','C1','C2'])level.append(new doc.defaultView.Option(/^\d+$/.test(item)?'Level '+item:item,item));levelLabel.append(level);programLabel.after(levelLabel);
 const count=doc.createElement('p');count.setAttribute('role','status');form.elements.number.closest('label').after(count);
 function selectedProgram(){return type.value==='session'?program.value:type.value==='trial'?'Trial session':'Assessment';}
 function suggestNumber(){const selectedProgramValue=selectedProgram();if(!chooser.value||!selectedProgramValue){count.textContent='';return;}form.elements.number.value=nextSessionNumber(sessions,chooser.value,selectedProgramValue);const scheduled=sessions.filter(item=>item.clientId===chooser.value&&item.reminderStatus!=='cancelled'&&(!item.program||item.program===selectedProgramValue)).length;count.textContent=scheduled+' appointment'+(scheduled===1?'':'s')+' scheduled for '+(type.value==='session'?'this program':selectedProgramValue.toLowerCase())+'. Numbers can be adjusted.';}
 function updateType(){programLabel.hidden=type.value!=='session';program.disabled=type.value!=='session';program.required=type.value==='session';suggestNumber();}
 type.addEventListener('change',updateType);
 chooser.addEventListener('change',()=>{const client=getClients().find(item=>item.id===chooser.value);const suggested=suggestedSessionProgram(client)||'';program.value=suggested==='Trial session'?'':suggested;level.value=/^[1-9]\d{0,3}$/.test(client?.level||'')||['A1','A2','B1','B2','C1','C2'].includes(client?.level)?client.level:'Not assessed';if(client?.level&&!level.value){level.append(new doc.defaultView.Option('Level '+client.level,client.level));level.value=client.level;}suggestNumber();});program.addEventListener('change',suggestNumber);
 const weekdays=root.querySelector('.calendar-weekdays'),viewport=doc.createElement('div'),hint=doc.createElement('p');
 viewport.className='calendar-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Monthly calendar. Scroll horizontally to see all days.');
 hint.className='calendar-scroll-hint';hint.textContent='Swipe across the calendar to see all days.';
 grid.parentNode.insertBefore(hint,weekdays||grid);grid.parentNode.insertBefore(viewport,weekdays||grid);if(weekdays)viewport.append(weekdays);viewport.append(grid);
 function populateClients(){const previous=chooser.value;chooser.replaceChildren();const placeholder=doc.createElement('option');placeholder.value='';placeholder.textContent='Choose a client';chooser.append(placeholder);for(const client of getClients()){const option=doc.createElement('option');option.value=client.id;option.textContent=client.name+' — '+client.level;chooser.append(option);}chooser.value=previous;root.querySelector('.calendar-no-clients').hidden=getClients().length>0;}
 let sessions=[],selected=cairoToday(),month=selected.slice(0,7),storageReadable=true;
 const dateString=(year,m,day)=>String(year).padStart(4,'0')+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
 function appendAppointment(cell,button,item,name){
  const row=doc.createElement('div');row.className='calendar-appointment';row.append(button);
  if(item.id){const cancel=doc.createElement('button');cancel.type='button';cancel.className='calendar-cancel';cancel.textContent='×';cancel.title='Cancel appointment';cancel.setAttribute('aria-label','Cancel '+name+' session '+item.number);cancel.onclick=async()=>{if(!isUnlocked()||!await confirmClientEmail(doc,'Cancel '+(item.program||'this class')+' — Session '+item.number+' for '+name+' on '+item.date+' at '+item.time+' Cairo time?',{title:'Cancel class',ariaLabel:'Confirm class cancellation',className:'calendar-cancel-confirmation'})||!isUnlocked())return;cancel.disabled=true;try{if(clientSheetConnected())await cancelSheetSession(item.id);else await request('admin/classes/'+item.id+'/cancel',{role:'admin',method:'POST',data:{}});await load(true);}catch(error){status.textContent=error.message;cancel.disabled=false;}};row.append(cancel);}
  cell.append(row);
 }
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
   for(const slot of calendarSlots(date)){
    const bookings=items.filter(item=>item.time===slot.time);
    if(bookings.length){for(const item of bookings){const client=getClients().find(c=>c.id===item.clientId),name=client?.name||item.name,button=doc.createElement('button');button.type='button';button.className='calendar-slot calendar-slot-booked';button.textContent=sessionInitials(name)+' #'+item.number+'\n'+slot.label;button.title=(item.program||'Program not recorded')+' — '+(item.level?'Level '+item.level:'Level not recorded');button.setAttribute('aria-label','Open '+name+' client information, session '+item.number+' on '+date+' at '+slot.label+' Cairo time');button.onclick=()=>{if(isUnlocked()&&client)openClient(client.id);};appendAppointment(cell,button,item,name);}continue;}
    const button=doc.createElement('button');button.type='button';button.className='calendar-slot';button.textContent=slot.label;button.setAttribute('aria-label','Add session on '+date+' at '+slot.label+' Cairo time');
    button.onclick=()=>{if(!isUnlocked())return;selected=date;form.elements.date.value=date;form.elements.time.value=slot.time;populateClients();render();openPopup(root.querySelector('#calendar-session-dialog'));chooser.focus();};cell.append(button);
   }
   for(const item of items){const client=getClients().find(c=>c.id===item.clientId),name=client?.name||item.name;const badge=doc.createElement('button');badge.type='button';badge.className='calendar-session';badge.textContent=sessionInitials(name)+' #'+item.number;badge.title=name+' — '+(item.program||'Program not recorded')+' — '+(item.level?'Level '+item.level:'Level not recorded')+' — session '+item.number+(item.time?' — '+item.time+' Cairo time':'')+(item.reminderStatus?' — Email status: '+item.reminderStatus:'');badge.setAttribute('aria-label','Open '+name+' client information, session '+item.number);badge.onclick=()=>{if(isUnlocked()&&client)openClient(client.id);};if(!calendarSlots(date).some(slot=>slot.time===item.time))appendAppointment(cell,badge,item,name);}
   add.onclick=()=>{if(!isUnlocked())return;selected=date;form.elements.date.value=date;form.elements.time.value='';populateClients();render();openPopup(root.querySelector('#calendar-session-dialog'));chooser.focus();};grid.append(cell);
  }
 }
 let loading=false,loadEpoch=0;
 async function load({background=false}={}){
  if(loading||!isUnlocked())return;
  if(background&&(root.querySelector('#calendar-session-dialog')?.open))return;
  loading=true;const epoch=loadEpoch,oldMonth=month,oldSelected=selected;
  try{
   let local=[],localError=false;
   try{const data=JSON.parse(doc.defaultView.localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(data))throw new Error();for(const entry of data){try{local.push(validateSession(entry));}catch{localError=true;}}}catch{localError=true;}
   storageReadable=!localError;
   if(clientSheetConnected()){
    let sharedLoaded=false;
    try{
     let response=await loadSheetSessions();if(!isUnlocked()||epoch!==loadEpoch)return;
     sessions=response.classes.filter(item=>!removedPortalClientIds(doc.defaultView.localStorage).has(item.clientId));storageReadable=true;sharedLoaded=true;
     const warnings=[];
     if(!background){
      const today=cairoToday(),currentTime=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(new Date());
      const future=local.filter(s=>s.time);
      const untimed=local.filter(s=>!s.time);if(untimed.length)warnings.push(untimed.length+' old appointment(s) need a class time before they can sync.');
      for(const record of future){if(!isUnlocked()||epoch!==loadEpoch)return;try{await saveSheetSession(record,undefined,{importPast:true});}catch(error){warnings.push(error.message);}}
      response=await loadSheetSessions();if(!isUnlocked()||epoch!==loadEpoch)return;sessions=response.classes.filter(item=>!removedPortalClientIds(doc.defaultView.localStorage).has(item.clientId));
     }
     status.textContent='Shared calendar connected. Send class confirmations manually from each client’s Actions button.'+(warnings.length?' '+warnings.length+' browser appointment(s) could not upload: '+warnings[0]:'')+(localError?' Some old browser entries could not be read; shared appointments are still shown.':'');
    }catch(error){status.textContent='Calendar could not sync: '+error.message;if(!background&&!sharedLoaded){sessions=local;storageReadable=false;}}
   }else if(ownerConnected()){
    try{const response=await request('admin/classes',{role:'admin'});if(!isUnlocked()||epoch!==loadEpoch)return;sessions=response.classes.filter(item=>!removedPortalClientIds(doc.defaultView.localStorage).has(item.clientId));storageReadable=true;status.textContent='Private calendar connected. Confirmations are sent only when you authorize sending.';}catch(error){status.textContent=error.message;if(!background)storageReadable=false;}
   }else{sessions=local;status.textContent=localError?'Saved browser sessions could not all be read. Connect your sheet to view shared appointments.':'Calendar is on this device only. Connect the Clients sheet to sync appointments.';}
   if(!isUnlocked()||epoch!==loadEpoch)return;
   if(background&&root.querySelector('#calendar-session-dialog')?.open)return;
   populateClients();
   if(background){month=oldMonth;selected=oldSelected;}else{form.reset();updateType();selected=cairoToday();month=selected.slice(0,7);form.elements.date.value=selected;}
   render();
  }finally{loading=false;}
 }
 const poll=()=>{if(isUnlocked()&&!doc.hidden&&(clientSheetConnected()||ownerConnected()))load({background:true});};
 let pollTimer=doc.defaultView.setInterval(poll,60000);
 doc.defaultView.addEventListener('focus',poll);
 doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)poll();});
 doc.defaultView.addEventListener('pagehide',()=>doc.defaultView.clearInterval(pollTimer));
 doc.defaultView.addEventListener('pageshow',()=>{doc.defaultView.clearInterval(pollTimer);pollTimer=doc.defaultView.setInterval(poll,60000);poll();});
 function shift(step){if(!isUnlocked())return;const [year,m]=month.split('-').map(Number),date=new Date(Date.UTC(year,m-1+step,1));if(date.getUTCFullYear()<1900||date.getUTCFullYear()>9999)return;month=dateString(date.getUTCFullYear(),date.getUTCMonth(),1).slice(0,7);render();}
 root.querySelector('#calendar-previous').onclick=()=>shift(-1);root.querySelector('#calendar-next').onclick=()=>shift(1);
 root.querySelector('#calendar-today').onclick=()=>{if(!isUnlocked())return;selected=cairoToday();month=selected.slice(0,7);form.elements.date.value=selected;render();};
 form.onsubmit=async event=>{event.preventDefault();if(!isUnlocked()||!form.reportValidity())return;if(!storageReadable){status.textContent='Browser storage is unavailable or contains unreadable records. Existing sessions have been kept.';return;}
  try{loadEpoch++;const input=Object.fromEntries(new doc.defaultView.FormData(form)),client=getClients().find(c=>c.id===input.clientId);if(!client)throw new Error('Choose an existing client.');const record=validateSession({...input,program:calendarProgramForType(input.appointmentType,input.program),name:client.name});if(!record.time)throw new Error('Choose a class time.');
   if(clientSheetConnected()){
    const response=await saveSheetSession(record);if(!isUnlocked())return;
    sessions=response.classes.filter(item=>!removedPortalClientIds(doc.defaultView.localStorage).has(item.clientId));selected=record.date;month=record.date.slice(0,7);form.reset();updateType();form.elements.date.value=selected;render();
    status.textContent='Session '+record.number+' saved to your sheet for '+record.date+' at '+record.time+' Cairo time. '+'Send the confirmation from this client’s Actions button.';
   }
   else if(ownerConnected()){const response=await request('admin/classes',{role:'admin',method:'POST',data:record});if(!isUnlocked())return;await load();status.textContent='Session '+record.number+' saved for '+record.date+' at '+record.time+' Cairo time. '+'Confirmations are sent only when you authorize sending.';}
   else{const updated=[...sessions,record];doc.defaultView.localStorage.setItem(STORAGE_KEY,JSON.stringify(updated));sessions=updated;selected=record.date;month=record.date.slice(0,7);form.reset();updateType();form.elements.date.value=selected;render();status.textContent=sessionInitials(record.name)+' #'+record.number+' saved in this browser. Send class confirmations manually from Actions after connecting your Clients sheet.';}}

  catch(error){status.textContent=error.message;return;}
  root.querySelector('#calendar-session-dialog')?.close();
 };
 return{load,refresh(background=false){if(clientSheetConnected()||ownerConnected())load(background);else{populateClients();render();}},lock(){loadEpoch++;sessions=[];grid.replaceChildren();heading.textContent='';form.reset();updateType();status.textContent='';const dialog=root.querySelector('#calendar-session-dialog');if(dialog?.open)dialog.close();}};
}
