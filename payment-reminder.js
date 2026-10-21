import {clientSheetConnected,sendSheetClientEmail} from './client-sheet.js?v=level-history';
import {confirmClientEmail} from './client-email-confirmation.js?v=registration-approval';
export function paymentRequestId(win){
 if(typeof win.crypto?.randomUUID==='function')return win.crypto.randomUUID();
 if(typeof win.crypto?.getRandomValues!=='function')throw Error('This browser cannot prepare the reminder. Update your browser and try again.');
 const bytes=win.crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const hex=[...bytes].map(n=>n.toString(16).padStart(2,'0')).join('');return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}
export const PAYMENT_REMINDER_MESSAGE='Kindly complete the payment for your course before your new round begins. Thank you for your continued trust in Speak Boldly—we look forward to supporting your progress. Please email your payment screenshot, name and program to speakboldly16@gmail.com.';
export function createPaymentReminder(doc,getClient,isUnlocked,{connected=clientSheetConnected,send=sendSheetClientEmail,confirm=confirmClientEmail}={}){
 const wrap=doc.createElement('div'),button=doc.createElement('button'),note=doc.createElement('p');wrap.className='client-payment-reminder';button.type='button';button.className='button light small';button.textContent='Payment reminder for new round';note.setAttribute('role','status');note.className='client-payment-reminder-status';note.hidden=true;wrap.append(button,note);let requestId=null;
 button.onclick=async()=>{
  if(button.disabled)return;note.hidden=false;if(!isUnlocked()){note.textContent='Sign in to your instructor dashboard to send this reminder.';note.scrollIntoView?.({block:'nearest'});return;}const client=getClient();if(!client){note.textContent='Refresh Clients and try again; this client is no longer in the list.';return;}
  if(!connected()){note.textContent='Connect your Clients sheet first.';note.scrollIntoView?.({block:'nearest'});return;}
  button.disabled=true;button.setAttribute('aria-busy','true');note.textContent='Opening payment reminder…';
  try{
   const approved=await confirm(doc,'Send a new-round payment reminder to '+client.name+' ('+client.email+')?',{title:'Payment reminder for new round',details:{Message:PAYMENT_REMINDER_MESSAGE}});
   if(!approved||!isUnlocked()){note.hidden=true;return;}
   requestId ||= paymentRequestId(doc.defaultView);note.textContent='Sending payment reminder…';
   const result=await send(client.id,'paymentReminder',{requestId});
   if(isUnlocked()){note.textContent='Payment reminder emailed to '+result.recipient+'.';requestId=null;}
  }catch(error){if(isUnlocked())note.textContent=/Invalid email request|Invalid action|does not support email/.test(error.message)?'Update UnifiedCode.gs and deploy a New version to enable payment reminders. No reminder was sent.':error.message;}
  finally{button.disabled=false;button.setAttribute('aria-busy','false');}
 };
 return wrap;
}
