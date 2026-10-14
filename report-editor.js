import {initializeClientNotes} from './client-notes.js?v=final-notes-pdf';
import {readReportTab} from './report-tabs.js?v=instructor-app';
import {initializeTeacherDocuments,DOCUMENT_TEMPLATES} from './teacher-documents.js?v=instructor-app';
import {initializeClientSheet,clientSheetConnected,loadClientsFromSheet} from './client-sheet.js?v=level-history';
const status=document.querySelector('#report-tab-status'),back=document.querySelector('#report-tab-return');
const payload=readReportTab(window);
if(!payload){status.textContent='Open a client’s report from Authorize in the teacher dashboard.';back.hidden=false;}
else{
 window.opener=null;
 const title=payload.type==='notes'?'Notes':DOCUMENT_TEMPLATES[payload.type].title;document.title=title+' — '+payload.client.name+' — Speak Boldly';document.querySelector('#report-tab-client').textContent=payload.client.name+' · '+payload.client.email;
 let active=true,client=payload.client;
 const returnUrl=payload.appMode?'./instructor.html#students-portal/teacher':null;if(returnUrl){back.href=returnUrl;back.textContent='Dashboard';back.hidden=false;document.documentElement.classList.add('instructor-report');}
 const endpoint=document.querySelector('#client-sheet-connect').elements.endpoint;endpoint.defaultValue=payload.endpointDefault;
 initializeClientSheet(document)?.restore();
 const documents=payload.type==='notes'?initializeClientNotes(document,()=>active,{pageMode:true,...(returnUrl?{returnUrl}:{})}):initializeTeacherDocuments(document,()=>active,()=>[client],undefined,{pageMode:true,...(returnUrl?{returnUrl}:{})});
 try{
  if(clientSheetConnected()){
   const clients=await loadClientsFromSheet(),current=clients.find(item=>item.id===client.id);if(!current)throw new Error('This client is no longer in the connected sheet. Return to the dashboard and refresh students.');client=current;
   document.querySelector('#report-tab-client').textContent=client.name+' · '+client.email;
  }
  if(payload.type==='notes')documents.open(client);else await documents.openForClient(payload.type,client);status.hidden=true;
 }catch(error){status.textContent=error.message;back.hidden=false;}
 window.addEventListener('pagehide',()=>{active=false;documents.lock();});
}
