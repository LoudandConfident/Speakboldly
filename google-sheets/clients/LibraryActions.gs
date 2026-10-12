const SB_LIBRARY_SECTIONS={material:'Materials',exams:'Exams',exercises:'Exercises',reports:'Progress reports',final:'Final reports',listening:'Listening tracks'};
function setupFullLibrary(){
 const props=PropertiesService.getScriptProperties();if(!props.getProperty('CLIENT_SHEET_ID'))throw new Error('Connect the Clients sheet first.');
 let root=props.getProperty('SB_LIBRARY_FOLDER_ID');if(!root){const folder=DriveApp.createFolder('Speak Boldly — Full library');folder.setSharing(DriveApp.Access.PRIVATE,DriveApp.Permission.NONE);root=folder.getId();props.setProperty('SB_LIBRARY_FOLDER_ID',root);}
 const folder=DriveApp.getFolderById(root);
 for(const [section,label]of Object.entries(SB_LIBRARY_SECTIONS)){const key='SB_LIBRARY_'+section;if(!props.getProperty(key)){const child=folder.createFolder(label);props.setProperty(key,child.getId());}}
}
function sbLibraryFolder(section){
 if(!SB_LIBRARY_SECTIONS[section])throw new Error('Unknown library folder.');
 const id=PropertiesService.getScriptProperties().getProperty('SB_LIBRARY_'+section);if(!id)throw new Error('Run setupFullLibrary in Apps Script once.');
 return DriveApp.getFolderById(id);
}
function sbLibraryItem(file){return{id:file.getId(),title:file.getName(),mimeType:file.getMimeType(),url:file.getUrl(),size:file.getSize()};}
function handleLibraryAction(p){
 const respond=typeof response==='function'?response:clientSyncResponse;
 const folder=sbLibraryFolder(String(p.section||''));
 if(p.action==='listLibrary'){const files=folder.getFiles(),items=[];while(files.hasNext())items.push(sbLibraryItem(files.next()));return respond({ok:true,items,folderUrl:folder.getUrl()});}
 if(p.action==='uploadLibraryFile'){
  if(typeof p.base64!=='string'||p.base64.length>7500000||! /^[A-Za-z0-9+/]*={0,2}$/.test(p.base64)||!p.name||String(p.name).length>250)throw new Error('Check file name and size. Files must be below 5 MB.');
  const bytes=Utilities.base64Decode(p.base64);if(bytes.length>5000000)throw new Error('For larger books, upload directly to this folder in Google Drive, then Refresh.');
  const file=folder.createFile(Utilities.newBlob(bytes,String(p.mimeType||'application/octet-stream'),String(p.name)));file.setSharing(DriveApp.Access.PRIVATE,DriveApp.Permission.NONE);return respond({ok:true,item:sbLibraryItem(file)});
 }
 const file=DriveApp.getFileById(String(p.fileId||'')),parents=file.getParents();let found=false;while(parents.hasNext())if(parents.next().getId()===folder.getId())found=true;if(!found)throw new Error('File not found in this library folder.');
 if(p.action==='readLibraryFile'){const blob=file.getBlob();if(blob.getBytes().length>7000000)throw new Error('This book is too large for inline reading. Open it in Google Drive.');return respond({ok:true,base64:Utilities.base64Encode(blob.getBytes()),mimeType:blob.getContentType()});}
 if(p.action==='sendLibraryFile'){
  const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')),sheet=book.getSheetByName('Clients'),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues():[],client=rows.find(r=>String(r[0])===String(p.clientId));
  if(!client||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(client[2])))throw new Error('Client email missing or invalid.');
  const requestId=String(p.requestId||'');if(!/^[a-zA-Z0-9-]{1,100}$/.test(requestId))throw new Error('Missing send identity.');
  const lock=LockService.getScriptLock();lock.waitLock(20000);
  try{
   let log=book.getSheetByName('LibrarySendLog');if(!log){log=book.insertSheet('LibrarySendLog');log.appendRow(['Request ID','Client ID','File ID','Status','Sent at (UTC)','Error']);}
   const logs=log.getLastRow()>1?log.getRange(2,1,log.getLastRow()-1,6).getValues():[],old=logs.find(r=>String(r[0])===requestId);
   if(old){
    if(String(old[1])!==String(p.clientId)||String(old[2])!==file.getId())throw new Error('Send identity mismatch.');
    if(old[3]==='sent')return respond({ok:true,recipient:String(client[2]),url:file.getUrl()});
    throw new Error('Delivery is uncertain. Check LibrarySendLog before trying again.');
   }
   if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
   const row=log.getLastRow()+1;log.getRange(row,1,1,6).setValues([[requestId,String(p.clientId),file.getId(),'sending','','']]);SpreadsheetApp.flush();
   try{
    file.addViewer(String(client[2]));
    MailApp.sendEmail({to:String(client[2]),subject:'Your learning material — Speak Boldly',body:'Hello '+client[1]+',\n\nYour teacher has shared '+file.getName()+' with you.\n\nView it here:\n'+file.getUrl()+'\n\nOpen the link while signed in to Google using '+client[2]+'. You have viewer access.\n\nSpeak Boldly',name:'Speak Boldly',replyTo:'speakboldly16@gmail.com'});
    log.getRange(row,4,1,3).setValues([['sent',new Date().toISOString(),'']]);return respond({ok:true,recipient:String(client[2]),url:file.getUrl()});
   }catch(error){log.getRange(row,4).setValue('delivery_unknown');log.getRange(row,6).setValue(String(error.message||error));throw new Error('Sharing or delivery could not be confirmed. Check LibrarySendLog before sending again.');}
  }finally{lock.releaseLock();}
 }
 throw new Error('Unknown library action.');
}
