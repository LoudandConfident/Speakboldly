import {SESSION_PROGRAMS} from './session-programs.js?v=library-folders';
import {sheetLibraryRequest} from './client-sheet.js?v=level-history';
import {confirmClientEmail} from './client-email-confirmation.js?v=registration-approval';
export function renderBookingRequestCards(doc,root,requests,isUnlocked,clients=[]){
 const el=(tag,value)=>{const n=doc.createElement(tag);n.textContent=value;return n;};
 if(!requests.length)return;
 root.append(el('h3','Booking requests'));
 const params=new URL(doc.defaultView.location.href).searchParams,target=params.get('bookingRequest'),intent=params.get('decision');
 for(const item of requests){
  const client=clients.find(c=>c.email.toLowerCase()===item.email.toLowerCase()),card=el('article','');card.className='booking-request-card';card.dataset.bookingRequest=item.id;
  card.append(el('h4',item.name+' · '+({placement:'Placement test',trial:'Trial session',session:'Session',workshop:'Workshop'}[item.kind]||item.kind)),el('p',item.date+' · '+item.time+' · '+item.duration+' minutes · Cairo'),el('p',item.program));
  const contact=el('a',item.email);contact.href='mailto:'+item.email;card.append(contact,el('p','Payment reported: '+({yes:'Yes',no:'No','not-required':'Not required'}[item.paid]||item.paid)+'. Check the screenshot before marking payment as Paid.'));
  const form=el('form','');form.className='booking-request-review';
  const levelLabel=el('label','Level for this appointment'),level=el('select','');level.name='level';for(const value of ['Not assessed',...Array.from({length:8},(_,i)=>String(i+1)),'A1','A2','B1','B2','C1','C2'])level.append(new doc.defaultView.Option(/^\d+$/.test(value)?'Level '+value:value,value));level.value=client?.level||'Not assessed';if(!level.value)level.value='Not assessed';levelLabel.append(level);
  let chosenProgram=null;if(['Session','Workshop'].includes(item.program)&&['session','workshop'].includes(item.kind)){const label=el('label','Registered program'),select=el('select','');select.name='program';select.required=true;select.append(new doc.defaultView.Option('Choose the registered program',''));for(const course of SESSION_PROGRAMS.filter(p=>p.title!=='Trial session'&&(item.kind!=='workshop'||/workshop/i.test(p.title))&&(item.duration===60?p.title==='English Momentum':p.title!=='English Momentum')))select.append(new doc.defaultView.Option(course.title,course.title));select.value=client?.program||'';label.append(select);form.append(label);chosenProgram=select;}
  const paymentLabel=el('label','Verified payment status'),payment=el('select','');payment.name='payment';for(const value of ['Unpaid','Part paid','Paid'])payment.append(new doc.defaultView.Option(value,value));payment.value=client?.payment||'Unpaid';paymentLabel.append(payment);
  const actions=el('div','');actions.className='detail-actions';const accept=el('button',item.status==='accepting'?'Finish accepting':'Accept'),decline=el('button','Decline');accept.type='submit';decline.type='button';accept.className='button small';decline.className='button light small';decline.disabled=item.status==='accepting';actions.append(accept,decline);const note=el('p','');note.setAttribute('role','status');form.append(levelLabel,paymentLabel,actions,note);card.append(form);root.append(card);
  let busy=false;
  async function decide(decision){
   if(busy||!isUnlocked())return;busy=true;accept.disabled=decline.disabled=true;
   try{
    if(!await confirmClientEmail(doc,(decision==='accept'?'Accept':'Decline')+' this booking request from '+item.name+'?',{title:decision==='accept'?'Accept booking request':'Decline booking request',details:{Appointment:({placement:'Placement test',trial:'Trial session',session:'Session',workshop:'Workshop'}[item.kind]),Program:item.program,Date:item.date,Time:item.time+' · '+item.duration+' minutes · Cairo',Email:item.email}})||!isUnlocked())return;
    note.textContent=decision==='accept'?'Saving appointment to your calendar…':'Declining request…';
    const result=await sheetLibraryRequest('reviewRegistration',{requestId:item.id,decision,level:level.value,payment:payment.value,...(chosenProgram?{program:chosenProgram.value}:{}),...(client?{clientId:client.id}:{})});
    if(!isUnlocked())return;card.replaceChildren(el('p',result.request.status==='accepted'?'Accepted and saved to your calendar. Send the client confirmation from Actions when ready.':'Request declined. The calendar was not changed.'));
    doc.dispatchEvent(new doc.defaultView.Event('instructor-booking-reviewed'));doc.dispatchEvent(new doc.defaultView.Event('instructor-data-changed'));
   }catch(error){if(isUnlocked())note.textContent=error.message;}finally{busy=false;accept.disabled=false;decline.disabled=item.status==='accepting';}
  }
  form.onsubmit=event=>{event.preventDefault();decide('accept');};decline.onclick=()=>decide('decline');
  if(item.notificationStatus==='failed'){const retry=el('button','Retry notification email');retry.type='button';retry.className='button light small';retry.onclick=async()=>{if(!isUnlocked()||retry.disabled)return;retry.disabled=true;try{await sheetLibraryRequest('retryRegistrationNotification',{requestId:item.id});note.textContent='Notification email sent.';}catch(error){note.textContent=error.message;retry.disabled=false;}};card.append(retry);}
  if(item.notificationStatus==='delivery_unknown')card.append(el('p','Notification delivery is uncertain. Review the request here; check your inbox before sending another notification.'));
  if(item.id===target){card.classList.add('booking-request-highlight');doc.defaultView.setTimeout(()=>{if(!card.isConnected||!isUnlocked())return;card.scrollIntoView({block:'center'});(intent==='decline'?decline:accept).focus({preventScroll:true});},0);}
 }
}
