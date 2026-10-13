// Open your private Google Sheet > Extensions > Apps Script.
// Paste this into a NEW project, save, and run setupClientSync once.
const CLIENT_HEADERS = ['Client ID','Name','Email','Student Code','Level / Program','Payment status','Amount paid','Hours taught','Updated at (UTC)'];
function setupClientSync() {
 const ss=SpreadsheetApp.getActiveSpreadsheet();
 if(!ss)throw new Error('Open Apps Script from your Google Sheet.');
 const props=PropertiesService.getScriptProperties();
 props.setProperty('CLIENT_SHEET_ID',ss.getId());
 if(!props.getProperty('CLIENT_SYNC_KEY'))props.setProperty('CLIENT_SYNC_KEY',Utilities.getUuid()+Utilities.getUuid());
 const sheet=ss.getSheetByName('Clients')||ss.insertSheet('Clients');
 if(sheet.getLastRow()===0)sheet.appendRow(CLIENT_HEADERS);
 else if(JSON.stringify(sheet.getRange(1,1,1,CLIENT_HEADERS.length).getValues()[0])!==JSON.stringify(CLIENT_HEADERS))throw new Error('Rename the existing Clients tab; its headers differ. No data was replaced.');
 sheet.setFrozenRows(1);sheet.getRange('A1:I1').setFontWeight('bold');sheet.getRange('D2:D').setNumberFormat('@');sheet.getRange(1,10).setValue('Permissions');sheet.autoResizeColumns(1,10);
 SpreadsheetApp.getUi().alert('Clients sheet ready','Keep your connection key private. Find it under Apps Script > Project Settings > Script Properties > CLIENT_SYNC_KEY. Do not send it in chat. After deploying, share only the web app URL with your website maintainer.',SpreadsheetApp.getUi().ButtonSet.OK);
}
function clientSyncResponse(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function normalizedClientName(value){return String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();}
function safeSheetText(value){const s=String(value??'');return /^[=+\-@]/.test(s)?"'"+s:s;}
function sbClientEnrollmentChange(previous,input){
 const program=input.program===undefined?String(previous?.[11]||'').replace(/^'/,''):String(input.program||'').trim();if(program.length>150)throw new Error('Check the program.');
 const history=previous?.[10]?JSON.parse(String(previous[10])):[];if(!Array.isArray(history))throw new Error('Check client level history. Existing data was kept.');
 if(input.historyEdit){const edit=input.historyEdit,entry=history.find(item=>item.id===edit.id);if(!entry||typeof edit.level!=='string'||!edit.level||edit.level.length>100||typeof edit.program!=='string'||edit.program.length>150)throw new Error('Check the previous level.');entry.level=edit.level;entry.program=edit.program.trim();}
 if(previous&&(String(previous[4])!==String(input.level)||String(previous[11]||'').replace(/^'/,'')!==program))history.push({id:Utilities.getUuid(),level:String(previous[4]),program:String(previous[11]||'').replace(/^'/,''),closedAt:new Date().toISOString()});
 if(history.length>500)throw new Error('Ask your instructor to archive older level history.');return {program,enrollmentHistory:history};
}
function handleClientSync(e){
 const lock=LockService.getScriptLock();
 try{
  if(!e?.postData?.contents||e.postData.contents.length>8000000)throw new Error('Invalid request.');
  const p=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties();
  if(typeof SB_PUBLIC_BOOKING_ACTIONS!=='undefined'&&SB_PUBLIC_BOOKING_ACTIONS.includes(p.action)){if(e.postData.contents.length>20000)throw new Error('Request too large.');return handlePublicBooking(p);}
  if(typeof SB_STUDENT_EXAM_ACTIONS!=='undefined'&&SB_STUDENT_EXAM_ACTIONS.includes(p.action)){if(e.postData.contents.length>65000)throw new Error('Request too large.');return handleStudentExam(p);}
  const key=props.getProperty('CLIENT_SYNC_KEY');
  if(!key||typeof p.key!=='string'||p.key!==key)throw new Error('Not authorized.');
  if(!['sendClientEmail','uploadLibraryFile'].includes(p.action)&&e.postData.contents.length>20000)throw new Error('Request too large.');
  if(typeof SB_OWNER_BOOKING_ACTIONS!=='undefined'&&SB_OWNER_BOOKING_ACTIONS.includes(p.action))return handleOwnerBooking(p);
  if(typeof SB_INSTRUCTOR_EXAM_ACTIONS!=='undefined'&&SB_INSTRUCTOR_EXAM_ACTIONS.includes(p.action))return handleInstructorExam(p);
  if(p.action==='sendClientEmail'){if(typeof handleClientEmail!=='function')throw new Error('Add EmailActions.gs and authorizeClientEmails, then deploy a New version to enable email sending.');return handleClientEmail(p);}
  if(['listLibrary','uploadLibraryFile','readLibraryFile','sendLibraryFile'].includes(p.action)){if(typeof handleLibraryAction!=='function')throw new Error('Add LibraryActions.gs to enable library sharing.');return handleLibraryAction(p);}
  if(p.action==='checkConnection')return clientSyncResponse({ok:true,connected:true});
  if(['listTeacherDocuments','saveTeacherDocument'].includes(p.action)){if(typeof handleSheetDocumentAction!=='function')throw new Error('Add TeacherDocuments.gs to enable shared reports.');return handleSheetDocumentAction(p);}
  if(['listSessions','saveSession','cancelSession'].includes(p.action)){if(typeof handleSheetSessionAction!=='function')throw new Error('Add Sessions.gs and run setupSheetReminders first.');return handleSheetSessionAction(p);}
  if(p.action==='listClients'){
   lock.waitLock(20000);
   const sheet=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
   if(!sheet)throw new Error('Clients tab not found. Run setupClientSync first.');
   const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues():[];
   const clients=rows.filter(row=>String(row[0]).trim()).map(row=>{
    let permissions=[];if(row[9]){permissions=JSON.parse(String(row[9]));if(!Array.isArray(permissions))throw new Error('Invalid Permissions column.');}
    return {id:String(row[0]),name:String(row[1]),email:String(row[2]),code:String(row[3]).padStart(4,'0'),level:String(row[4]),payment:String(row[5]),amountPaid:Number(row[6]||0),hours:Number(row[7]||0),permissions,...(row[11]?{program:String(row[11]).replace(/^'/,'')}:{}),...(row[10]?{enrollmentHistory:JSON.parse(String(row[10]))}:{})};
   });
   return clientSyncResponse({ok:true,clients});
  }
  if(p.action!=='upsertClient'||!p.client)throw new Error('Invalid action.');
  const c=p.client,name=String(c.name||'').trim(),email=String(c.email||'').trim().toLowerCase(),code=String(c.code||'').trim(),id=String(c.id||'');
  if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!name||name.length>100||!/^\d{4}$/.test(code)||code==='1962'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Check client details.');
  const hours=Number(c.hours),amount=Number(c.amountPaid??0);
  if(!Number.isFinite(hours)||hours<0||hours>100000||!Number.isFinite(amount)||amount<0||amount>100000000)throw new Error('Invalid hours or amount.');
  if(!['Unpaid','Part paid','Paid'].includes(c.payment)||!String(c.level||'')||String(c.level).length>100)throw new Error('Invalid program or payment status.');
  lock.waitLock(20000);
  const sheet=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,9).getValues():[];
  let rowNumber=sheet.getLastRow()+1;
  rows.forEach((row,i)=>{
   if(String(row[0])===id){rowNumber=i+2;return;}
   if(String(row[3]).padStart(4,'0')===code)throw new Error('Student Code is already assigned.');
   if(normalizedClientName(row[1])===normalizedClientName(name))throw new Error('Client name is already registered.');
   if(String(row[2]).toLowerCase()===email)throw new Error('Email already belongs to another client.');
  });
  let permissions=c.permissions;
  if(permissions!==undefined&&(!Array.isArray(permissions)||permissions.length>500||permissions.some(p=>typeof p!=='string'||p.length>2000||! /^(section:|file:)/.test(p))))throw new Error('Invalid file permissions.');
  if(permissions===undefined){const previous=rowNumber<=sheet.getLastRow()?sheet.getRange(rowNumber,10).getValue():'';permissions=previous?JSON.parse(String(previous)):[];}
  sheet.getRange(1,10).setValue('Permissions');
  const previous=rowNumber<=sheet.getLastRow()?sheet.getRange(rowNumber,1,1,12).getValues()[0]:null;
  const {program,enrollmentHistory}=sbClientEnrollmentChange(previous,c);
  sheet.getRange(1,11,1,2).setValues([['Level history','Program']]);
  const values=[id,name,email,code,String(c.level),c.payment,amount,hours,new Date().toISOString(),JSON.stringify(permissions),JSON.stringify(enrollmentHistory),program].map(v=>typeof v==='string'?safeSheetText(v):v);
  sheet.getRange(rowNumber,4).setNumberFormat('@');sheet.getRange(rowNumber,1,1,12).setValues([values]);
  return clientSyncResponse({ok:true,clientId:id,program,enrollmentHistory});
 }catch(error){return clientSyncResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}

// In existing Code.gs, rename only function doPost(event) to handleReviewPost(event).
// Leave doGet and all other review code untouched. This router keeps both features separate.
function doPost(e) {
 let data;
 try {data = JSON.parse(e.postData.contents);} catch {return clientSyncResponse({ok:false,error:'Invalid request.'});}
 if (['upsertClient','checkConnection','listClients','listSessions','saveSession','cancelSession','listTeacherDocuments','saveTeacherDocument','sendClientEmail','listLibrary','uploadLibraryFile','readLibraryFile','sendLibraryFile'].includes(data.action)) return handleClientSync(e);
 return handleReviewPost(e);
}
