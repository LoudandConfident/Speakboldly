// Shared report field data; PDF templates remain on the website.
function sbTeacherDocumentsSheet(){
 const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID'));
 let sheet=book.getSheetByName('TeacherDocuments');
 if(!sheet){sheet=book.insertSheet('TeacherDocuments');sheet.appendRow(['Record ID','Version','Updated at (UTC)','JSON']);sheet.setFrozenRows(1);}
 return sheet;
}
function handleSheetDocumentAction(p){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sheet=sbTeacherDocumentsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues():[];
  if(p.action==='saveTeacherDocument'){
   const record=p.record,id=String(record?.id||'');
   if(!/^(draft:(progress|final|registration)|document:[a-zA-Z0-9-]{1,100})$/.test(id))throw new Error('Invalid document identity.');
   if(!record||!['progress','final','registration'].includes(record.type)||!record.values||typeof record.values!=='object'||Array.isArray(record.values))throw new Error('Invalid report fields.');
   if(Object.keys(record.values).length>1000||Object.values(record.values).some(v=>typeof v!=='string'||v.length>15000))throw new Error('Invalid report values.');
   const encoded=JSON.stringify(record);if(encoded.length>18000)throw new Error('Report is too large to sync.');
   const index=rows.findIndex(r=>String(r[0])===id),version=index<0?0:Number(rows[index][1]);
   if(Number(p.expectedVersion)!==version)throw new Error('This report changed on another device. Reopen the report and review the latest version before saving.');
   sheet.getRange(index<0?sheet.getLastRow()+1:index+2,1,1,4).setValues([[id,version+1,new Date().toISOString(),encoded]]);
  }
  const latest=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,4).getValues():[];
  const respond=typeof clientSyncResponse==='function'?clientSyncResponse:response;
  return respond({ok:true,records:latest.filter(r=>r[0]).map(r=>({id:String(r[0]),version:Number(r[1]),updatedAt:String(r[2]),record:JSON.parse(String(r[3]))}))});
 }finally{lock.releaseLock();}
}
