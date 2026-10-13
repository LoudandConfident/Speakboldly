import {cairoToday} from './admin-calendar.js?v=appointment-x';
export function initializeStudentBooking(doc){
 const root=doc.querySelector('#portal-calendar');if(!root)return{lock(){}};
 const endpoint=doc.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 let token='',month=cairoToday().slice(0,7),today=cairoToday(),generation=0,requestId=null,submitting=false;const selected=new Map();
 const intro=text('p','After payment, placement and registration, enter the booking passcode provided by your instructor. Times are in Cairo time.');
 const gate=doc.createElement('form');gate.className='booking-passcode-form';const passLabel=text('label','Booking passcode'),pass=doc.createElement('input');pass.type='password';pass.name='passcode';pass.autocomplete='off';pass.maxLength=64;pass.required=true;passLabel.append(pass);const unlock=text('button','Open calendar');unlock.type='submit';unlock.className='button';gate.append(passLabel,unlock);
 const status=text('p','');status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const content=doc.createElement('div');content.hidden=true;
 const toolbar=doc.createElement('div');toolbar.className='calendar-toolbar';const previous=text('button','‹'),next=text('button','›'),heading=text('h4',''),refresh=text('button','Refresh'),close=text('button','Lock calendar');
 for(const b of [previous,next,refresh,close]){b.type='button';b.className='button light small';}previous.setAttribute('aria-label','Previous booking month');next.setAttribute('aria-label','Next booking month');toolbar.append(previous,heading,next,refresh,close);
 const hint=text('p','Swipe across the calendar to see all days.');hint.className='calendar-scroll-hint';
 const viewport=doc.createElement('div');viewport.className='calendar-viewport';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Client booking calendar. Scroll horizontally to see all days.');
 const weekdays=doc.createElement('div'),grid=doc.createElement('div');weekdays.className='calendar-weekdays';grid.className='calendar-grid';for(const day of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])weekdays.append(text('span',day));viewport.append(weekdays,grid);
 const form=doc.createElement('form');form.className='student-booking-form';const nameLabel=text('label','Your registered name'),name=doc.createElement('input');name.name='name';name.autocomplete='name';name.maxLength=100;name.required=true;nameLabel.append(name);const chosen=doc.createElement('div');chosen.className='booking-selected-slots';const book=text('button','Book selected slots');book.className='button';book.type='submit';book.disabled=true;form.append(nameLabel,chosen,book);
 content.append(toolbar,hint,viewport,form);root.replaceChildren(text('h3','Calendar'),intro,gate,status,content);
 async function call(action,data={}){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,...data}),signal:controller.signal});const result=await response.json();if(!response.ok||!result.ok)throw new Error(/Incorrect connection key|Not authorized|Invalid action/.test(result.error||'')?'Your instructor needs to deploy the updated booking script.':result.error||'Booking failed.');return result;}
  catch(error){if(error.name==='AbortError')throw new Error('Google Sheets took too long to respond. Retry the same selection; bookings will not be duplicated.');throw error;}finally{clearTimeout(timer);}
 }
 function selections(){chosen.replaceChildren();for(const [key,item]of selected){const row=doc.createElement('div');row.className='booking-selected-slot';row.append(text('span',item.date+' · '+item.label));const remove=text('button','×');remove.type='button';remove.className='button light small';remove.setAttribute('aria-label','Remove '+item.date+' '+item.label);remove.disabled=submitting;remove.onclick=()=>{selected.delete(key);requestId=null;selections();grid.querySelectorAll('[data-slot]').forEach(button=>button.setAttribute('aria-pressed',String(selected.has(button.dataset.slot))));};row.append(remove);chosen.append(row);}book.disabled=submitting||!selected.size;book.textContent=selected.size?'Book '+selected.size+' selected slot'+(selected.size===1?'':'s'):'Book selected slots';}
 function draw(data){
  today=data.today;month=data.month;grid.replaceChildren();const [year,m]=month.split('-').map(Number),offset=new Date(Date.UTC(year,m-1,1)).getUTCDay();
  heading.textContent=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,m-1,1)));
  const [cy,cm]=today.slice(0,7).split('-').map(Number),difference=(year-cy)*12+m-cm;previous.disabled=difference<=0;next.disabled=difference>=2;
  for(let i=0;i<offset;i++){const blank=doc.createElement('div');blank.className='calendar-blank';blank.setAttribute('aria-hidden','true');grid.append(blank);}
  for(const day of data.days){const cell=doc.createElement('div');cell.className='calendar-day';cell.dataset.date=day.date;const number=text('span',String(Number(day.date.slice(-2))));number.className='calendar-day-number';if(day.date===today)number.setAttribute('aria-current','date');cell.append(number);
   for(const item of day.slots){const key=item.date+' '+item.time,button=text('button',(item.status==='taken'?'Taken':item.status==='past'?'Unavailable':'Available')+'\n'+item.label);button.type='button';button.className='calendar-slot'+(item.status==='taken'?' calendar-slot-booked':'');button.dataset.slot=key;button.dataset.status=item.status;button.disabled=item.status!=='available'||submitting;button.setAttribute('aria-pressed',String(selected.has(key)));button.setAttribute('aria-label',(item.status==='available'?'Select available slot ':item.status==='taken'?'Taken slot ':'Unavailable slot ')+item.date+' '+item.label+' Cairo time');
    if(item.status!=='available'){selected.delete(key);button.setAttribute('aria-pressed','false');}
    button.onclick=()=>{if(selected.has(key))selected.delete(key);else{if(selected.size>=16){status.textContent='You can select up to 16 slots at once.';return;}selected.set(key,item);}requestId=null;button.setAttribute('aria-pressed',String(selected.has(key)));selections();};cell.append(button);
   }grid.append(cell);
  }selections();
 }
 async function load(quiet=false){const current=generation;refresh.disabled=true;if(!quiet)status.textContent='Loading calendar…';try{const data=await call('studentBookingCalendar',{month});if(current!==generation)return;draw(data);if(!quiet)status.textContent='Choose your available slots. Taken slots do not show client names.';}catch(error){if(current===generation)status.textContent=error.message;}finally{refresh.disabled=false;}}
 gate.onsubmit=async event=>{event.preventDefault();const current=generation;unlock.disabled=true;status.textContent='Checking passcode…';try{const result=await call('studentBookingLogin',{passcode:pass.value});if(current!==generation)return;token=result.token;pass.value='';gate.hidden=true;content.hidden=false;month=cairoToday().slice(0,7);await load();}catch(error){if(current===generation)status.textContent=error.message;}finally{unlock.disabled=false;}};
 function shift(amount){const [year,m]=month.split('-').map(Number),date=new Date(Date.UTC(year,m-1+amount,1));month=date.toISOString().slice(0,7);load();}
 previous.onclick=()=>{if(!submitting)shift(-1);};next.onclick=()=>{if(!submitting)shift(1);};refresh.onclick=()=>{if(!submitting)load();};name.oninput=()=>{requestId=null;};
 form.onsubmit=async event=>{
  event.preventDefault();if(submitting||!selected.size||!form.reportValidity())return;const current=generation;
  submitting=true;name.disabled=true;requestId ||= doc.defaultView.crypto.randomUUID();selections();grid.querySelectorAll('button').forEach(button=>button.disabled=true);status.textContent='Saving your selected slots…';
  try{const result=await call('studentBookSlots',{name:name.value.trim(),requestId,slots:[...selected.values()].map(item=>({date:item.date,time:item.time}))});if(current!==generation)return;selected.clear();requestId=null;submitting=false;await load(true);status.textContent=result.booked.length+' slot'+(result.booked.length===1?'':'s')+' booked. Your instructor will send the class confirmation after review.';}
  catch(error){if(current===generation){submitting=false;if(/taken|no longer available/.test(error.message)){await load(true);requestId=null;}else grid.querySelectorAll('button[data-status]').forEach(button=>button.disabled=button.dataset.status!=='available');status.textContent=error.message;}}finally{if(current===generation){submitting=false;name.disabled=false;selections();}}
 };
 function lock(){generation++;token='';selected.clear();requestId=null;submitting=false;gate.reset();gate.hidden=false;content.hidden=true;status.textContent='';grid.replaceChildren();selections();}
 close.onclick=lock;return{lock};
}
