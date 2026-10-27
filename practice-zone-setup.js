import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=domain-email-routing';
import {learningDocumentLevel} from './learning-document-cards.js?v=library-folders';
export async function preparePracticeZone(request,valid=()=>true){
 const settings=await request('hubAccessOwnerSettings');if(!valid())return false;const entry=settings.entries?.find(e=>e.key==='exercises:1');if(!entry)throw new Error('Practice Zone access settings are unavailable.');
 if(!entry.enabled){await request('saveHubAccessSetting',{revision:settings.revision,group:'exercises:1',enabled:true,password:entry.password});if(!valid())return false;}
 const catalog=await request('listPortalAccess');if(!valid())return false;for(const item of catalog.items||[]){if(item.section!=='exercises'||learningDocumentLevel(item)!==1||item.enabled)continue;await request('savePortalAccess',{item:{...item,enabled:true}});if(!valid())return false;}return true;
}
export function initializePracticeZoneSetup(doc,isUnlocked){let busy=false,done=false,generation=0;const note=doc.createElement('p');note.id='practice-zone-setup-status';note.setAttribute('role','status');note.hidden=true;doc.querySelector('#admin-dashboard')?.prepend(note);
 async function ensure(){if(busy||done||!isUnlocked()||!clientSheetConnected())return;const ticket=generation;busy=true;note.hidden=false;note.textContent='Preparing password-protected Practice Zone…';try{const ready=await preparePracticeZone(sheetLibraryRequest,()=>ticket===generation&&isUnlocked());if(!ready)return;done=true;note.hidden=true;doc.dispatchEvent(new doc.defaultView.Event('portal-files-uploaded'));}catch(error){if(ticket===generation){note.textContent='Practice Zone could not finish updating: '+error.message+' ';const retry=doc.createElement('button');retry.type='button';retry.className='button light small';retry.textContent='Retry Practice Zone setup';retry.onclick=()=>ensure();note.append(retry);}}finally{if(ticket===generation)busy=false;}}
 doc.addEventListener('client-sheet-configured',ensure);return {ensure,lock(){generation++;done=false;busy=false;note.hidden=true;note.replaceChildren();}};
}
