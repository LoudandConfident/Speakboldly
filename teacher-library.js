import {confirmClientEmail} from './client-email-confirmation.js';
import {clientSheetConnected as defaultConnected,sheetLibraryRequest as defaultRequest} from './client-sheet.js?v=level-history';
import {PORTAL_SECTIONS} from './portal-access.js?v=four-digit-restored';
import {renderPdf} from './portal-document.js?v=pdf-lifecycle';
export function initializeTeacherLibrary(doc,isUnlocked,getClients,loader,options={}){
 const clientSheetConnected=options.connected||defaultConnected,sheetLibraryRequest=options.request||defaultRequest,sections=options.sections||PORTAL_SECTIONS;
 const root=doc.querySelector('#teacher-full-library');if(!root)return{refresh(){},lock(){}};
 const list=root.querySelector('.teacher-library-folders');let epoch=0,loading=false;const urls=new Set();
 const send=doc.createElement('dialog');send.className='action-popup';send.setAttribute('aria-label','Send library file to client');send.innerHTML='<button type="button" class="popup-close" aria-label="Close file sending">×</button><h2>Send to client</h2><p class="library-send-title"></p><form><label>Client<select name="clientId" required></select></label><button class="button small" type="submit">Grant viewer access and send email</button></form><p role="status"></p>';doc.body.append(send);send.querySelector('.popup-close').onclick=()=>send.close();let sending=null;
 function encode(bytes){let s='';for(let i=0;i<bytes.length;i+=32768)s+=String.fromCharCode(...bytes.subarray(i,i+32768));return doc.defaultView.btoa(s);}
 function chooseClient(section,item){sending={section,item,requestId:doc.defaultView.crypto.randomUUID()};send.querySelector('.library-send-title').textContent=item.title;const select=send.querySelector('select');select.replaceChildren();for(const client of getClients()){const option=doc.createElement('option');option.value=client.id;option.textContent=client.name+' · '+client.email;select.append(option);}send.querySelector('[role=status]').textContent='The client will receive viewer access using their registered Google email.';send.showModal();}
 send.querySelector('form').onsubmit=async event=>{event.preventDefault();if(!isUnlocked()||!sending)return;const button=event.currentTarget.querySelector('button'),note=send.querySelector('[role=status]');const client=getClients().find(c=>c.id===event.currentTarget.elements.clientId.value);if(!client){note.textContent='Choose an existing client.';return;}if(!await confirmClientEmail(doc,'Send '+sending.item.title+' to the client '+client.name+' ('+client.email+')?')||!isUnlocked())return;button.disabled=true;note.textContent='Sharing and emailing…';try{const result=await sheetLibraryRequest('sendLibraryFile',{section:sending.section,fileId:sending.item.id,requestId:sending.requestId,clientId:event.currentTarget.elements.clientId.value});note.textContent='Viewer access granted and email sent to '+result.recipient+'.';}catch(error){note.textContent=error.message;}finally{button.disabled=false;}};
 async function preview(section,item,viewer){
  viewer.replaceChildren();viewer.hidden=false;const heading=doc.createElement('h4');heading.textContent=item.title;viewer.append(heading);
  const close=doc.createElement('button');close.className='button light small';close.textContent='Close';close.onclick=()=>{viewer.replaceChildren();viewer.hidden=true;};viewer.append(close);
  const body=doc.createElement('div');viewer.append(body);
  try{
   let url=item.url,mime=item.mimeType;
   if(item.id){const result=await sheetLibraryRequest('readLibraryFile',{section,fileId:item.id});if(!isUnlocked()||!viewer.isConnected)return;const bytes=Uint8Array.from(doc.defaultView.atob(result.base64),c=>c.charCodeAt(0));mime=result.mimeType;url=doc.defaultView.URL.createObjectURL(new Blob([bytes],{type:mime}));urls.add(url);}
   if(mime==='application/pdf'||item.url?.toLowerCase().endsWith('.pdf'))await renderPdf(doc,body,url);
   else if(mime?.startsWith('image/')){const image=doc.createElement('img');image.src=url;image.alt=item.title;image.style.maxWidth='100%';body.append(image);}
   else if(mime?.startsWith('audio/')||mime?.startsWith('video/')){const media=doc.createElement(mime.startsWith('audio/')?'audio':'video');media.controls=true;media.src=url;media.style.maxWidth='100%';body.append(media);}
   else{const link=doc.createElement('a');link.href=item.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent='Open in Google Drive';body.append(link);}
  }catch(error){body.textContent=error.message;}
 }
 async function folderItems(section,container,note,viewer){
  note.textContent='Loading shared files…';container.replaceChildren();
  try{const result=await sheetLibraryRequest('listLibrary',{section});if(!isUnlocked())return;
   const driveLink=doc.createElement('a');driveLink.href=result.folderUrl;driveLink.target='_blank';driveLink.rel='noopener noreferrer';driveLink.className='email-link';driveLink.textContent='Open folder in Drive / upload larger files';container.append(driveLink);
   for(const item of result.items){const row=doc.createElement('div');row.className='teacher-library-file';const read=doc.createElement('button');read.className='button light small';read.textContent=item.title;read.onclick=()=>preview(section,item,viewer);const share=doc.createElement('button');share.className='button light small';share.textContent='Send to client';share.onclick=()=>chooseClient(section,item);row.append(read,share);container.append(row);}note.textContent=result.items.length?'':'No shared files in this folder yet.';
  }catch(error){note.textContent=error.message;}
  try{const publicItems=await loader(section);if(!isUnlocked())return;if(publicItems.length){const heading=doc.createElement('p');heading.textContent='Existing website files';container.append(heading);for(const item of publicItems){const button=doc.createElement('button');button.className='button light small';button.textContent=item.title;button.onclick=()=>preview(section,item,viewer);container.append(button);}}}catch{}
 }
 function renderFolders(){list.replaceChildren();for(const [section,label]of Object.entries(sections)){
  const folder=doc.createElement('details');folder.className='teacher-library-folder';const summary=doc.createElement('summary');summary.textContent=section==='material'?'Materials':label;folder.append(summary);
  const upload=doc.createElement('input');upload.type='file';upload.multiple=true;upload.setAttribute('aria-label','Upload files to '+label);upload.hidden=true;
  const picker=doc.createElement('div');picker.className='teacher-library-picker';const choose=doc.createElement('button');choose.type='button';choose.className='button light small';choose.textContent='Choose files';choose.setAttribute('aria-label','Choose files for '+label);choose.onclick=()=>upload.click();const selection=doc.createElement('span');selection.className='teacher-library-selection';selection.textContent='No files selected';selection.setAttribute('aria-live','polite');upload.onchange=()=>{selection.textContent=upload.files.length?[...upload.files].map(file=>file.name).join(', '):'No files selected';};picker.append(choose,selection);
  const button=doc.createElement('button');button.type='button';button.className='button light small';button.textContent='Upload files';
  const refresh=doc.createElement('button');refresh.type='button';refresh.className='button light small';refresh.textContent='Refresh';
  const controls=doc.createElement('div');controls.className='teacher-library-controls';controls.append(upload,picker,button,refresh);folder.append(controls);
  const items=doc.createElement('div'),note=doc.createElement('p'),viewer=doc.createElement('div');note.setAttribute('role','status');viewer.className='portal-document-viewer';viewer.hidden=true;folder.append(items,note,viewer);
  const load=()=>folderItems(section,items,note,viewer);folder.addEventListener('toggle',()=>{if(folder.open&&isUnlocked())load();});refresh.onclick=load;
  button.onclick=async()=>{if(!isUnlocked()||!upload.files.length)return;if(!clientSheetConnected()){note.textContent='Connect your Clients sheet first.';return;}button.disabled=true;try{for(const file of upload.files){if(file.size>5000000)throw new Error('Use Open folder in Drive for files above 5 MB.');note.textContent='Uploading '+file.name+'…';await sheetLibraryRequest('uploadLibraryFile',{section,name:file.name,mimeType:file.type,base64:encode(new Uint8Array(await file.arrayBuffer()))});}upload.value='';selection.textContent='No files selected';await load();}catch(error){note.textContent=error.message;}finally{button.disabled=false;}};
  list.append(folder);
 }}
 renderFolders();
 async function refresh(){if(!isUnlocked()||loading)return;loading=true;try{for(const folder of list.querySelectorAll('details'))if(folder.open&&!folder.querySelector('.portal-document-viewer:not([hidden])')){folder.open=false;folder.open=true;}}finally{loading=false;}}
 return{refresh,lock(){epoch++;sending=null;if(send.open)send.close();for(const url of urls)doc.defaultView.URL.revokeObjectURL(url);urls.clear();renderFolders();}};
}
