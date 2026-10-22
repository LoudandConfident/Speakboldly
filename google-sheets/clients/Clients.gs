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
function sbDeleteClientRecord(data){
 const id=String(data.clientId||'');if(!/^[a-zA-Z0-9-]{1,100}$/.test(id))throw new Error('Choose a valid client.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')),sheet=book.getSheetByName('Clients');
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,14).getValues():[],index=rows.findIndex(row=>String(row[0])===id);
  if(index>=0){let archive=book.getSheetByName('DeletedClients');if(!archive){archive=book.insertSheet('DeletedClients');archive.appendRow(['Deleted at (UTC)','Client ID','Client record JSON']);}const saved=archive.getLastRow()>1?archive.getRange(2,1,archive.getLastRow()-1,3).getValues():[];if(!saved.some(row=>String(row[1])===id))archive.appendRow([new Date().toISOString(),id,JSON.stringify(rows[index])]);}
  const sessions=book.getSheetByName('Sessions');if(sessions&&sessions.getLastRow()>1){const booked=sessions.getRange(2,1,sessions.getLastRow()-1,2).getValues();for(let i=booked.length-1;i>=0;i--)if(String(booked[i][1])===id)sessions.deleteRow(i+2);}
  if(index>=0)sheet.deleteRow(index+2);
  return {ok:true,deleted:true,clientId:id};
 }finally{lock.releaseLock();}
}
// Run once to remove the three clients specifically requested by the instructor.
function removeRequestedClients(){
 const sheet=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
 const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,2).getValues():[];
 const targets=['mira nasser','mira louis','martina'].map(name=>{const matches=rows.filter(row=>normalizedClientName(String(row[1]).replace(/^'/,''))===name);if(matches.length>1)throw new Error('More than one client named '+name+'. Select the correct client in the portal.');return matches[0];}).filter(Boolean);
 for(const row of targets)sbDeleteClientRecord({clientId:String(row[0])});
 console.log('Requested client records removed: '+targets.length+'. Backups are in DeletedClients.');
}
// Run manually once to remove only Caroline's previous-level history line.
function removeCarolinePreviousLevel(){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{const sheet=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients'),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues():[];
  const matches=rows.map((row,index)=>({row,index})).filter(({row})=>/^caroline(?:\s|$)/i.test(String(row[1]).replace(/^'/,'').trim()));if(matches.length!==1)throw new Error('Caroline could not be identified uniquely. Open her Edit page to select the correct line.');
  const {row,index}=matches[0],history=row[10]?JSON.parse(String(row[10])):[],dimmed=history.filter(entry=>String(entry.id).startsWith('advanced-')||entry.reason==='advanced'||entry.level!==String(row[4]));if(dimmed.length!==1)throw new Error('There is not exactly one previous-level line. Open Caroline’s Edit page to choose the correct line.');
  sheet.getRange(index+2,11).setValue(JSON.stringify(history.filter(entry=>entry.id!==dimmed[0].id)));console.log('Caroline’s previous-level line removed. Refresh Instructor Portal.');
 }finally{lock.releaseLock();}
}
function sbClientEnrollmentChange(previous,input){
 const program=input.program===undefined?String(previous?.[11]||'').replace(/^'/,''):String(input.program||'').trim();if(program.length>150)throw new Error('Check the program.');
 const history=previous?.[10]?JSON.parse(String(previous[10])):[];if(!Array.isArray(history))throw new Error('Check client level history. Existing data was kept.');
 if(input.historyEdit){const edit=input.historyEdit,entry=history.find(item=>item.id===edit.id);if(!entry||typeof edit.level!=='string'||!edit.level||edit.level.length>100||typeof edit.program!=='string'||edit.program.length>150)throw new Error('Check the previous level.');entry.level=edit.level;entry.program=edit.program.trim();}
 if(input.deleteHistoryId){const index=history.findIndex(entry=>entry.id===input.deleteHistoryId);if(index<0)throw new Error('Previous level not found. Refresh clients.');history.splice(index,1);}
 if(input.advanceLevel===true){
  if(!previous||input.historyEdit||input.deleteHistoryId)throw new Error('Choose the current client to move to the next level.');
  if(String(previous[4])===String(input.level)){const last=history[history.length-1];if(!last||last.reason!=='advanced'||last.level!==input.advanceFromLevel)throw new Error('Choose a different level to move this client.');}
  else{if(input.advanceFromLevel!==String(previous[4]))throw new Error('This client’s level changed on another device. Refresh clients first.');history.push({id:'advanced-'+Utilities.getUuid(),level:String(previous[4]),program:String(previous[11]||'').replace(/^'/,''),closedAt:new Date().toISOString(),reason:'advanced'});}
 }
 if(history.length>500)throw new Error('Ask your instructor to archive older level history.');return {program,enrollmentHistory:history};
}
function handleClientSync(e){
 const lock=LockService.getScriptLock();
 try{
  if(!e?.postData?.contents||e.postData.contents.length>8000000)throw new Error('Invalid request.');
  const p=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties();
  if(p.action==='boldlyNotes'){if(e.postData.contents.length>4000)throw Error('Request too large.');return clientSyncResponse(sbNotesPublic(p));}
  if(p.action==='dailyMotivationSettings')return clientSyncResponse({ok:true,settings:sbPublishedMotivationSettings(typeof sbDailyMotivationSettings==='function'?sbDailyMotivationSettings():{frozen:false,revision:'0'},p.date)});
  if(p.action==='nativeEnglishPage'){if(e.postData.contents.length>4000)throw new Error('Request too large.');return sbNativeEnglishRead(p);}
  if(p.action==='studentInstructorContact'){if(e.postData.contents.length>16000)throw new Error('Request too large.');if(typeof handleStudentInstructorContact!=='function')throw new Error('Add StudentContact.gs and deploy a New version.');return handleStudentInstructorContact(p);}
  if(typeof SB_PUBLIC_BOOKING_ACTIONS!=='undefined'&&SB_PUBLIC_BOOKING_ACTIONS.includes(p.action)){if(e.postData.contents.length>20000)throw new Error('Request too large.');return handlePublicBooking(p);}
  if(typeof SB_STUDENT_EXAM_ACTIONS!=='undefined'&&SB_STUDENT_EXAM_ACTIONS.includes(p.action)){if(e.postData.contents.length>65000)throw new Error('Request too large.');return handleStudentExam(p);}
  const key=props.getProperty('CLIENT_SYNC_KEY');
  if(!key||typeof p.key!=='string'||p.key!==key)throw new Error('Not authorized.');
  if(!['sendClientEmail','uploadLibraryFile','saveMotivationMessage','saveBoldlyNote'].includes(p.action)&&e.postData.contents.length>20000)throw new Error('Request too large.');
  if(['exportOwnerBackup','saveOwnerBackup'].includes(p.action))return sbOwnerBackupAction(p,sbExamBook());
  if(['nativeEnglishEdit','saveNativeEnglish'].includes(p.action))return sbNativeEnglishOwner(p);
  if(typeof SB_OWNER_BOOKING_ACTIONS!=='undefined'&&SB_OWNER_BOOKING_ACTIONS.includes(p.action))return handleOwnerBooking(p);
  if(typeof SB_INSTRUCTOR_EXAM_ACTIONS!=='undefined'&&SB_INSTRUCTOR_EXAM_ACTIONS.includes(p.action))return handleInstructorExam(p);
  if(['personalCalendarSettings','resetPersonalCalendarLink'].includes(p.action)){if(typeof sbPersonalCalendarSettings!=='function')throw new Error('Add PersonalCalendar.gs for calendar subscriptions.');return clientSyncResponse(sbPersonalCalendarSettings(p));}
  if(p.action==='sendClientEmail'){if(typeof handleClientEmail!=='function')throw new Error('Add EmailActions.gs and authorizeClientEmails, then deploy a New version to enable email sending.');return handleClientEmail(p);}
  if(['listLibrary','uploadLibraryFile','readLibraryFile','sendLibraryFile'].includes(p.action)){if(typeof handleLibraryAction!=='function')throw new Error('Add LibraryActions.gs to enable library sharing.');return handleLibraryAction(p);}
  if(['listBoldlyNotes','saveBoldlyNote'].includes(p.action)){if(e.postData.contents.length>65000)throw Error('Request too large.');return clientSyncResponse(sbNotesOwner(p));}
  if(['listMotivationMessages','saveMotivationMessage'].includes(p.action))return clientSyncResponse(sbMotivationMessagesOwner(p));
  if(p.action==='setClientActive')return clientSyncResponse(sbSetClientActive(p,SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID'))));
  if(p.action==='deleteClient')return clientSyncResponse(sbDeleteClientRecord(p));
  if(p.action==='checkConnection')return clientSyncResponse({ok:true,connected:true});
  if(['listTeacherDocuments','saveTeacherDocument'].includes(p.action)){if(typeof handleSheetDocumentAction!=='function')throw new Error('Add TeacherDocuments.gs to enable shared reports.');return handleSheetDocumentAction(p);}
  if(['listSessions','saveSession','saveSessionSeries','cancelSession'].includes(p.action)){if(typeof handleSheetSessionAction!=='function')throw new Error('Add Sessions.gs and run setupSheetReminders first.');return handleSheetSessionAction(p);}
  if(p.action==='listClients'){
   lock.waitLock(20000);if(typeof sbApplySessionHours==='function')sbApplySessionHours(SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')));
   const sheet=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
   if(!sheet)throw new Error('Clients tab not found. Run setupClientSync first.');
   const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues():[];
   const clients=rows.filter(row=>String(row[0]).trim()).map(row=>{
    let permissions=[];if(row[9]){permissions=JSON.parse(String(row[9]));if(!Array.isArray(permissions))throw new Error('Invalid Permissions column.');}
    return {id:String(row[0]),name:String(row[1]),email:String(row[2]),code:String(row[3]).padStart(4,'0'),level:String(row[4]),payment:String(row[5]),amountPaid:Number(row[6]||0),hours:Number(row[7]||0),active:row[14]!==false&&String(row[14]).toLowerCase()!=='false',permissions,...(row[11]?{program:String(row[11]).replace(/^'/,'')}:{}),...(row[10]?{enrollmentHistory:JSON.parse(String(row[10]))}:{})};
   });
   return clientSyncResponse({ok:true,clients});
  }
  if(p.action!=='upsertClient'||!p.client)throw new Error('Invalid action.');
  const c=p.client,name=String(c.name||'').trim(),email=String(c.email||'').trim().toLowerCase(),code=String(c.code||'').trim(),id=String(c.id||'');
  if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!name||name.length>100||!/^\d{4}$/.test(code)||code==='1962'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Check client details.');
  let hours=Number(c.hours);const amount=Number(c.amountPaid??0);
  if(!Number.isFinite(hours)||hours<0||hours>100000||!Number.isFinite(amount)||amount<0||amount>100000000)throw new Error('Invalid hours or amount.');
  if(!['Unpaid','Part paid','Paid'].includes(c.payment)||!String(c.level||'')||String(c.level).length>100)throw new Error('Invalid program or payment status.');
  lock.waitLock(20000);if(typeof sbApplySessionHours==='function')sbApplySessionHours(SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')));
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
  if(typeof sbSetClientHours==='function')hours=sbSetClientHours(SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')),sheet,rowNumber,c);
  const previous=rowNumber<=sheet.getLastRow()?sheet.getRange(rowNumber,1,1,12).getValues()[0]:null;
  const {program,enrollmentHistory}=sbClientEnrollmentChange(previous,c);
  sheet.getRange(1,11,1,2).setValues([['Level history','Program']]);
  const values=[id,name,email,code,String(c.level),c.payment,amount,hours,new Date().toISOString(),JSON.stringify(permissions),JSON.stringify(enrollmentHistory),program].map(v=>typeof v==='string'?safeSheetText(v):v);
  sheet.getRange(rowNumber,4).setNumberFormat('@');sheet.getRange(rowNumber,1,1,12).setValues([values]);
  return clientSyncResponse({ok:true,clientId:id,program,enrollmentHistory,hours});
 }catch(error){return clientSyncResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}

// In existing Code.gs, rename only function doPost(event) to handleReviewPost(event).
// Leave doGet and all other review code untouched. This router keeps both features separate.
function doPost(e) {
 let data;
 try {data = JSON.parse(e.postData.contents);} catch {return clientSyncResponse({ok:false,error:'Invalid request.'});}
 if(data.action==='nativeEnglishPage')return handleClientSync(e);
 if (['nativeEnglishEdit','saveNativeEnglish','deleteClient','upsertClient','checkConnection','listClients','listSessions','saveSession','saveSessionSeries','cancelSession','listTeacherDocuments','saveTeacherDocument','sendClientEmail','listLibrary','uploadLibraryFile','readLibraryFile','sendLibraryFile'].includes(data.action)) return handleClientSync(e);
 return handleReviewPost(e);
}

function doGet(event){if(event?.parameter?.calendarFeed&&typeof sbPersonalCalendarFeed==='function')return sbPersonalCalendarFeed(event.parameter.calendarFeed);return clientSyncResponse({ok:true,service:'Speak Boldly Clients'});}

function sbSetClientActive(data,book){
 if(typeof data.active!=='boolean'||typeof data.clientId!=='string')throw new Error('Invalid client status.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);const sheet=book.getSheetByName('Clients'),rows=sheet&&sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,1).getValues():[],index=rows.findIndex(r=>String(r[0])===data.clientId);
 if(index<0)throw new Error('Client not found. Refresh Clients first.');
 sheet.getRange(1,15).setValue('Active');sheet.getRange(index+2,15).setValue(data.active);return {ok:true,clientId:data.clientId,active:data.active};
}
