import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=domain-email-routing';
export function initializePersonalCalendar(doc){
 const root=doc.querySelector('#admin-calendar');if(!root)return;
 const controls=doc.createElement('div');controls.className='personal-calendar-connect';
 const open=doc.createElement('button');open.type='button';open.className='button light small';open.textContent='Sync personal calendar';
 const content=doc.createElement('div');content.hidden=true;
 const text=doc.createElement('p');text.textContent='Subscribe to your booked sessions. Your calendar refreshes changes on its own schedule. Keep the subscription link private.';
 const apple=doc.createElement('a');apple.className='button light small';apple.textContent='Add to Apple Calendar';
 const copy=doc.createElement('button');copy.type='button';copy.className='button light small';copy.textContent='Copy calendar link';
 const status=doc.createElement('p');status.setAttribute('role','status');content.append(text,apple,copy,status);controls.append(open,content);root.append(controls);let url='';
 open.onclick=async()=>{if(!content.hidden){content.hidden=true;return;}content.hidden=false;apple.hidden=copy.hidden=true;status.textContent='Connecting your calendar…';if(!clientSheetConnected()){status.textContent='Connect your Google Sheet first.';return;}open.disabled=true;try{const result=await sheetLibraryRequest('personalCalendarSettings');const endpoint=doc.querySelector('#client-sheet-connect').elements.endpoint.value;const feed=new URL(endpoint);feed.searchParams.set('calendarFeed',result.token);url=feed.href;apple.href=url.replace(/^https:/,'webcal:');apple.hidden=copy.hidden=false;status.textContent='';}catch(error){status.textContent=/Invalid action/i.test(error.message)?'Deploy the updated Apps Script to activate personal calendar sync.':error.message;}finally{open.disabled=false;}};
 copy.onclick=async()=>{try{await doc.defaultView.navigator.clipboard.writeText(url);status.textContent='Calendar link copied. For Google Calendar, use Other calendars → From URL.';}catch{status.textContent='Copying is unavailable in this browser. Open this page in Safari and try again.';}};
 doc.addEventListener('portal-sign-out',()=>{url='';apple.removeAttribute('href');content.hidden=true;});
}
