import {sheetLibraryRequest} from './client-sheet.js?v=domain-email-routing';
import {confirmClientEmail} from './client-email-confirmation.js?v=registration-approval';
export function createTaskReminder(doc,getClient,isUnlocked){
 const button=doc.createElement('button');button.type='button';button.className='button light small client-action-button task-reminder-action';
 button.innerHTML='<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 29h17l-3-5v-8a6 6 0 0 0-12 0v8ZM17 33q3 4 6 0M20 7V4M9 9 6 6M31 9l3-3M6 19H3M34 19h3"/><path d="m16 20 3 3 6-7"/></svg><span><strong>Send task reminder</strong></span>';
 const label=button.querySelector('strong'),setLabel=text=>{label.textContent=text;button.setAttribute('aria-label',text);};setLabel('Send task reminder');let pending=null;
 button.onclick=async()=>{if(!isUnlocked()||button.disabled)return;const client=getClient();if(!client)return;button.disabled=true;try{
  const preview=pending?.preview||await sheetLibraryRequest('geTaskReminderPreview',{clientId:client.id});if(!isUnlocked())return;
  const approved=await confirmClientEmail(doc,'Send a practice nudge to '+client.name+'?',{details:{To:preview.recipient,Message:preview.message}});if(!approved||!isUnlocked())return;
  pending ||= {preview,requestId:doc.defaultView.crypto.randomUUID()};setLabel('Sending…');
  const result=await sheetLibraryRequest('geTaskReminder',{clientId:client.id,expectedIndex:pending.preview.index,requestId:pending.requestId});if(result.status!=='sent')throw Error('Delivery was not confirmed.');pending=null;
  if(isUnlocked()){setLabel('Sent ✓');doc.defaultView.setTimeout(()=>setLabel('Send task reminder'),3500);}
 }catch(error){if(isUnlocked()){setLabel('Retry task reminder');doc.defaultView.alert(error.message||'Reminder could not be sent.');}}finally{if(label.textContent==='Sending…')setLabel('Send task reminder');button.disabled=false;}};
 return button;
}
