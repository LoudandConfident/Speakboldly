import {clientSheetConnected,sendSheetClientEmail} from './client-sheet.js?v=level-history';
import {confirmClientEmail} from './client-email-confirmation.js?v=registration-approval';
export function createPaymentReminder(doc,getClient,isUnlocked,{connected=clientSheetConnected,send=sendSheetClientEmail,confirm=confirmClientEmail}={}){
 const wrap=doc.createElement('div'),button=doc.createElement('button'),note=doc.createElement('p');wrap.className='client-payment-reminder';button.type='button';button.className='button light small';button.textContent='Payment reminder for new round';note.setAttribute('role','status');note.className='client-payment-reminder-status';note.hidden=true;wrap.append(button,note);let requestId=null;
 button.onclick=async()=>{
  if(!isUnlocked()||button.disabled)return;const client=getClient();if(!client)return;note.hidden=false;
  if(!connected()){note.textContent='Connect your Clients sheet first.';return;}
  button.disabled=true;
  try{
   const approved=await confirm(doc,'Send a new-round payment reminder to '+client.name+' ('+client.email+')?',{title:'Payment reminder for new round',details:{Message:'Please complete payment for your next round and email your payment screenshot, name and program to speakboldly16@gmail.com.'}});
   if(!approved||!isUnlocked()){note.hidden=true;return;}
   requestId ||= doc.defaultView.crypto.randomUUID();note.textContent='Sending payment reminder…';
   const result=await send(client.id,'paymentReminder',{requestId});
   if(isUnlocked()){note.textContent='Payment reminder emailed to '+result.recipient+'.';requestId=null;}
  }catch(error){if(isUnlocked())note.textContent=/Invalid email request|Invalid action|does not support email/.test(error.message)?'Update UnifiedCode.gs and deploy a New version to enable payment reminders. No reminder was sent.':error.message;}
  finally{button.disabled=false;}
 };
 return wrap;
}
