import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=domain-email-routing';
export function initializeInstructorBackups(doc,isUnlocked){
 const host=doc.querySelector('#admin-overview');if(!host)return;
 const section=doc.createElement('details');section.className='admin-detail instructor-backups';section.id='instructor-backups';
 const title=doc.createElement('summary');title.textContent='Backups';const text=doc.createElement('p');text.textContent='Keep a copy of clients, appointments, exam answers, reports and material links. Uploaded files stay in their original storage.';
 const status=doc.createElement('p');status.setAttribute('role','status');const controls=doc.createElement('div');controls.className='backup-controls';
 let epoch=0;
 for(const [label,action]of [['Save private backup to Drive','saveOwnerBackup'],['Download backup','exportOwnerBackup']]){
  const button=doc.createElement('button');button.type='button';button.className='button light small';button.textContent=label;
  button.onclick=async()=>{if(!isUnlocked())return;if(!clientSheetConnected()){status.textContent='Connect your Clients sheet first.';return;}const current=epoch;controls.querySelectorAll('button').forEach(b=>b.disabled=true);status.textContent='Preparing backup…';
   try{const result=await sheetLibraryRequest(action);if(current!==epoch||!isUnlocked())return;if(action==='exportOwnerBackup'){
    if(result.backup?.format!=='speak-boldly-owner-backup')throw new Error('Update the Apps Script, then deploy a New version.');
    const url=doc.defaultView.URL.createObjectURL(new doc.defaultView.Blob([JSON.stringify(result.backup,null,2)],{type:'application/json'}));const link=doc.createElement('a');link.href=url;link.download='Speak-Boldly-backup-'+result.backup.createdAt.slice(0,10)+'.json';doc.body.append(link);link.click();link.remove();doc.defaultView.setTimeout(()=>doc.defaultView.URL.revokeObjectURL(url),60000);status.textContent='Backup downloaded. Keep this private; it contains client records.';
   }else{status.textContent='Private backup saved to your Drive.';doc.dispatchEvent(new doc.defaultView.Event('instructor-data-changed'));}
   }catch(error){if(current===epoch&&isUnlocked())status.textContent=error.message;}finally{if(current===epoch)controls.querySelectorAll('button').forEach(b=>b.disabled=false);}
  };controls.append(button);
 }
 section.append(title,text,controls,status);host.append(section);
 return{lock(){epoch++;status.textContent='';section.open=false;controls.querySelectorAll('button').forEach(b=>b.disabled=false);}};
}
