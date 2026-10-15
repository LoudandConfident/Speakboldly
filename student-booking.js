const today=()=>{const p=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new Date()),get=t=>p.find(x=>x.type===t).value;return get('year')+'-'+get('month')+'-'+get('day');};
export function initializeStudentBooking(doc){
 const root=doc.querySelector('#portal-calendar');if(!root)return{lock(){},open(){}};
 const win=doc.defaultView,endpoint=doc.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 const el=(tag,value)=>{const n=doc.createElement(tag);n.textContent=value;return n;};
 let token='',kind='',month=today().slice(0,7),epoch=0,loadId=0,requestId=null,busy=false,sent=false,programs=[],paymentEmail='',selectedDay;
 const status=el('p','');status.setAttribute('role','status');
 const types=el('div','');types.className='booking-types';types.setAttribute('role','group');types.setAttribute('aria-label','What are you booking?');
 const content=el('div','');content.hidden=true;
 const toolbar=el('div','');toolbar.className='calendar-toolbar';
 const previous=el('button','‹'),heading=el('h4',''),next=el('button','›'),refresh=el('button','Refresh');
 for(const b of [previous,next,refresh]){b.type='button';b.className='button light small';}
 previous.setAttribute('aria-label','Previous booking month');next.setAttribute('aria-label','Next booking month');toolbar.append(previous,heading,next,refresh);
 const weekdays=el('div',''),grid=el('div','');weekdays.className='calendar-weekdays';grid.className='calendar-grid booking-day-grid';for(const d of ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'])weekdays.append(el('span',d));content.append(toolbar,weekdays,grid);
 for(const [id,label,duration]of [['placement','Placement test',30],['session','Session',90],['trial','Trial session',90]]){const b=el('button',label+' · '+duration+' minutes');b.type='button';b.className='button light';b.dataset.bookingType=id;b.setAttribute('aria-pressed','false');b.onclick=()=>{if(busy)return;kind=id;types.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed',String(n===b)));content.hidden=false;load();};types.append(b);}
 root.replaceChildren(el('h3','Calendar'),el('p','What are you booking? Choose an appointment type, then a date and time. All times are in Cairo.'),types,status,content);
 const dialog=el('dialog','');dialog.id='booking-registration-dialog';dialog.className='action-popup booking-registration-dialog';dialog.setAttribute('aria-labelledby','booking-registration-title');
 const close=el('button','×');close.type='button';close.className='popup-close';close.setAttribute('aria-label','Close registration');
 const title=el('h2','Register your appointment');title.id='booking-registration-title';const summary=el('p',''),form=el('form','');form.className='booking-registration-form';
 function field(label,tag,name){const wrapper=el('label',label),input=el(tag,'');input.name=name;input.required=true;wrapper.append(input);form.append(wrapper);return input;}
 const time=field('Start time · Cairo','select','time'),name=field('Name','input','name'),email=field('Email','input','email'),program=field('Program','select','program'),paid=field('Have you paid?','select','paid');
 name.autocomplete='name';name.maxLength=100;email.type='email';email.autocomplete='email';email.maxLength=254;
 for(const [v,l]of [['','Choose payment status'],['yes','Yes'],['no','No'],['not-required','Payment is not required']])paid.append(new win.Option(l,v));
 const payment=el('p',''),submit=el('button','Send registration request'),note=el('p','');note.setAttribute('role','status');payment.className='booking-payment-instructions';submit.type='submit';submit.className='button';form.append(payment,submit,note);dialog.append(close,title,summary,form);doc.body.append(dialog);
 close.onclick=()=>{if(!busy)dialog.close();};dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});form.addEventListener('input',()=>{if(!busy&&!sent)requestId=null;});
 async function call(action,data={}){const controller=new AbortController(),timer=win.setTimeout(()=>controller.abort(),45000);try{const r=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,token,...data}),signal:controller.signal}),result=await r.json();if(!r.ok||!result.ok)throw new Error(result.error||'The calendar request failed.');return result;}catch(e){if(e.name==='AbortError')throw new Error('The connection took too long. Retry without changing your details; your request will not be duplicated.');throw e;}finally{win.clearTimeout(timer);}}
 function openDay(day){
  if(busy)return;selectedDay=day;requestId=null;sent=false;form.reset();form.querySelectorAll('input,select,button').forEach(n=>n.disabled=false);note.textContent='';submit.textContent='Send registration request';time.replaceChildren(new win.Option('Choose a start time',''));
  for(const slot of day.slots.filter(s=>!['past','unavailable'].includes(s.status))){const option=new win.Option(slot.label+(slot.status==='taken'?' · Taken':''),slot.time);option.disabled=slot.status!=='available';time.append(option);}
  program.replaceChildren(new win.Option('Choose a program',''));for(const item of programs)program.append(new win.Option(item,item));
  title.textContent={placement:'Placement test · 30 minutes',session:'Session · 90 minutes',trial:'Trial session · 90 minutes'}[kind];summary.textContent=day.date+' · Cairo time. Your instructor must accept your request before this time is reserved.';
  payment.replaceChildren(el('span','Please send the screenshot of your payment to '));const link=el('a',paymentEmail);link.href='mailto:'+paymentEmail;payment.append(link,el('span','. Include your name, program, and requested date and time. If payment is not required, select that option above.'));
  dialog.showModal();time.focus();
 }
 function draw(data){
  month=data.month;grid.replaceChildren();const [y,m]=month.split('-').map(Number),offset=new Date(Date.UTC(y,m-1,1)).getUTCDay();heading.textContent=new Intl.DateTimeFormat('en-GB',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(y,m-1,1)));previous.disabled=month<=data.today.slice(0,7);next.disabled=month>=data.windowEnd.slice(0,7);
  for(let i=0;i<offset;i++){const blank=el('div','');blank.className='calendar-blank';grid.append(blank);}
  for(const day of data.days){const available=day.slots.filter(s=>s.status==='available'),taken=day.slots.filter(s=>s.status==='taken'),cell=el('div','');cell.className='calendar-day'+(!day.available?' calendar-day-blocked':'');cell.dataset.date=day.date;const number=el('span',String(Number(day.date.slice(-2))));number.className='calendar-day-number';if(day.date===data.today)number.setAttribute('aria-current','date');cell.append(number);
   if(available.length){const b=el('button',available.length+' available');b.type='button';b.className='calendar-slot booking-choose-day';b.setAttribute('aria-label','Choose a time on '+day.date+' · '+available.length+' available');b.onclick=()=>openDay(day);cell.append(b);}if(taken.length)cell.append(el('small',taken.length+' taken'));grid.append(cell);
  }
 }
 async function load(){if(!kind||!token||busy)return;const current=epoch,version=++loadId;refresh.disabled=true;status.textContent='Loading available times…';try{const data=await call('studentBookingCalendar',{kind,month});if(current!==epoch||version!==loadId)return;draw(data);status.textContent='Booking requests are open through '+data.windowEnd+'. A slot is reserved only after your instructor accepts it.';}catch(e){if(current===epoch&&version===loadId)status.textContent=e.message;}finally{if(current===epoch&&version===loadId)refresh.disabled=false;}}
 async function open(){if(token){if(kind)await load();return;}const current=epoch;status.textContent='Loading calendar…';try{const data=await call('studentBookingLogin',{public:true});if(current!==epoch)return;if(data.registrationVersion!==1)throw new Error('Your instructor needs to deploy the updated registration script first.');token=data.token;programs=data.programs;paymentEmail=data.paymentEmail;status.textContent='Choose Placement test, Session, or Trial session.';if(kind)await load();}catch(e){if(current===epoch)status.textContent=e.message;}}
 function shift(n){if(busy)return;const [y,m]=month.split('-').map(Number);month=new Date(Date.UTC(y,m-1+n,1)).toISOString().slice(0,7);load();}
 previous.onclick=()=>shift(-1);next.onclick=()=>shift(1);refresh.onclick=()=>load();
 form.onsubmit=async event=>{event.preventDefault();if(busy||sent||!selectedDay||!form.reportValidity())return;const current=epoch,payload={kind,date:selectedDay.date,time:time.value,name:name.value.trim(),email:email.value.trim(),program:program.value,paid:paid.value,requestId:requestId ||= win.crypto.randomUUID()};busy=true;close.disabled=true;form.querySelectorAll('input,select,button').forEach(n=>n.disabled=true);note.textContent='Sending registration request…';
  try{const result=await call('studentRegisterSlot',payload);if(current!==epoch)return;sent=true;submit.textContent='Request received';note.textContent='Request received. Awaiting instructor approval. This time is not reserved yet. Please send your payment screenshot to '+paymentEmail+'.';status.textContent='Your registration request is awaiting instructor approval.';if(['failed','delivery_unknown'].includes(result.notificationStatus))note.textContent+=' Your request is saved in the instructor dashboard; the notification email may be delayed.';}
  catch(e){if(current===epoch){note.textContent=e.message;form.querySelectorAll('input,select,button').forEach(n=>n.disabled=false);}}finally{if(current===epoch){busy=false;close.disabled=false;}}
 };
 const refreshVisible=()=>{if(!doc.hidden&&token&&!root.hidden&&!dialog.open)load();};doc.addEventListener('calendar-availability-changed',refreshVisible);doc.addEventListener('visibilitychange',refreshVisible);
 function lock(){epoch++;loadId++;token='';kind='';requestId=null;selectedDay=null;busy=false;sent=false;form.reset();if(dialog.open)dialog.close();close.disabled=false;content.hidden=true;grid.replaceChildren();status.textContent='';note.textContent='';types.querySelectorAll('button').forEach(n=>n.setAttribute('aria-pressed','false'));}
 return{lock,open};
}
