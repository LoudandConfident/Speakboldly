const CLIENT_HEADERS = [
  'Client ID',
  'Name',
  'Email',
  'Student Code',
  'Level / Program',
  'Payment status',
  'Amount paid',
  'Hours taught',
  'Updated at'
];

function setupClientSync() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  if (!book) {
    throw new Error('Open Apps Script from your Google Sheet.');
  }

  const properties = PropertiesService.getScriptProperties();
  properties.setProperty('CLIENT_SHEET_ID', book.getId());

  if (!properties.getProperty('CLIENT_SYNC_KEY')) {
    properties.setProperty(
      'CLIENT_SYNC_KEY',
      Utilities.getUuid() + Utilities.getUuid()
    );
  }

  const sheet =
    book.getSheetByName('Clients') || book.insertSheet('Clients');

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(CLIENT_HEADERS);
  } else {
    const headers = sheet.getRange(1, 1, 1, 9).getValues()[0];
    if (JSON.stringify(headers) !== JSON.stringify(CLIENT_HEADERS)) {
      throw new Error('Clients tab must be empty before first setup.');
    }
  }

  book.setSpreadsheetTimeZone('Africa/Cairo');
  sheet.setFrozenRows(1);
  sheet.getRange('A1:I1').setFontWeight('bold');
  sheet.getRange('D2:D').setNumberFormat('@');
  sheet.autoResizeColumns(1, 9);
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

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

function doGet(event) {
  if(event?.parameter?.calendarFeed)return sbPersonalCalendarFeed(event.parameter.calendarFeed);
  const properties = PropertiesService.getScriptProperties();
  return response({
    ok: true,
    service: 'Speak Boldly Clients',
    configured: Boolean(
      properties.getProperty('CLIENT_SHEET_ID') &&
      properties.getProperty('CLIENT_SYNC_KEY')
    )
  });
}

function doPost(event) {
  const lock = LockService.getScriptLock();
  try {
    const request = sbParseWebRequest(event);
    const data = request.data;
    if (data.action === 'studentInstructorContact') {
      if (request.size > 16000) throw new Error('Request too large.');
      return handleStudentInstructorContact(data);
    }
    if (SB_PUBLIC_BOOKING_ACTIONS.includes(data.action)) {
      if (request.size > 20000) throw new Error('Request too large.');
      return handlePublicBooking(data);
    }
    if (SB_STUDENT_EXAM_ACTIONS.includes(data.action)) {
      if (request.size > 65000) throw new Error('Request too large.');
      return handleStudentExam(data);
    }
    const connection = sbRequireClientConnection(data);
    if (!['sendClientEmail', 'uploadLibraryFile'].includes(data.action) && request.size > 20000) {
      throw new Error('Request too large.');
    }
    return sbRouteInstructorRequest(data, connection, lock);
  } catch (error) {
    return response({ ok: false, error: String(error.message || error) });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

function sbParseWebRequest(event) {
  if (!event || !event.postData || typeof event.postData.contents !== 'string') {
    throw new Error('Invalid request.');
  }
  const contents = event.postData.contents;
  if (contents.length > 8000000) throw new Error('Invalid request.');
  const data = JSON.parse(contents);
  if (!data || typeof data !== 'object' || Array.isArray(data) || typeof data.action !== 'string') {
    throw new Error('Invalid action.');
  }
  return { data: data, size: contents.length };
}

function sbRequireClientConnection(data) {
  const properties = PropertiesService.getScriptProperties();
  const key = properties.getProperty('CLIENT_SYNC_KEY');
  if (!key || data.key !== key) throw new Error('Incorrect connection key.');
  const sheetId = properties.getProperty('CLIENT_SHEET_ID');
  if (!sheetId) throw new Error('Run setupClientSync first.');
  const book = SpreadsheetApp.openById(sheetId);
  const sheet = book.getSheetByName('Clients');
  if (!sheet) throw new Error('Clients tab is missing.');
  return { book: book, sheet: sheet, sheetId: sheetId };
}

function sbRouteInstructorRequest(data, connection, lock) {
  if (SB_OWNER_BOOKING_ACTIONS.includes(data.action)) return handleOwnerBooking(data);
  if (SB_INSTRUCTOR_EXAM_ACTIONS.includes(data.action)) return handleInstructorExam(data);
  if (['personalCalendarSettings', 'resetPersonalCalendarLink'].includes(data.action)) {
    return response(sbPersonalCalendarSettings(data));
  }
  if (data.action === 'sendClientEmail') return handleClientEmail(data);
  if (['listLibrary', 'uploadLibraryFile', 'readLibraryFile', 'sendLibraryFile'].includes(data.action)) {
    return handleLibraryAction(data);
  }
  if (data.action === 'deleteClient') return response(sbDeleteClientRecord(data));
  if (data.action === 'checkConnection') return response({ ok: true, connected: true });
  if (['listTeacherDocuments', 'saveTeacherDocument'].includes(data.action)) {
    return handleSheetDocumentAction(data);
  }
  if (['listSessions', 'saveSession', 'saveSessionSeries', 'cancelSession'].includes(data.action)) {
    return handleSheetSessionAction(data);
  }
  if (data.action === 'listClients') {
    return sbListConnectedClients(connection.sheetId, connection.sheet, lock);
  }
  if (data.action === 'upsertClient' && data.client) {
    return sbUpsertConnectedClient(data, connection.sheetId, connection.sheet, lock);
  }
  throw new Error('Invalid action.');
}

function sbListConnectedClients(sheetId, sheet, lock) {
  lock.waitLock(20000);
  sbApplySessionHours(SpreadsheetApp.openById(sheetId));
  const rows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 12).getValues()
    : [];
  const clients = rows.filter(row => row[0] && row[1] && row[2]).map(row => ({
    id: String(row[0]), name: String(row[1]).trim(),
    email: String(row[2]).trim().toLowerCase(),
    code: String(row[3]).padStart(4, '0'), level: String(row[4]),
    payment: String(row[5]), amountPaid: Number(row[6] || 0),
    hours: Number(row[7] || 0),
    permissions: row[9] ? JSON.parse(String(row[9])) : [],...(row[11]?{program:String(row[11]).replace(/^'/,'')}:{}),...(row[10]?{enrollmentHistory:JSON.parse(String(row[10]))}:{})
  }));
  return response({ ok: true, clients });
}

function sbUpsertConnectedClient(data, sheetId, sheet, lock) {
  const client = data.client;
  if(client.permissions!==undefined&&(!Array.isArray(client.permissions)||client.permissions.length>500||client.permissions.some(p=>typeof p!=='string'||p.length>2000||!/^(section:|file:)/.test(p))))throw new Error('Invalid client access selections.');
  const text = value => String(value == null ? '' : value).trim();

  const id = text(client.id);
  const name = text(client.name);
  const email = text(client.email).toLowerCase();
  const code = text(client.code);
  const level = text(client.level);
  const payment = text(client.payment);
  const amount = Number(client.amountPaid || 0);
  let hours = Number(client.hours);

  if (!/^[A-Za-z0-9-]{1,100}$/.test(id)) {
    throw new Error('Invalid student ID.');
  }
  if (!name || name.length > 100) {
    throw new Error('Check the student name.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254) {
    throw new Error('Check the student email.');
  }
  if (!/^\d{4}$/.test(code) || code === '1962') {
    throw new Error('Choose a valid four-digit student code.');
  }
  if (!level || level.length > 100) {
    throw new Error('Check the level or program.');
  }
  if (!['Unpaid', 'Part paid', 'Paid'].includes(payment)) {
    throw new Error('Check the payment status.');
  }
  if (!Number.isFinite(amount) || amount < 0 ||
      amount > 100000000 ||
      !Number.isFinite(hours) || hours < 0 ||
      hours > 100000) {
    throw new Error('Check the amount paid and hours.');
  }

  lock.waitLock(20000);sbApplySessionHours(SpreadsheetApp.openById(sheetId));

  const rows = sheet.getLastRow() > 1
    ? sheet.getRange(2, 1, sheet.getLastRow() - 1, 9).getValues()
    : [];

  const normalize = value =>
    text(value).normalize('NFKC').replace(/\s+/g, ' ').toLowerCase();

  let targetRow = sheet.getLastRow() + 1;

  rows.forEach((row, index) => {
    if (String(row[0]) === id) {
      targetRow = index + 2;
      return;
    }

    if (String(row[3]).padStart(4, '0') === code) {
      throw new Error('Student code is already assigned.');
    }
    if (normalize(row[1]) === normalize(name)) {
      throw new Error('Student name is already registered.');
    }
    if (text(row[2]).toLowerCase() === email) {
      throw new Error('Email already belongs to another student.');
    }
  });

  const safe = value =>
    /^[=+\-@\t\r]/.test(value) ? "'" + value : value;

  hours=sbSetClientHours(SpreadsheetApp.openById(sheetId),sheet,targetRow,client);
  const previous=targetRow<=sheet.getLastRow()?sheet.getRange(targetRow,1,1,12).getValues()[0]:null;
  const {program,enrollmentHistory}=sbClientEnrollmentChange(previous,client);
  sheet.getRange(targetRow, 4).setNumberFormat('@');
  sheet.getRange(targetRow, 1, 1, 9).setValues([[
    id,
    safe(name),
    safe(email),
    code,
    safe(level),
    payment,
    amount,
    hours,
    new Date().toISOString()
  ]]);

  if(client.permissions!==undefined){sheet.getRange(1,10).setValue('Permissions');sheet.getRange(targetRow,10).setValue(JSON.stringify(client.permissions));}
  sheet.getRange(1,11,1,2).setValues([['Level history','Program']]);sheet.getRange(targetRow,11,1,2).setValues([[JSON.stringify(enrollmentHistory),safe(program)]]);
  return response({ ok: true, clientId: id,program,enrollmentHistory,hours });

}

function verifySpeakBoldlyInstall() {
  const checks = {
    requests: typeof doPost === 'function',
    clients: typeof sbUpsertConnectedClient === 'function',
    calendar: typeof handleSheetSessionAction === 'function',
    emails: typeof handleClientEmail === 'function',
    examinations: typeof handleStudentExam === 'function',
    levelAccess: typeof sbLearningLevelAccess === 'function',
    bookings: typeof handlePublicBooking === 'function',
    registrationApproval: typeof sbSubmitRegistration === 'function' && typeof handleRegistrationOwner === 'function',
    dayAvailability: typeof sbSaveCalendarDay === 'function',
    personalCalendar: typeof sbPersonalCalendarFeed === 'function'
  };
  const missing = Object.keys(checks).filter(name => !checks[name]);
  if (missing.length) throw new Error('The copied script is incomplete: ' + missing.join(', '));
  console.log('Complete Speak Boldly script verified. Save and deploy a New version using the existing deployment URL.');
  return checks;
}

// Add this file to the existing Clients Apps Script project.
// Run setupSheetReminders once to create the calendar; emails are sent only from Authorize.
const SB_SESSION_HEADERS=['Session ID','Client ID','Session number','Date (Cairo)','Time (Cairo)','Starts at (UTC)','Remind at (UTC)','Status','Sent at (UTC)','Last error','Program','Level'];
const SB_SESSION_PROGRAMS=["Assessment", "Trial session", "General English — 8 sessions", "General English — 4 sessions", "One Session", "Make-up / revision session", "English Momentum", "Interview preparation workshop", "E-mail and business writing workshop", "Meetings, presentation and public speaking workshop", "IELTS preparation", "Pronunciation workshop", "English for Information Technology", "Let the kids speak!", "The different learners", "Instructor training"];
function setupSheetReminders(){
 const props=PropertiesService.getScriptProperties(),id=props.getProperty('CLIENT_SHEET_ID');
 if(!id)throw new Error('Run setupClientSync first.');
 const sheet=SpreadsheetApp.openById(id).getSheetByName('Sessions')||SpreadsheetApp.openById(id).insertSheet('Sessions');
 if(!sheet.getLastRow())sheet.appendRow(SB_SESSION_HEADERS);
 else if(JSON.stringify(sheet.getRange(1,1,1,10).getValues()[0])!==JSON.stringify(SB_SESSION_HEADERS.slice(0,10)))throw new Error('Sessions headers differ. Existing data has not been replaced.');
 sheet.getRange(1,11,1,2).setValues([['Program','Level']]);
 sheet.setFrozenRows(1);sheet.getRange('A1:J1').setFontWeight('bold');
 // Authorization is requested here before any clients are emailed.
 MailApp.getRemainingDailyQuota();
 ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sendDueSheetReminders').forEach(t=>ScriptApp.deleteTrigger(t));
 props.setProperty('SB_REMINDERS_ENABLED','false');
}
function sbSessionsSheet(){
 const id=PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID');
 const sheet=SpreadsheetApp.openById(id).getSheetByName('Sessions');
 if(!sheet)throw new Error('Add Sessions.gs and run setupSheetReminders first.');
 sheet.getRange(1,11,1,2).setValues([['Program','Level']]);
 return sheet;
}
function sbCairoTimestamp(date,time){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time))throw new Error('Choose a valid date and Cairo time.');
 const utc=Date.parse(date+'T'+time+':00Z'),matches=[];
 for(const offset of [2,3]){
  const value=utc-offset*3600000;
  if(Utilities.formatDate(new Date(value),'Africa/Cairo','yyyy-MM-dd HH:mm')===date+' '+time)matches.push(value);
 }
 if(matches.length!==1)throw new Error('This Cairo time is invalid or ambiguous. Choose another time.');
 return matches[0];
}
function sbSessionId(c){
 const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,[c.clientId,c.number,c.date,c.time,...(c.program?[c.program]:[])].join('|'));
 return bytes.map(b=>(b&255).toString(16).padStart(2,'0')).join('');
}
function sbSessionDuration(row){const explicit=Number(row[13]);return explicit===30||explicit===60||explicit===90?explicit:90;}
function sbListSheetSessions(){
 const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues():[];
 return rows.filter(r=>r[0]).map(r=>({id:String(r[0]),clientId:String(r[1]),number:Number(r[2]),date:String(r[3]),time:String(r[4]),name:'',program:String(r[10]||'').replace(/^'/,''),level:String(r[11]||'').replace(/^'/,''),startsAt:String(r[5]),duration:sbSessionDuration(r),course:String(r[14]||'').replace(/^'/,''),endsAt:new Date(Date.parse(r[5])+sbSessionDuration(r)*60000).toISOString(),reminderStatus:String(r[7]),reminderAt:new Date(r[6]).toISOString(),sentAt:r[8]?new Date(r[8]).toISOString():null}));
}
function sbSaveSheetSession(input,allowPast=false){
 const c={clientId:String(input.clientId||''),number:Number(input.number),date:String(input.date||''),time:String(input.time||''),program:String(input.program||'').trim(),course:String(input.course||'').trim(),level:String(input.level||'').trim()};
 const duration=c.program==='Assessment'?30:['English Momentum','Trial session'].includes(c.program)?60:90;
 if(c.course&&(!SB_SESSION_PROGRAMS.includes(c.course)||['Assessment','Trial session'].includes(c.course)))throw new Error('Choose a valid registered course.');
 if(c.program&&!SB_SESSION_PROGRAMS.includes(c.program))throw new Error('Choose a valid program.');
 if(c.level&&!/^[1-9]\d{0,3}$/.test(c.level)&&!['Not assessed','A1','A2','B1','B2','C1','C2'].includes(c.level))throw new Error('Choose a valid session level.');
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(c.clientId)||!Number.isInteger(c.number)||c.number<1||c.number>9999)throw new Error('Choose an existing client and valid session number.');
 const starts=sbCairoTimestamp(c.date,c.time),id=sbSessionId(c),sheet=sbSessionsSheet();
 const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues():[];
 const existing=rows.find(r=>String(r[0])===id);
 if(existing)return id; // Retries never create duplicate reminders or restore cancelled classes.
 if(starts>Date.now()&&typeof sbCalendarDateBlocked==='function'&&sbCalendarDateBlocked(c.date))throw new Error('This day is dimmed. Undim the date before adding a new appointment.');
 if(starts<=Date.now()&&!allowPast)throw new Error('Choose a future session.');
 if(starts>Date.now()&&rows.some(row=>String(row[7])!=='cancelled'&&starts<Date.parse(row[5])+sbSessionDuration(row)*60000&&starts+duration*60000>Date.parse(row[5])))throw new Error('This time overlaps an existing appointment.');
 const clients=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
 const ids=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,1).getValues():[];
 if(!ids.some(r=>String(r[0])===c.clientId))throw new Error('Save this client to the Clients sheet first.');
 const row=sheet.getLastRow()+1;sheet.getRange(row,4,1,2).setNumberFormat('@');
 sheet.getRange(1,14,1,2).setValues([['Duration (minutes)','Registered course']]);
 sheet.getRange(row,1,1,15).setValues([[id,c.clientId,c.number,c.date,c.time,new Date(starts).toISOString(),new Date(starts-86400000).toISOString(),starts<=Date.now()?'expired':'pending','','',c.program,c.level,'',duration,c.course]]);
 return id;
}
function handleSheetSessionAction(p){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(p.action==='saveSessionSeries')sbSaveSessionSeries(p);
  if(p.action==='saveSession'){if(!p.session)throw new Error('Session missing.');sbSaveSheetSession(p.session,p.importPast===true);}
  if(p.action==='cancelSession'){
   const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues():[],index=rows.findIndex(r=>String(r[0])===String(p.sessionId));
   if(index<0)throw new Error('Session not found.');
   if(rows[index][7]==='sending')throw new Error('A reminder is being sent. Try again shortly.');
   sheet.getRange(index+2,8).setValue('cancelled');
  }
  sbApplySessionHours(SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')));
  const props=PropertiesService.getScriptProperties();
  const ready=typeof handleClientEmail==='function';
  const respond=typeof clientSyncResponse==='function'?clientSyncResponse:response;
  return respond({ok:true,classes:sbListSheetSessions(),blockedDates:typeof sbCalendarAvailability==='function'?sbCalendarAvailability(sbExamBook()):[],calendarAvailabilityReady:typeof sbCalendarAvailability==='function',emailReady:ready});
 }finally{lock.releaseLock();}
}
// Kept as a no-op so old scheduled triggers cannot send emails after this update.
function sendDueSheetReminders(){return;}
function disableAutomaticReminders(){
 PropertiesService.getScriptProperties().setProperty('SB_REMINDERS_ENABLED','false');
 ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sendDueSheetReminders').forEach(t=>ScriptApp.deleteTrigger(t));
}


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


// Run once to grant email permission. This does not send an email.
function authorizeClientEmails(){MailApp.getRemainingDailyQuota();}
// Run resetPermissions once, then retryPermissions in the Apps Script editor.
function resetPermissions(){ScriptApp.invalidateAuth();}
function retryPermissions(){
 const id=PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID');
 if(!id)throw new Error('CLIENT_SHEET_ID is missing. Keep your existing script properties.');
 SpreadsheetApp.openById(id).getName();
 MailApp.getRemainingDailyQuota();
 console.log('Spreadsheet and email access confirmed. Deploy a New version with Execute as: Me.');
}

const SB_EMAIL_LOGO='https://loudandconfident.github.io/Speakboldly/speak-boldly-preview-dark-green.png';
const SB_ZOOM_URL=PropertiesService.getScriptProperties().getProperty('SB_ZOOM_URL')||'';
const SB_ZOOM_PASSCODE=PropertiesService.getScriptProperties().getProperty('SB_ZOOM_PASSCODE')||'';
function sbEmailEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function sbBrandedEmail(title,content){
 return '<!doctype html><html><body style="margin:0;background:#faf9f4;font-family:Arial,sans-serif;color:#193c32"><table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fffef9;border-collapse:collapse"><tr><td style="padding:28px 28px 12px"><img src="'+SB_EMAIL_LOGO+'" width="58" height="58" alt="Speak Boldly logo" style="display:block;border-radius:10px"><h1 style="font-size:24px;margin:18px 0">'+sbEmailEscape(title)+'</h1></td></tr><tr><td style="padding:0 28px 28px;font-size:15px;line-height:1.7">'+content+'<p style="margin-top:28px">Speak Boldly</p></td></tr></table></body></html>';
}
function sbUpcomingClientMeetings(book,clientId){
 const sheet=book.getSheetByName('Sessions');if(!sheet||sheet.getLastRow()<2)return [];
 return sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues().filter(r=>String(r[1])===String(clientId)&&String(r[7])!=='cancelled'&&Number.isFinite(Date.parse(r[5]))&&Date.parse(r[5])>Date.now()).sort((a,b)=>Date.parse(a[5])-Date.parse(b[5]));
}
function sbEmailProgramName(value){return value==='Trial session'?'Conversation-based General English — Trial session':String(value||'').replace(/^General English/,'Conversation-based General English');}
function sbSessionEmailLabel(row){const program=String(row[10]||'').replace(/^'/,'');if(program==='Trial session')return 'Conversation-based General English — Trial session';if(program==='Assessment')return 'English assessment';return (program?sbEmailProgramName(program.replace(/^General English — [48] sessions$/,'General English')):'English class')+' — Session '+row[2];}
function sbSessionEmailDetails(row){const program=String(row[10]||'').replace(/^'/,''),level=String(row[11]||'').replace(/^'/,'');return [String(sbSessionDuration(row))+' minutes',row[14]?sbEmailProgramName(String(row[14]).replace(/^'/,'')):'',program&&program!=='Trial session'?sbEmailProgramName(program):'',level&&level!=='Not assessed'?'Level '+level:''].filter(Boolean).join(' · ');}
function sbCalendarEmail(client,meetings,reminder=false){
 if(!/^https:\/\//.test(SB_ZOOM_URL)||!SB_ZOOM_PASSCODE)throw new Error('Set SB_ZOOM_URL and SB_ZOOM_PASSCODE in Apps Script project settings before sending confirmations.');
 const heading=reminder?'Your upcoming class reminder':'Your class confirmation',name=String(client[1]),first=meetings[0]||[],course=first[14]||(!['Assessment','Trial session'].includes(String(first[10]))?first[10]:'')||client[11]||'',program=sbEmailProgramName(course);
 const lines=meetings.map(r=>sbSessionEmailLabel(r)+(sbSessionEmailDetails(r)?' ('+sbSessionEmailDetails(r)+')':'')+' — '+Utilities.formatDate(new Date(r[5]),'Africa/Cairo','EEEE, d MMMM yyyy — h:mm a')+' (Cairo time)');
 const intro=reminder?'This is a reminder for your upcoming English class.':'Your next upcoming English session is confirmed below.';
 const body='Hello '+name+',\n\n'+intro+(program?'\n\nProgram / Level: '+program:'')+'\n\n'+lines.join('\n')+'\n\nJoin on Zoom:\n'+SB_ZOOM_URL+'\nPasscode: '+SB_ZOOM_PASSCODE+'\n\nPlease note: No same-day cancellations are allowed.\n\nIf you have any questions, reply to this email.\n\nSee you in class!\nSpeak Boldly';
 const rows=meetings.map(r=>'<tr><td style="padding:10px;border-bottom:1px solid #dedfd5;vertical-align:top">'+sbEmailEscape(sbSessionEmailLabel(r))+(sbSessionEmailDetails(r)?'<br>'+sbEmailEscape(sbSessionEmailDetails(r)):'')+'</td><td style="padding:10px;border-bottom:1px solid #dedfd5">'+sbEmailEscape(Utilities.formatDate(new Date(r[5]),'Africa/Cairo','EEEE, d MMMM yyyy'))+'<br><strong>'+sbEmailEscape(Utilities.formatDate(new Date(r[5]),'Africa/Cairo','h:mm a'))+'</strong> · Cairo time</td></tr>').join('');
 const content='<p>Hello '+sbEmailEscape(name)+',</p><p>'+intro+'</p>'+(program?'<p><strong>Program / Level:</strong> '+sbEmailEscape(program)+'</p>':'')+'<table style="width:100%;border-collapse:collapse;background:#edf0e6;font-size:14px">'+rows+'</table>'+'<p><a href="'+SB_ZOOM_URL+'" style="display:inline-block;padding:10px 16px;background:#193c32;color:#fffef9;text-decoration:none;border-radius:6px">Join on Zoom</a><br><strong>Zoom passcode:</strong> '+SB_ZOOM_PASSCODE+'</p><p><strong>No same-day cancellations are allowed.</strong></p><p>If you have any questions, reply to this email.</p><p>See you in class!</p>';
 return {body,htmlBody:sbBrandedEmail(heading,content)};
}

// Owner-authorized individual emails. Recipients come from Clients, never from browser input.
function handleClientEmail(p){
 const respond=typeof response==='function'?response:clientSyncResponse;
 const id=String(p.clientId||''),kind=String(p.kind||''),requestId=String(p.requestId||'');
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!['confirmation','progress','final','registration','notes'].includes(kind)||! /^[a-zA-Z0-9-]{1,100}$/.test(requestId))throw new Error('Invalid email request.');
 const props=PropertiesService.getScriptProperties(),book=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')),clients=book.getSheetByName('Clients');
 const rows=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,12).getValues():[],client=rows.find(r=>String(r[0])===id);
 if(!client||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(client[2])))throw new Error('Client email missing or invalid.');
 let attachment=null;
 if(kind!=='confirmation'){
  const word=kind==='notes'&&typeof p.pdfBase64!=='string',encoded=word?p.docxBase64:p.pdfBase64;
  if(typeof encoded!=='string'||encoded.length>7500000||! /^[A-Za-z0-9+/]*={0,2}$/.test(encoded))throw new Error(word?'A valid Word attachment is required.':'A valid completed PDF is required.');
  const bytes=Utilities.base64Decode(encoded);
  if(bytes.length>5500000)throw new Error('Attachment is too large.');
  if(word){
   if(bytes.length<4||(bytes[0]&255)!==80||(bytes[1]&255)!==75)throw new Error('Invalid Word attachment.');
   let parts;try{parts=Utilities.unzip(Utilities.newBlob(bytes,'application/zip'));}catch{throw new Error('Invalid Word attachment.');}
   const names=parts.map(part=>part.getName());if(!names.includes('[Content_Types].xml')||!names.includes('word/document.xml')||names.some(name=>/vbaProject|\.bin$/i.test(name)))throw new Error('Invalid Word attachment.');
  }else if(String.fromCharCode(...bytes.slice(0,4).map(byte=>byte&255))!=='%PDF')throw new Error('Invalid PDF attachment.');
  const safeName=value=>String(value||'').normalize('NFKC').replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g,'-').replace(/\s+/g,' ').trim().replace(/[. ]+$/,'').slice(0,90);
  const level=safeName(client[4]),levelLabel=level?(/^\d+$/.test(level)?'Level '+level:level):'',title={progress:'Progress report',final:'Final exam report',registration:'Registration & payment confirmation',notes:'Notes'}[kind];
  const filename=[safeName(client[1])||'Student',levelLabel,title,Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd')].filter(Boolean).join(' — ')+(word?'.docx':'.pdf');
  attachment=Utilities.newBlob(bytes,word?'application/vnd.openxmlformats-officedocument.wordprocessingml.document':'application/pdf',filename);
 }
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  let log=book.getSheetByName('EmailLog');if(!log){log=book.insertSheet('EmailLog');log.appendRow(['Request ID','Client ID','Kind','Recipient','Status','Sent at (UTC)','Error']);}
  const logs=log.getLastRow()>1?log.getRange(2,1,log.getLastRow()-1,7).getValues():[],existing=logs.find(r=>String(r[0])===requestId);
  if(existing){if(String(existing[1])!==id||String(existing[2])!==kind)throw new Error('Email request identity mismatch.');if(existing[4]==='sent')return respond({ok:true,status:'sent',recipient:String(existing[3])});throw new Error('This email has an uncertain delivery status. Check EmailLog before sending it again.');}
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached. Try again tomorrow.');
  const labels={confirmation:'Email confirmation',progress:'Progress report',final:'Final report',registration:'Payment and registration confirmation',notes:'Notes'};
  let message;
  if(kind==='confirmation'){
   const meetings=sbUpcomingClientMeetings(book,id).slice(0,1);if(!meetings.length)throw new Error('No upcoming calendar sessions are saved for this client. Add or sync their appointments first.');
   if(p.sessionId&&String(meetings[0][0])!==String(p.sessionId))throw new Error('The next session changed. Reopen the confirmation preview before sending.');
   message=sbCalendarEmail(client,meetings);
  }else{
   const course=sbEmailProgramName(client[11]||''),level=String(client[4]||'');
   const details=kind==='registration'?[course,level?'Level / Program: '+level:''].filter(Boolean).join('\n'):'';
   const body='Hello '+client[1]+',\n\n'+(details?details+'\n\n':'')+'Please find your '+labels[kind].toLowerCase()+' attached.\n\nIf you have any questions, reply to this email.\n\nSpeak Boldly';
   message={body,htmlBody:sbBrandedEmail(labels[kind],'<p>Hello '+sbEmailEscape(client[1])+',</p>'+(details?'<p>'+sbEmailEscape(details).replace(/\n/g,'<br>')+'</p>':'')+'<p>Please find your '+sbEmailEscape(labels[kind].toLowerCase())+' attached.</p><p>If you have any questions, reply to this email.</p>')};
  }
  const row=log.getLastRow()+1;log.getRange(row,1,1,7).setValues([[requestId,id,kind,String(client[2]),'sending','','']]);SpreadsheetApp.flush();
  try{MailApp.sendEmail({to:String(client[2]),subject:(kind==='confirmation'?'Your class confirmation':labels[kind])+' — Speak Boldly',...message,name:'Speak Boldly',replyTo:'speakboldly16@gmail.com',...(attachment?{attachments:[attachment]}:{})});log.getRange(row,5,1,3).setValues([['sent',new Date().toISOString(),'']]);return respond({ok:true,status:'sent',recipient:String(client[2])});}
  catch(error){log.getRange(row,5).setValue('delivery_unknown');log.getRange(row,7).setValue(String(error.message||error));throw new Error('Email delivery could not be confirmed. Check EmailLog before trying another send.');}
 }finally{lock.releaseLock();}
}


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

// Add this file only for a multi-file project. UnifiedCode.gs already includes it.
const SB_EXAM_HEADERS = ['Attempt ID','Client ID','Name','Level','Status','Opened at','Submitted at','Answers','Marks','Score','Feedback','Reviewed at','Version','Program','Deadline','Notification status','Notification error','Age'];
const SB_PORTAL_ACCESS_HEADERS = ['Item ID','Section','Title','URL','Enabled'];
const SB_EXAM_SESSION_HEADERS = ['Token hash','Visitor ID','Name','Program','Expires at','Age'];
const SB_STUDENT_EXAM_ACTIONS = ['studentPortalAccess','studentFolderLogin','studentExamLogin','studentExamGet','studentExamDraft','studentExamSubmit'];
const SB_INSTRUCTOR_EXAM_ACTIONS = ['learningLevelAccess','saveLearningLevelAccess','weeklyPortalPasswords','monthlyPortalPasswords','saveMonthlyPortalPassword','listExamAttempts','reviewExamAttempt','listPortalAccess','savePortalAccess','retryExamNotification'];
function setupStudentExams() {
  const id = PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID');
  if (!id) throw new Error('Run setupClientSync first.');
  const book = SpreadsheetApp.openById(id);
  if (!book.getSheetByName('Clients')) throw new Error('Clients tab is missing.');
  let sheet = book.getSheetByName('Exam attempts');
  if (!sheet) sheet = book.insertSheet('Exam attempts');
  if (!sheet.getLastRow()) sheet.appendRow(SB_EXAM_HEADERS);
  else {if(sheet.getRange(1,18).getValues()[0][0]===''&&JSON.stringify(sheet.getRange(1,1,1,17).getValues()[0])===JSON.stringify(SB_EXAM_HEADERS.slice(0,17)))sheet.getRange(1,18).setValue('Age');}
  if (JSON.stringify(sheet.getRange(1,1,1,18).getValues()[0]) !== JSON.stringify(SB_EXAM_HEADERS)) throw new Error('Exam attempts headers differ. Existing data has not been changed.');
  sheet.setFrozenRows(1);
  sheet.getRange('A1:R1').setFontWeight('bold');
  let access=book.getSheetByName('Portal access');
  if(!access)access=book.insertSheet('Portal access');
  if(!access.getLastRow()){access.appendRow(SB_PORTAL_ACCESS_HEADERS);for(let level=1;level<=8;level++)access.appendRow(['test:'+level,'tests','Level '+level,'',false]);}
  else if(JSON.stringify(access.getRange(1,1,1,5).getValues()[0])!==JSON.stringify(SB_PORTAL_ACCESS_HEADERS))throw new Error('Portal access headers differ. Existing data has not been changed.');
  access.setFrozenRows(1);access.getRange('A1:E1').setFontWeight('bold');
  let sessions=book.getSheetByName('Exam sessions');
  if(!sessions)sessions=book.insertSheet('Exam sessions');
  if(!sessions.getLastRow())sessions.appendRow(SB_EXAM_SESSION_HEADERS);
  else {if(sessions.getRange(1,6).getValues()[0][0]===''&&JSON.stringify(sessions.getRange(1,1,1,5).getValues()[0])===JSON.stringify(SB_EXAM_SESSION_HEADERS.slice(0,5)))sessions.getRange(1,6).setValue('Age');}
  if(JSON.stringify(sessions.getRange(1,1,1,6).getValues()[0])!==JSON.stringify(SB_EXAM_SESSION_HEADERS))throw new Error('Exam sessions headers differ. Existing data has not been changed.');
  const props=PropertiesService.getScriptProperties();
  if(!props.getProperty('SB_EXAM_NOTIFY_EMAIL')){
    const email=Session.getEffectiveUser().getEmail();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Set SB_EXAM_NOTIFY_EMAIL in Script Properties to your email address, then run setupStudentExams again.');
    props.setProperty('SB_EXAM_NOTIFY_EMAIL',email);
  }
  MailApp.getRemainingDailyQuota();
}
function sbExamResponse(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function sbExamBook() {
  const id = PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID');
  if (!id) throw new Error('The instructor needs to set up the Clients sheet.');
  return SpreadsheetApp.openById(id);
}
function sbExamSafe(value) { const text=String(value||''); return /^[=+\-@\t\r]/.test(text) ? "'"+text : text; }
function sbExamHash(value) { return Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,value)).replace(/=+$/,''); }
function sbPortalItems(book){const sheet=book.getSheetByName('Portal access');if(!sheet)throw new Error('Run setupStudentExams, then deploy a New version.');return sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,5).getValues().map(row=>({id:String(row[0]),section:String(row[1]),title:String(row[2]).replace(/^'/,''),url:String(row[3]),enabled:row[4]===true||row[4]==='true'})):[];}
// Folder passwords change at the start of each month in Cairo.
function sbPortalWeek(){
 const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd'),start=today.slice(0,7)+'-01',date=new Date(start+'T12:00:00Z');date.setUTCMonth(date.getUTCMonth()+1);return {start,next:date.toISOString().slice(0,10)};
}
function sbMonthlyPortalPasswords(){
 const props=PropertiesService.getScriptProperties(),secret=props.getProperty('CLIENT_SYNC_KEY');if(!secret)throw new Error('Connect your Clients sheet first.');
 const month=sbPortalWeek(),groups=[...Array.from({length:8},(_,i)=>'material:'+(i+1)),'exams','exercises','activities','listening'],passwords={};let saved={};try{saved=JSON.parse(props.getProperty('SB_MONTHLY_PASSWORD_OVERRIDES')||'{}');}catch{}
 const overrides=saved.monthStart===month.start?saved.values||{}:{},used=new Set(Object.values(overrides));
 for(const group of groups){if(overrides[group]){passwords[group]=overrides[group];continue;}const bytes=Utilities.computeHmacSha256Signature('Speak Boldly monthly password:'+month.start+':'+group,secret);let number=0;for(const byte of bytes)number=(number*256+(byte&255))%900000;while(used.has(String(100000+number)))number=(number+1)%900000;passwords[group]=String(100000+number);used.add(passwords[group]);}
 return {monthStart:month.start,nextChange:month.next,passwords};
}
function sbPortalPasswordRevision(){let saved={};try{saved=JSON.parse(PropertiesService.getScriptProperties().getProperty('SB_MONTHLY_PASSWORD_OVERRIDES')||'{}');}catch{}const month=sbPortalWeek().start;return month+':monthly-v4:'+(saved.monthStart===month?saved.revision||'':'');}
function sbSaveMonthlyPortalPassword(data){
 const current=sbMonthlyPortalPasswords(),group=String(data.group||''),password=String(data.password||'');if(data.monthStart!==current.monthStart)throw new Error('The month changed. Refresh the passwords first.');if(!Object.prototype.hasOwnProperty.call(current.passwords,group)||!/^\d{6}$/.test(password))throw new Error('Choose a folder and enter a six-digit password.');if(Object.entries(current.passwords).some(([key,value])=>key!==group&&value===password))throw new Error('Use a different password from the other folders.');
 const props=PropertiesService.getScriptProperties();let saved={};try{saved=JSON.parse(props.getProperty('SB_MONTHLY_PASSWORD_OVERRIDES')||'{}');}catch{}const values=saved.monthStart===current.monthStart?saved.values||{}:{};values[group]=password;props.setProperty('SB_MONTHLY_PASSWORD_OVERRIDES',JSON.stringify({monthStart:current.monthStart,values,revision:Utilities.getUuid()}));return sbMonthlyPortalPasswords();
}
function sbWeeklyPortalPasswords(){const monthly=sbMonthlyPortalPasswords(),passwords={...monthly.passwords};for(let level=1;level<=8;level++)passwords['level:'+level]=passwords['material:'+level];for(const group of ['practice','exercise:comprehension','exercise:resources'])passwords[group]=passwords.activities;passwords['exercise:listening']=passwords.listening;passwords.material=passwords['material:1'];passwords.assessments=passwords.exams;passwords.calendar=passwords.activities;return {...monthly,weekStart:monthly.monthStart,passwords};}
function sbLearningLevelAccess(){const raw=PropertiesService.getScriptProperties().getProperty('SB_LEARNING_LEVEL_ACCESS');let saved={};try{saved=JSON.parse(raw||'{}');}catch{}return Object.fromEntries(Array.from({length:8},(_,i)=>[String(i+1),saved[String(i+1)]!==false]));}
function sbLearningItemLevel(item){const match=String(item.title||'').match(/(?:^|[^a-z0-9])level[\s_-]*([1-8])(?:[^0-9]|$)/i);return match?Number(match[1]):null;}
function sbPortalFolderGroup(key){
 if(key==='exams'||/^exams:[1-8]$/.test(key))return 'exams';
 if(/^(material|exams):[1-8]$/.test(key)||['exercises','activities','listening'].includes(key))return key;
 if(/^level:[1-8]$/.test(key))return 'material:'+key.split(':')[1];
 if(['exercise:listening','program:listening'].includes(key))return 'listening';
 if(['practice','exercise:comprehension','exercise:resources','program:comprehension'].includes(key))return 'activities';
 if(key==='material'||/^program:[a-z][a-z0-9-]{0,60}$/.test(key))return 'material:1';
 throw new Error('Choose a valid folder.');
}
function sbExamNotify(sheet,index,row){
  if(!row[6]||['sent','sending'].includes(String(row[15])))return;
  const to=PropertiesService.getScriptProperties().getProperty('SB_EXAM_NOTIFY_EMAIL');
  try{
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL in Script Properties.');
    if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
    row[15]='sending';row[16]='';sheet.getRange(index+2,1,1,18).setValues([row]);
    const attempt=sbExamAttempt(row),automatic=attempt.automatic;const summary=automatic?Object.entries(automatic).map(([section,mark])=>({A:'Choose',B:'Correct the mistake',C:'Comprehension',D:'Complete the sentences',F:'Punctuation'}[section]||section)+': '+mark.score+' / '+mark.outOf+(mark.complete===false?' (review needed)':'')).join('\n'):'';
    MailApp.sendEmail({to,subject:'Assessment submitted — '+String(row[2]).replace(/^'/,'')+' — Level '+row[3],body:'An interactive test has been submitted.\n\nName: '+String(row[2]).replace(/^'/,'')+'\nLevel: '+row[3]+'\nProgram: '+String(row[13]).replace(/^'/,'')+'\n\nAutomatic section scores:\n'+summary+'\n\nWriting: awaiting your mark (out of 10). Automatic scores are provisional where review is needed.\n\nWriting response:\n'+(attempt.answers.E||'(No response)')+'\n\nAll submitted answers:\n'+JSON.stringify(attempt.answers,null,2)+'\n\nOpen Instructor Portal → Exam Review to correct the answers and save the score.\n\nSpeak Boldly',name:'Speak Boldly'});
    row[15]='sent';
  }catch(error){row[15]='failed';row[16]=sbExamSafe(error.message);}
  sheet.getRange(index+2,1,1,18).setValues([row]);
}
function sbExamExpire(sheet,index,row){if(!row[6]&&Date.now()>=Number(row[14])){row[4]='Awaiting review';row[6]=new Date().toISOString();row[12]=Number(row[12])+1;sheet.getRange(index+2,1,1,18).setValues([row]);sbExamNotify(sheet,index,row);}}
function sbExamAttempt(row) {
  return {id:String(row[0]),clientId:String(row[1]),name:String(row[2]).replace(/^'/,''),level:Number(row[3]),status:String(row[4]),openedAt:String(row[5]),submittedAt:String(row[6]),answers:row[7]?JSON.parse(String(row[7])):{A:{},B:{},C:{},D:'',E:''},marks:row[8]?JSON.parse(String(row[8])):null,score:row[9]===''?null:Number(row[9]),feedback:String(row[10]).replace(/^'/,''),reviewedAt:String(row[11]),version:Number(row[12]||1),program:String(row[13]).replace(/^'/,''),deadline:Number(row[14]),serverNow:Date.now(),notificationStatus:String(row[15]),notificationError:String(row[16]),age:row[17]?Number(row[17]):null,automatic:row[6]?sbExamObjectiveMarks(Number(row[3]),row[7]?JSON.parse(String(row[7])):{A:{},B:{}}):null};
}
// Backend-only marking: student responses never contain these keys or results.
const SB_EXAM_OBJECTIVE_KEYS = {"1": {"A": [1, 1, 2, [0, 1], 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 2, 1], "B": ["She works in a department store.", "Where are you from?", "I would like a coffee, please.", "There is a bank on Main Street.", "He doesn't speak Japanese.", "We were at the restaurant yesterday.", "I went to the movies last Saturday.", "She can use a computer.", "Those shirts are very expensive.", "What were you doing at 8:00 last night?"]}, "2": {"A": [1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], "B": ["I usually take the train to work.", "The flight will arrive at 8:30.", "How long does it take to get to the hotel?", "She is responsible for answering customer complaints.", "We didn't go on a business trip last month.", "There are too many people in this restaurant.", "This hotel is the most comfortable hotel in town.", "I feel like eating something spicy.", "I was driving home when the accident happened.", "I used to play tennis when I was younger."]}, "3": {"A": [0, [0, 1], 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0], "B": ["Have you ever gone to New York?", "I saw him yesterday.", "She has worked here for five years.", "I suggest taking a taxi.", "The museum was built in 1920.", "This bag is mine. Yours is over there.", "The agent told me to return the car with a full tank.", "I had the mechanic check the brakes.", "I haven't been to the theater lately.", "The final report has been completed."]}, "4": {"A": [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 1, 1, 0, 1], "B": ["The invitations will be sent out tomorrow.", "He said he couldn't come because he had other plans.", "If I have time, I will help you.", "She asked me if she could borrow my phone.", "I apologize for arriving late.", "The airline should have given us a refund.", "I have been working here since 2021.", "If I had more money, I would travel more.", "I wish I could save more every month.", "By the time we arrived, the meeting had already started."]}, "5": {"A": [0, [0, 1], 1, 1, 0, 1, 2, 0, 1, 0, 1, 1, 1, 0, [0, 2], 0, 1, 1, 0, 1], "B": ["I normally go to work by metro.", "While I was working in Dubai, I met my husband.", "She is responsible for organizing the weekly meetings.", "He suggested going to the gym after work.", "I stopped eating fast food because I wanted to be healthier.", "A pharmacist is a person who prepares and sells medicine.", "Before buying packaged food, read the nutrition label.", "If I were you, I would speak to a doctor.", "The tickets can be bought online.", "The article can't have been true; every fact in it was wrong."]}, "6": {"A": [0, 1, 1, 0, 0, [0, 1, 2], 1, 0, 1, 1, 0, [0, 1], 1, 0, 1, 1, 0, 0, 0, 1], "B": ["He is quite a dependable person, but he isn't as patient as his brother.", "Would you mind telling me why you want to learn Spanish?", "If I had stayed at home, I wouldn't have met my best friend.", "The recruiter recommended that I update my résumé.", "She looks like she is feeling much better today.", "The doctor advised that he rest for several days.", "We are going to get the roof repaired next week.", "It was such terrible weather that we stayed indoors.", "It is essential that the government reduce pollution immediately.", "Riding a bike is nearly as cheap as taking the bus."]}};
function sbExamNormalizeCorrection(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\bdoesn't\b/g,'does not').replace(/\bdidn't\b/g,'did not').replace(/\bcouldn't\b/g,'could not').replace(/\bwouldn't\b/g,'would not').replace(/\bisn't\b/g,'is not').replace(/\bhaven't\b/g,'have not').replace(/\bcan't\b/g,'cannot').replace(/[.,;?!]/g,'').replace(/\s+/g,' ').trim();}
function sbExamObjectiveMarks(level,answers){
 if(answers.examVersion===2)return sbExamV2Marks(level,answers);
 const key=SB_EXAM_OBJECTIVE_KEYS[level];if(!key)return null;
 const A=key.A.map((expected,i)=>{const accepted=Array.isArray(expected)?expected:[expected],answer=answers.A?.[i+1];return {number:i+1,accepted,answer:answer===undefined?null:answer,correct:accepted.includes(answer)};});
 const B=key.B.map((expected,i)=>{const answer=String(answers.B?.[i+1]||'');return {number:i+1,expected,answer,status:!answer.trim()?'unanswered':sbExamNormalizeCorrection(answer)===sbExamNormalizeCorrection(expected)?'correct':'review'};});
 return {A:{score:A.filter(item=>item.correct).length,outOf:20,items:A},B:{score:B.filter(item=>item.status==='correct').length*2,outOf:20,complete:!B.some(item=>item.status==='review'),items:B}};
}
function sbStudentExamAttempt(row){
 const attempt=sbExamAttempt(row);
 // Whitelist the student's receipt and own answers. No review data or mail errors.
 return {id:attempt.id,clientId:attempt.clientId,name:attempt.name,level:attempt.level,status:attempt.submittedAt?'Submitted':'In progress',openedAt:attempt.openedAt,submittedAt:attempt.submittedAt,answers:attempt.answers,version:attempt.version,program:attempt.program,deadline:attempt.deadline,serverNow:attempt.serverNow,age:attempt.age};
}
function sbExamAnswers(value) {
  if(value?.examVersion===2)return sbExamV2Answers(value);
  if (!value || typeof value!=='object' || Array.isArray(value)) throw new Error('Invalid answers.');
  const answers={A:{},B:{},C:{},D:'',E:''};
  for (const section of ['A','B','C']) {
    const entries=value[section]||{};
    if (typeof entries!=='object'||Array.isArray(entries)) throw new Error('Invalid answers.');
    for (const key of Object.keys(entries)) {
      if (!/^[1-9]\d?$/.test(key) || Number(key)>(section==='A'?20:10)) throw new Error('Invalid question number.');
      const answer=entries[key];
      if (section==='A') { if (!Number.isInteger(answer)||answer<0||answer>2) throw new Error('Invalid multiple-choice answer.'); answers.A[key]=answer; }
      else { if(typeof answer!=='string'||answer.length>5000)throw new Error('Answer too long.');answers[section][key]=answer; }
    }
  }
  for(const section of ['D','E']) { if(value[section]!==undefined && (typeof value[section]!=='string'||value[section].length>15000))throw new Error('Answer too long.');answers[section]=value[section]||''; }
  if(JSON.stringify(answers).length>40000)throw new Error('Your answers are too long to save. Please shorten them.');
  return answers;
}
function handleStudentExam(data) {
  const lock=LockService.getScriptLock();
  try {
    const book=sbExamBook(),items=sbPortalItems(book);
    if(data.action==='studentPortalAccess')return sbExamResponse({ok:true,passwordSettings:{revision:sbPortalPasswordRevision(),monthly:true},levelAccess:sbLearningLevelAccess(),items:items.map(item=>{const level=sbLearningItemLevel(item),enabled=item.enabled&&(!level||sbLearningLevelAccess()[String(level)]);return {...item,enabled,url:enabled?item.url:''};})});
    if(data.action==='studentFolderLogin'){
      const group=sbPortalFolderGroup(data.folder),weekly=sbWeeklyPortalPasswords();
      if(/^(material|exams):[1-8]$/.test(group)&&!sbLearningLevelAccess()[group.split(':')[1]])throw new Error('This level is currently closed by your instructor.');
      if(String(data.passcode||'')!==weekly.passwords[group])throw new Error('Incorrect folder password.');
      return sbExamResponse({ok:true,revision:sbPortalPasswordRevision()});
    }
    if(data.action==='studentExamLogin') {
      const requestedLevel=Number(data.level);if(!Number.isInteger(requestedLevel)||requestedLevel<1||requestedLevel>8)throw new Error('Choose a valid level.');
      
      const passcode=sbMonthlyPortalPasswords().passwords.exams;if(String(data.passcode||'')!==passcode)throw new Error('Incorrect assessment password.');
      const name=String(data.name||'').trim(),program=String(data.program||'').trim(),age=data.age===undefined?'':Number(data.age);if(age!==''&&(!Number.isInteger(age)||age<1||age>120))throw new Error('Enter a valid age.');
      if(!name||name.length>100||program.length>100)throw new Error('Enter your name.');
      if(requestedLevel>8)throw new Error('Choose an available examination level (1–8).');
      const levels=[requestedLevel];
      if(!levels.length)throw new Error('Interactive tests are currently closed. Please wait for your instructor to open your level.');
      const token=Utilities.getUuid()+Utilities.getUuid();
      const sessions=book.getSheetByName('Exam sessions');if(!sessions)throw new Error('Run setupStudentExams first.');
      sessions.getRange(1,7).setValue('Allowed level');lock.waitLock(20000);sessions.appendRow([sbExamHash(token),Utilities.getUuid(),sbExamSafe(name),sbExamSafe(program),Date.now()+6*60*60*1000,age,requestedLevel||'']);
      return sbExamResponse({ok:true,token,student:{name,program,levels,...(age!==''?{age}:{})}});
    }
    const sessions=book.getSheetByName('Exam sessions'),hash=sbExamHash(String(data.token||''));
    const saved=sessions&&sessions.getLastRow()>1?sessions.getRange(2,1,sessions.getLastRow()-1,7).getValues().find(row=>String(row[0])===hash&&Number(row[4])>Date.now()):null;
    if(!saved)throw new Error('Your session expired. Ask your instructor to check your saved assessment.');
    const session={clientId:String(saved[1]),name:String(saved[2]).replace(/^'/,''),program:String(saved[3]).replace(/^'/,''),age:saved[5]||''},level=Number(data.level);
    if(!Number.isInteger(level)||level<1||level>8)throw new Error('Choose a valid level.');
    if(saved[6]&&Number(saved[6])!==level)throw new Error('Your passcode allows only your selected level.');
    lock.waitLock(20000);
    const sheet=book.getSheetByName('Exam attempts');if(!sheet)throw new Error('The instructor needs to run setupStudentExams first.');
    const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,18).getValues():[];
    let index=rows.findIndex(row=>String(row[1])===session.clientId&&Number(row[3])===level),row=index<0?null:rows[index];
    if(!row) {
      if(data.action!=='studentExamGet')throw new Error('Open your assessment before saving it.');
      
      const now=Date.now();row=[Utilities.getUuid(),session.clientId,sbExamSafe(session.name),level,'In progress',new Date(now).toISOString(),'',data.examVersion===2?JSON.stringify({examVersion:2,A:{},B:{},C:{},D:{},E:'',F:{}}):'','','','','',1,sbExamSafe(session.program),now+20*60*1000,'','',session.age];
      sheet.appendRow(row);index=sheet.getLastRow()-2;
    }
    // A switch closes new starts; students already taking an exam can finish it.
    sbExamExpire(sheet,index,row);
    if(data.action==='studentExamDraft'||data.action==='studentExamSubmit') {
      if(data.attemptId!==String(row[0]))throw new Error('This assessment has changed. Reopen it.');
      if(!row[6]) {
        if(Number(data.version)!==Number(row[12]))throw new Error('Answers were changed in another tab. Reopen the assessment to load the saved version.');
        row[7]=JSON.stringify(sbExamAnswers(data.answers));row[12]=Number(row[12])+1;
        if(data.action==='studentExamSubmit'){row[4]='Awaiting review';row[6]=new Date().toISOString();}
        sheet.getRange(index+2,1,1,18).setValues([row]);
      }
      if(row[6])sbExamNotify(sheet,index,row);
    }
    return sbExamResponse({ok:true,attempt:sbStudentExamAttempt(row)});
  }catch(error){return sbExamResponse({ok:false,error:error.message});}
  finally{if(lock.hasLock())lock.releaseLock();}
}
function handleInstructorExam(data) {
  const lock=LockService.getScriptLock();
  try {
    lock.waitLock(20000);const book=sbExamBook();
    if(data.action==='learningLevelAccess')return sbExamResponse({ok:true,levels:sbLearningLevelAccess()});
    if(data.action==='saveLearningLevelAccess'){const level=Number(data.level);if(!Number.isInteger(level)||level<1||level>8||typeof data.enabled!=='boolean')throw new Error('Choose a valid level and access setting.');const levels=sbLearningLevelAccess();levels[String(level)]=data.enabled;PropertiesService.getScriptProperties().setProperty('SB_LEARNING_LEVEL_ACCESS',JSON.stringify(levels));return sbExamResponse({ok:true,levels});}
    if(data.action==='monthlyPortalPasswords')return sbExamResponse({ok:true,...sbMonthlyPortalPasswords()});
    if(data.action==='saveMonthlyPortalPassword')return sbExamResponse({ok:true,...sbSaveMonthlyPortalPassword(data)});
    if(data.action==='weeklyPortalPasswords')return sbExamResponse({ok:true,...sbWeeklyPortalPasswords()});
    if(data.action==='listPortalAccess')return sbExamResponse({ok:true,items:sbPortalItems(book)});
    if(data.action==='savePortalAccess'){
      const item=data.item;
      if(!item||!['tests','exercises','levels'].includes(item.section)||typeof item.enabled!=='boolean'||typeof item.title!=='string'||!item.title.trim()||item.title.length>250)throw new Error('Check the portal item.');
      let id,url=String(item.url||'');
      if(item.section==='tests'){if(!/^test:[1-8]$/.test(item.id))throw new Error('Check the test level.');id=item.id;url='';}
      else {if(!/^https:\/\//.test(url)||url.length>2000)throw new Error('Use a valid HTTPS file URL.');id='file:'+sbExamHash(item.section+':'+url);}
      const sheet=book.getSheetByName('Portal access');if(!sheet)throw new Error('Run setupStudentExams first.');
      const items=sbPortalItems(book),index=items.findIndex(entry=>entry.id===id),row=[id,item.section,sbExamSafe(item.title.trim()),url,item.enabled];
      if(index<0)sheet.appendRow(row);else sheet.getRange(index+2,1,1,5).setValues([row]);
      return sbExamResponse({ok:true,item:{id,section:item.section,title:item.title.trim(),url,enabled:item.enabled}});
    }
    const sheet=book.getSheetByName('Exam attempts');if(!sheet)throw new Error('Run setupStudentExams, then deploy a New version.');
    const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,18).getValues():[];
    if(data.action==='listExamAttempts'){
      rows.forEach((row,index)=>sbExamExpire(sheet,index,row));
      return sbExamResponse({ok:true,attempts:rows.map(sbExamAttempt).reverse()});
    }
    const index=rows.findIndex(row=>String(row[0])===String(data.attemptId)),row=rows[index];
    if(!row||!row[6])throw new Error('No submitted assessment found.');
    if(data.action==='retryExamNotification'){if(row[15]==='sending')throw new Error('Email delivery is uncertain. Check your sent mail before retrying.');sbExamNotify(sheet,index,row);return sbExamResponse({ok:true,attempt:sbExamAttempt(row)});}
    if(Number(data.version)!==Number(row[12]))throw new Error('This review changed in another tab. Refresh before marking it again.');
    const limits=row[7]&&JSON.parse(String(row[7])).examVersion===2?{A:10,B:5,C:5,D:5,E:10,F:5}:{A:20,B:20,C:20,D:20,E:20};const marks={};for(const [section,max]of Object.entries(limits)){const mark=data.marks?.[section];if(typeof mark!=='number'||!Number.isFinite(mark)||mark<0||mark>max)throw new Error('Enter a mark from 0 to '+max+' for section '+section+'.');marks[section]=mark;}
    const feedback=String(data.feedback||'');if(feedback.length>10000)throw new Error('Feedback too long.');
    row[4]='Reviewed';row[8]=JSON.stringify(marks);row[9]=Object.values(marks).reduce((a,b)=>a+b,0);row[10]=sbExamSafe(feedback);row[11]=new Date().toISOString();row[12]=Number(row[12])+1;
    sheet.getRange(index+2,1,1,18).setValues([row]);return sbExamResponse({ok:true,attempt:sbExamAttempt(row)});
  }catch(error){return sbExamResponse({ok:false,error:error.message});}
  finally{if(lock.hasLock())lock.releaseLock();}
}

// Included in UnifiedCode.gs. Add separately only in a multi-file project.
const SB_PUBLIC_BOOKING_ACTIONS=['studentBookingLogin','studentBookingCalendar','studentBookSlots','studentRegisterSlot'];
const SB_OWNER_BOOKING_ACTIONS=['listRegistrationRequests','reviewRegistration','retryRegistrationNotification','instructorOverview','calendarAvailability','saveCalendarDay','calendarSlots','saveCalendarSlots','bookingSettings','saveBookingSettings','checkStudentPortal'];
const SB_BOOKING_HEADERS=['Request ID','Client ID','Name','Planned sessions','Session IDs','Created at','Status','Notification status','Notification error'];
function setupBookingCalendar(){
 const props=PropertiesService.getScriptProperties(),book=sbExamBook();
 if(!book.getSheetByName('Sessions'))setupSheetReminders();
 let requests=book.getSheetByName('Booking requests');if(!requests)requests=book.insertSheet('Booking requests');
 if(!requests.getLastRow())requests.appendRow(SB_BOOKING_HEADERS);
 else if(JSON.stringify(requests.getRange(1,1,1,9).getValues()[0])!==JSON.stringify(SB_BOOKING_HEADERS))throw new Error('Booking requests headers differ. Existing data was not changed.');
 requests.setFrozenRows(1);requests.getRange('A1:I1').setFontWeight('bold');
 if(!props.getProperty('SB_BOOKING_ENABLED'))props.setProperty('SB_BOOKING_ENABLED','true');
}
function setupStudentPortal(){setupStudentExams();setupBookingCalendar();
 const props=PropertiesService.getScriptProperties();
 if(props.getProperty('SB_SIX_ASSESSMENT_FILES')!=='1'){
  const sheet=sbExamBook().getSheetByName('Portal access');const rows=sbBookingRows(sheet,5);
  rows.forEach((row,index)=>{if(row[1]==='tests'){row[4]=false;sheet.getRange(index+2,1,1,5).setValues([row]);}});
  props.setProperty('SB_SIX_ASSESSMENT_FILES','1');
 }
}
function sbBookingToday(){return Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');}
function sbBookingSlots(date){
 const saved=PropertiesService.getScriptProperties().getProperty('SB_CALENDAR_SLOTS_'+date);if(saved!==null&&saved!==undefined)return JSON.parse(saved);

 const day=new Date(date+'T12:00:00Z').getUTCDay();
 if([2,3,4].includes(day))return[{time:'18:00',label:'6–7:30pm'},{time:'19:30',label:'7:30–9pm'}];
 if(day===6)return[{time:'10:00',label:'10–11:30am'},{time:'11:30',label:'11:30am–1pm'}];
 return[];
}
function sbBookingRows(sheet,width){return sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,width).getValues():[];}
function sbBookingAuth(data){
 const props=PropertiesService.getScriptProperties(),passcode=sbWeeklyPortalPasswords().passwords.calendar,key=props.getProperty('CLIENT_SYNC_KEY');
 if(!passcode||!key)throw new Error('The instructor needs to run setupStudentPortal first.');
 if(props.getProperty('SB_BOOKING_ENABLED')!=='true')throw new Error('Booking is currently closed. Please contact your instructor.');
 const version=sbExamHash(passcode),sign=payload=>Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload,key));
 if(data.action==='studentBookingLogin'){
  if(data.public!==true&&String(data.passcode||'')!==passcode)throw new Error('Incorrect booking passcode. Please ask your instructor for the current passcode.');
  const payload=Utilities.base64EncodeWebSafe(JSON.stringify({version:data.public===true?'public-calendar-v1':version,public:data.public===true,expires:Date.now()+8*60*60*1000,nonce:Utilities.getUuid()}));
  return {token:payload+'.'+sign(payload)};
 }
 try{const parts=String(data.token||'').split('.');if(parts.length!==2||parts[1]!==sign(parts[0]))throw new Error();const claims=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());if(claims.version!==(claims.public===true?'public-calendar-v1':version)||!Number.isFinite(claims.expires)||claims.expires<=Date.now())throw new Error();}
 catch(error){throw new Error('Calendar access expired. Reopen the calendar to continue.');}
 return {};
}
function sbBookingBusy(book){
 const sessions=sbBookingRows(book.getSheetByName('Sessions'),14).filter(row=>row[0]&&String(row[7])!=='cancelled').map(row=>({start:Date.parse(row[5]),id:String(row[0]),duration:sbSessionDuration(row)}));
 const pending=book.getSheetByName('Booking requests')?sbBookingRows(book.getSheetByName('Booking requests'),9):[];const legacyPending=pending.filter(row=>row[6]==='pending');
 for(const row of legacyPending)for(const item of JSON.parse(String(row[3])))if(!sessions.some(entry=>entry.id===item.id))sessions.push({start:item.starts,id:item.id});
 return sessions.filter(item=>Number.isFinite(item.start));
}
function sbBookingOverlap(start,busy,ownIds=[],duration=90){return busy.some(item=>!ownIds.includes(item.id)&&start<item.start+(item.duration||90)*60000&&start+duration*60000>item.start);}
function sbBookingNotify(sheet,index,row){
 if(['sent','sending'].includes(String(row[7])))return;
 try{
  const to=PropertiesService.getScriptProperties().getProperty('SB_EXAM_NOTIFY_EMAIL');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL to your notification address.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
  row[7]='sending';row[8]='';sheet.getRange(index+2,1,1,9).setValues([row]);
  const lines=JSON.parse(String(row[3])).map(item=>'Session '+item.number+' — '+item.date+' — '+sbDisplayTime(item.time)+' (Cairo time)');
  MailApp.sendEmail({to,subject:'New slot booking — '+String(row[2]).replace(/^'/,''),body:'Name: '+String(row[2]).replace(/^'/,'')+'\n\n'+lines.join('\n')+'\n\nReview the instructor calendar and send class confirmation manually through Actions.\n\nSpeak Boldly',name:'Speak Boldly'});row[7]='sent';
 }catch(error){row[7]='failed';row[8]=sbExamSafe(error.message);}
 sheet.getRange(index+2,1,1,9).setValues([row]);
}
function sbBookingWindow(){const today=sbBookingToday(),end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+42);return {start:today,end:end.toISOString().slice(0,10)};}
function handlePublicBooking(data){
 const lock=LockService.getScriptLock();
 try{
  const auth=sbBookingAuth(data);
  if(data.action==='studentBookingLogin')return sbExamResponse({ok:true,...auth,registrationVersion:1,paymentEmail:SB_PAYMENT_EMAIL,programDurations:{'English Momentum':60},programs:SB_SESSION_PROGRAMS.filter(program=>!['Assessment','Trial session'].includes(program))});
  lock.waitLock(20000);const book=sbExamBook();if(!book.getSheetByName('Sessions'))throw new Error('The instructor needs to set up the calendar first.');
  if(data.action==='studentBookingCalendar')return sbExamResponse(sbRegistrationCalendar(data,book));
  if(data.action==='studentRegisterSlot')return sbExamResponse(sbSubmitRegistration(data,book));
  throw new Error('Booking now requires instructor approval. Refresh the calendar to send a registration request.');
 }catch(error){return sbExamResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}
function sbCalendarAvailability(book) {
 const sheet=book.getSheetByName('Calendar availability');
 if(!sheet||sheet.getLastRow()<2)return [];
 return sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues().filter(row=>row[0]&&(row[1]===false||String(row[1]).toLowerCase()==='false')).map(row=>row[0] instanceof Date?Utilities.formatDate(row[0],'Africa/Cairo','yyyy-MM-dd'):String(row[0])).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date));
}
function sbCalendarDateBlocked(date,book){return sbCalendarAvailability(book||sbExamBook()).includes(String(date));}
function sbSaveCalendarDay(book,data) {
 const date=String(data.date||''),parsed=new Date(date+'T12:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||typeof data.available!=='boolean')throw new Error('Choose a valid date and availability.');
 if(date<sbBookingToday())throw new Error('Only today and future dates can be changed.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  let sheet=book.getSheetByName('Calendar availability');
  if(!sheet){sheet=book.insertSheet('Calendar availability');sheet.appendRow(['Date','Available','Updated at (UTC)']);sheet.setFrozenRows(1);}
  const headers=sheet.getRange(1,1,1,3).getValues()[0];if(JSON.stringify(headers)!==JSON.stringify(['Date','Available','Updated at (UTC)']))throw new Error('Calendar availability headers differ. Existing data was not changed.');
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues():[],index=rows.findIndex(row=>(row[0] instanceof Date?Utilities.formatDate(row[0],'Africa/Cairo','yyyy-MM-dd'):String(row[0]))===date),target=index<0?sheet.getLastRow()+1:index+2;
  sheet.getRange(target,1).setNumberFormat('@');sheet.getRange(target,1,1,3).setValues([[date,data.available,new Date().toISOString()]]);
  return {ok:true,blockedDates:sbCalendarAvailability(book),calendarAvailabilityReady:true};
 }finally{lock.releaseLock();}
}
function sbInstructorOverview(book) {
 const clientSheet=book.getSheetByName('Clients'),clients=clientSheet&&clientSheet.getLastRow()>1?clientSheet.getRange(2,1,clientSheet.getLastRow()-1,12).getValues():[],people=new Map(clients.filter(row=>row[0]).map(row=>[String(row[0]),row]));
 const sessionSheet=book.getSheetByName('Sessions'),sessions=sessionSheet&&sessionSheet.getLastRow()>1?sessionSheet.getRange(2,1,sessionSheet.getLastRow()-1,12).getValues():[],today=sbBookingToday(),now=Date.now();
 const classes=sessions.filter(row=>row[0]&&String(row[7])!=='cancelled'&&people.has(String(row[1]))).map(row=>({id:String(row[0]),clientId:String(row[1]),name:String(people.get(String(row[1]))[1]).replace(/^'/,''),date:String(row[3]),time:String(row[4]),startsAt:String(row[5]),number:Number(row[2]),program:String(row[10]||'').replace(/^'/,''),level:String(row[11]||'').replace(/^'/,'')})).filter(item=>Number.isFinite(Date.parse(item.startsAt))).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const logSheet=book.getSheetByName('EmailLog'),logs=logSheet&&logSheet.getLastRow()>1?logSheet.getRange(2,1,logSheet.getLastRow()-1,7).getValues():[],sent=new Map();
 for(const row of logs){if(row[4]!=='sent'||!row[5])continue;const key=String(row[1])+':'+String(row[2]),time=Date.parse(row[5]);if(Number.isFinite(time))sent.set(key,Math.max(sent.get(key)||0,time));}
 const attemptSheet=book.getSheetByName('Exam attempts'),attempts=attemptSheet&&attemptSheet.getLastRow()>1?attemptSheet.getRange(2,1,attemptSheet.getLastRow()-1,18).getValues():[],pendingReviews=[],reportsToPrepare=[];
 const normalize=value=>String(value||'').replace(/^'/,'').normalize('NFKC').trim().toLowerCase();
 for(const row of attempts){if(!row[0]||!row[6])continue;if(!row[11])pendingReviews.push({id:String(row[0]),name:String(row[2]).replace(/^'/,''),level:Number(row[3]),program:String(row[13]||'').replace(/^'/,''),submittedAt:String(row[6])});else{const client=clients.find(person=>normalize(person[1])===normalize(row[2]));if(!client||(sent.get(String(client[0])+':final')||0)<Date.parse(row[11]))reportsToPrepare.push({id:String(row[0]),clientId:client?String(client[0]):'',name:String(row[2]).replace(/^'/,''),level:Number(row[3]),reviewedAt:String(row[11])});}}
 const documentSheet=book.getSheetByName('TeacherDocuments'),documents=documentSheet&&documentSheet.getLastRow()>1?documentSheet.getRange(2,1,documentSheet.getLastRow()-1,4).getValues():[],latest=new Map(),drafts=[];
 for(const row of documents){let record;try{record=JSON.parse(String(row[3]));}catch{continue;}if(String(row[0]).startsWith('draft:')){if(record.values&&Object.values(record.values).some(value=>String(value).trim()))drafts.push({type:record.type,updatedAt:String(row[2])});continue;}if(!record.client?.id||!record.type)continue;const key=String(record.client.id)+':'+String(record.type),stamp=Date.parse(record.preparedAt||row[2]);if(!latest.has(key)||stamp>latest.get(key).stamp)latest.set(key,{record,stamp});}
 const preparedReports=[];for(const [key,entry]of latest){const record=entry.record;if(record.status==='sent'||record.sentAt||(sent.get(key)||0)>=entry.stamp)continue;preparedReports.push({id:record.id,clientId:record.client.id,name:record.client.name,type:record.type,title:record.title,preparedAt:record.preparedAt||''});}
 return {ok:true,today,refreshedAt:new Date().toISOString(),classes:classes.filter(item=>item.date===today),nextClass:classes.find(item=>Date.parse(item.startsAt)>=now)||null,zoomUrl:typeof SB_ZOOM_URL==='string'?SB_ZOOM_URL:'',pendingReviews,reportsToPrepare,preparedReports,drafts,registrationRequests:sbRegistrationRows(book).filter(row=>['awaiting','accepting'].includes(String(row[9]))).map(sbRegistrationView)};
}
function handleOwnerBooking(data){
 try{
  const props=PropertiesService.getScriptProperties(),book=sbExamBook();
  if(['listRegistrationRequests','reviewRegistration','retryRegistrationNotification'].includes(data.action))return sbExamResponse(handleRegistrationOwner(data,book));
  if(data.action==='instructorOverview')return sbExamResponse(sbInstructorOverview(book));
  if(data.action==='calendarAvailability')return sbExamResponse({ok:true,blockedDates:sbCalendarAvailability(book),calendarAvailabilityReady:true});
  if(data.action==='calendarSlots')return sbExamResponse(sbOwnerCalendarSlots(data));
  if(data.action==='saveCalendarSlots')return sbExamResponse(sbSaveCalendarSlots(data));
  if(data.action==='saveCalendarDay')return sbExamResponse(sbSaveCalendarDay(book,data));
  if(data.action==='checkStudentPortal')return sbExamResponse({ok:true,examsReady:['Exam attempts','Exam sessions','Portal access'].every(name=>Boolean(book.getSheetByName(name))),bookingReady:['Sessions','Booking requests'].every(name=>Boolean(book.getSheetByName(name))),notificationEmail:props.getProperty('SB_EXAM_NOTIFY_EMAIL')||'',remainingEmailQuota:MailApp.getRemainingDailyQuota()});
  if(data.action==='saveBookingSettings'){
   const email=String(data.notificationEmail||'').trim();
   if(typeof data.enabled!=='boolean')throw new Error('Choose whether booking is open.');
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Enter your notification email address.');
   if(!book.getSheetByName('Booking requests'))throw new Error('Run setupStudentPortal first.');
   props.setProperty('SB_BOOKING_ENABLED',String(data.enabled));props.setProperty('SB_EXAM_NOTIFY_EMAIL',email);
  }
  return sbExamResponse({ok:true,enabled:props.getProperty('SB_BOOKING_ENABLED')==='true',passcode:sbWeeklyPortalPasswords().passwords.calendar,notificationEmail:props.getProperty('SB_EXAM_NOTIFY_EMAIL')||''});
 }catch(error){return sbExamResponse({ok:false,error:error.message});}
}

function sbCountedSessionHours(book,id){const sheet=book.getSheetByName('Sessions');if(!sheet||sheet.getLastRow()<2)return 0;const rows=sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues(),ids=new Map();for(const row of rows)if(String(row[1])===id&&String(row[7])!=='cancelled'&&row[12]==='counted')ids.set(String(row[0]),sbSessionDuration(row)/60);return [...ids.values()].reduce((sum,value)=>sum+value,0);}
function sbApplySessionHours(book){
 const sessions=book.getSheetByName('Sessions'),clients=book.getSheetByName('Clients');if(!sessions||!clients)return;
 const props=PropertiesService.getScriptProperties(),first=props.getProperty('SB_SESSION_HOURS_READY')!=='1',today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
 sessions.getRange(1,13).setValue('Hours counted');clients.getRange(1,13,1,2).setValues([['Hours baseline','Hours baseline set at (UTC)']]);
 const people=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,14).getValues():[];
 for(let i=0;i<people.length;i++)if(people[i][0]&&people[i][12]===''){people[i][12]=Number(people[i][7])||0;clients.getRange(i+2,13,1,2).setValues([[people[i][12],new Date().toISOString()]]);}
 const rows=sessions.getLastRow()>1?sessions.getRange(2,1,sessions.getLastRow()-1,14).getValues():[];
 for(let i=0;i<rows.length;i++){const row=rows[i];if(row[0]&&/^\d{4}-\d{2}-\d{2}$/.test(String(row[3]))&&String(row[3])<today&&!row[12]){row[12]=String(row[3])<'2026-10-14'?'baseline':'counted';sessions.getRange(i+2,13).setValue(row[12]);}}
 props.setProperty('SB_SESSION_HOURS_READY','1');
 for(let i=0;i<people.length;i++){const person=people[i];if(!person[0])continue;const hours=sbCountedSessionHours(book,String(person[0]));const total=Math.round((Number(person[12])+hours)*100)/100;if(Number(person[7])!==total)clients.getRange(i+2,8).setValue(total);}
}
function sbSetClientHours(book,sheet,row,input){
 if(row>sheet.getLastRow())return Number(input.hours);
 const previous=sheet.getRange(row,1,1,14).getValues()[0];if(input.hoursChanged===false)return Number(previous[7]);
 const baseline=Number(input.hours)-sbCountedSessionHours(book,String(previous[0]));if(baseline<0)throw new Error('Hours include completed sessions. Cancel an incorrect session before reducing its counted hours.');sheet.getRange(row,13,1,2).setValues([[baseline,new Date().toISOString()]]);return Number(input.hours);
}
function updateSessionHours(){const lock=LockService.getScriptLock();lock.waitLock(20000);try{sbApplySessionHours(SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')));}finally{lock.releaseLock();}}
function enableAutomaticSessionHours(){updateSessionHours();if(!ScriptApp.getProjectTriggers().some(trigger=>trigger.getHandlerFunction()==='updateSessionHours'))ScriptApp.newTrigger('updateSessionHours').timeBased().everyDays(1).atHour(0).nearMinute(15).inTimezone('Africa/Cairo').create();}

// Read-only subscription feed for the instructor's personal calendar.
// Included in UnifiedCode.gs; add separately only in a multi-file project.
function sbPersonalCalendarSettings(data){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{const props=PropertiesService.getScriptProperties();let token=props.getProperty('SB_PERSONAL_CALENDAR_TOKEN');if(data.action==='resetPersonalCalendarLink'||!token){token=Utilities.getUuid()+Utilities.getUuid();props.setProperty('SB_PERSONAL_CALENDAR_TOKEN',token);}return {ok:true,token};}finally{lock.releaseLock();}
}
function sbCalendarEscape(value){return String(value||'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function sbCalendarUtc(milliseconds){return new Date(milliseconds).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
function sbCalendarFold(line){let bytes=0,part='',parts=[];for(const char of line){const size=char.codePointAt(0)<=0x7f?1:char.codePointAt(0)<=0x7ff?2:char.codePointAt(0)<=0xffff?3:4;if(bytes+size>75){parts.push(part);part=' ';bytes=1;}part+=char;bytes+=size;}parts.push(part);return parts.join('\r\n');}
function sbPersonalCalendarText(book){
 const clients=book.getSheetByName('Clients'),sessions=book.getSheetByName('Sessions');if(!clients||!sessions)throw new Error('Calendar is not ready.');
 const people=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,12).getValues():[],names=new Map(people.filter(row=>row[0]).map(row=>[String(row[0]),String(row[1]).replace(/^'/,'')]));
 const rows=sessions.getLastRow()>1?sessions.getRange(2,1,sessions.getLastRow()-1,15).getValues():[],lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Speak Boldly//Instructor Sessions//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Speak Boldly sessions','X-WR-TIMEZONE:Africa/Cairo','REFRESH-INTERVAL;VALUE=DURATION:PT1H','X-PUBLISHED-TTL:PT1H'],seen=new Set(),stamp=sbCalendarUtc(Date.now());
 for(const row of rows){const id=String(row[0]);if(!id||seen.has(id)||!names.has(String(row[1]))||!/^\d{4}-\d{2}-\d{2}$/.test(String(row[3]))||!/^\d{2}:\d{2}$/.test(String(row[4])))continue;seen.add(id);let starts;try{starts=sbCairoTimestamp(String(row[3]),String(row[4]));}catch{continue;}
  const program=String(row[10]||'English coaching').replace(/^'/,''),label=program+' — Session '+row[2],cancelled=row[7]==='cancelled',description='Client: '+names.get(String(row[1]))+'\nProgram: '+program+'\nRegistered course: '+String(row[14]||program)+'\nLevel: '+String(row[11]||'Not specified')+'\nSession: '+row[2]+(typeof SB_ZOOM_URL==='string'?'\nZoom: '+SB_ZOOM_URL:'');
  lines.push('BEGIN:VEVENT','UID:'+sbCalendarEscape(id)+'@speakboldly','DTSTAMP:'+stamp,'DTSTART:'+sbCalendarUtc(starts),'DTEND:'+sbCalendarUtc(starts+sbSessionDuration(row)*60*1000),'SUMMARY:'+sbCalendarEscape(names.get(String(row[1]))+' — '+label),'DESCRIPTION:'+sbCalendarEscape(description),'STATUS:'+(cancelled?'CANCELLED':'CONFIRMED'),'TRANSP:'+(cancelled?'TRANSPARENT':'OPAQUE'),'END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.map(sbCalendarFold).join('\r\n')+'\r\n';
}
function sbPersonalCalendarFeed(token){
 const props=PropertiesService.getScriptProperties(),expected=props.getProperty('SB_PERSONAL_CALENDAR_TOKEN');
 if(!expected||typeof token!=='string'||token!==expected)return ContentService.createTextOutput('Invalid calendar subscription link.').setMimeType(ContentService.MimeType.TEXT);
 const book=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID'));
 return ContentService.createTextOutput(sbPersonalCalendarText(book)).setMimeType(ContentService.MimeType.ICAL);
}

// Public Learning Hub requests. The recipient is fixed; visitors supply only a reply address.
function handleStudentInstructorContact(data) {
 const respond=typeof response==='function'?response:clientSyncResponse;
 const requestId=String(data.requestId||''),name=String(data.name||'').trim(),email=String(data.email||'').trim().toLowerCase(),message=String(data.message||'').trim();
 if(String(data.website||'')||! /^[a-zA-Z0-9-]{1,100}$/.test(requestId)||!name||name.length>100||/[\r\n]/.test(name)||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254||!message||message.length>4000)throw new Error('Check your name, email, and note before sending.');
 const props=PropertiesService.getScriptProperties(),sheetId=props.getProperty('CLIENT_SHEET_ID');if(!sheetId)throw new Error('Your instructor needs to finish the contact setup.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const book=SpreadsheetApp.openById(sheetId);let sheet=book.getSheetByName('Instructor requests');
  if(!sheet){sheet=book.insertSheet('Instructor requests');sheet.appendRow(['Request ID','Name','Reply email','Note','Received at (UTC)','Email status','Error']);sheet.setFrozenRows(1);}
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues():[],plain=value=>String(value).replace(/^'/,'');
  const existing=rows.find(row=>String(row[0])===requestId);
  if(existing){
   if(plain(existing[1])!==name||plain(existing[2])!==email||plain(existing[3])!==message)throw new Error('This request changed. Start a new note.');
   if(existing[5]==='sent')return respond({ok:true,status:'sent'});
   throw new Error('Your note is saved, but email delivery could not be confirmed. Please wait for your instructor to check it before sending again.');
  }
  const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
  const daily=rows.filter(row=>Utilities.formatDate(new Date(row[4]),'Africa/Cairo','yyyy-MM-dd')===today);
  if(daily.length>=50||daily.filter(row=>plain(row[2])===email).length>=3)throw new Error('The daily request limit has been reached. Please try again tomorrow.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Email is temporarily unavailable. Please try again later.');
  const rowNumber=sheet.getLastRow()+1;sheet.appendRow([requestId,"'"+name,"'"+email,"'"+message,new Date().toISOString(),'sending','']);SpreadsheetApp.flush();
  const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const content='<p><strong>Name:</strong> '+escape(name)+'<br><strong>Reply email:</strong> '+escape(email)+'</p><p style="white-space:pre-wrap">'+escape(message)+'</p>';
  const htmlBody=typeof sbBrandedEmail==='function'?sbBrandedEmail('Learning Hub request',content):'<html><body style="font-family:Arial,sans-serif;color:#193c32"><h2>Learning Hub request</h2>'+content+'<p>Speak Boldly</p></body></html>';
  try{
   MailApp.sendEmail({to:'speakboldly16@gmail.com',replyTo:email,name:'Speak Boldly',subject:'Learning Hub request — '+name,body:'How can I help you?\n\nName: '+name+'\nReply email: '+email+'\n\n'+message+'\n\nSpeak Boldly',htmlBody});
   sheet.getRange(rowNumber,6,1,2).setValues([['sent','']]);return respond({ok:true,status:'sent'});
  }catch(error){sheet.getRange(rowNumber,6,1,2).setValues([['delivery_unknown',String(error.message||error)]]);throw new Error('Your note is saved, but email delivery could not be confirmed. Please wait for your instructor to check it before sending again.');}
 }finally{lock.releaseLock();}
}

// Included in UnifiedCode.gs. Registration requests are private until approved.
const SB_REGISTRATION_HEADERS=['Request ID','Name','Email','Program','Payment claimed','Appointment type','Date (Cairo)','Time (Cairo)','Duration (minutes)','Status','Created at (UTC)','Client ID','Session ID','Decided at (UTC)','Notification status','Notification error'];
const SB_PAYMENT_EMAIL='speakboldly16@gmail.com';
function sbRegistrationType(kind,program){
 const types={placement:{title:'Placement test',duration:30,program:'Assessment'},session:{title:'Session',duration:90},workshop:{title:'Workshop',duration:90},trial:{title:'Trial session',duration:60,program:'Trial session'}};
 if(!Object.prototype.hasOwnProperty.call(types,String(kind)))throw new Error('Choose Session, Workshop, Placement test, or Trial session.');
 return {...types[kind],...(kind==='session'&&program==='English Momentum'?{duration:60}:{})};
}
function sbRegistrationSlots(date,kind,program){
 const type=sbRegistrationType(kind,program),slots=[];
 for(const slot of sbBookingSlots(date).filter(slot=>slot.enabled!==false)){
  const [hour,minute]=slot.time.split(':').map(Number),first=hour*60+minute;const end=slot.endTime?Number(slot.endTime.slice(0,2))*60+Number(slot.endTime.slice(3)):first+90;
  for(let offset=0;offset+type.duration<=end-first;offset+=type.duration){const start=first+offset,end=start+type.duration,format=value=>String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');slots.push({time:format(start),endTime:format(end),label:format(start)+'–'+format(end),duration:type.duration});}
 }
 return slots;
}
function sbRegistrationSheet(book,create=false){
 let sheet=book.getSheetByName('Registration requests');
 if(!sheet&&create){sheet=book.insertSheet('Registration requests');sheet.appendRow(SB_REGISTRATION_HEADERS);sheet.setFrozenRows(1);}
 if(sheet&&JSON.stringify(sheet.getRange(1,1,1,SB_REGISTRATION_HEADERS.length).getValues()[0])!==JSON.stringify(SB_REGISTRATION_HEADERS))throw new Error('Registration requests headers differ. Existing records were kept.');
 return sheet;
}
function sbRegistrationView(row){
 return {id:String(row[0]),name:String(row[1]).replace(/^'/,''),email:String(row[2]).replace(/^'/,''),program:String(row[3]).replace(/^'/,''),paid:String(row[4]),kind:String(row[5]),date:String(row[6]),time:String(row[7]),duration:Number(row[8]),status:String(row[9]),createdAt:String(row[10]),clientId:String(row[11]),sessionId:String(row[12]),decidedAt:String(row[13]),notificationStatus:String(row[14]),notificationError:String(row[15])};
}
function sbRegistrationRows(book){const sheet=sbRegistrationSheet(book);return sheet?sbBookingRows(sheet,SB_REGISTRATION_HEADERS.length):[];}
function sbRegistrationNotify(sheet,index,row){
 if(['sent','sending'].includes(String(row[14])))return;
 try{
  const to=SB_PAYMENT_EMAIL;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL to your notification address.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
  const item=sbRegistrationView(row),type=sbRegistrationType(item.kind,item.program),slot=sbRegistrationSlots(item.date,item.kind,item.program).find(slot=>slot.time===item.time);
  const url='https://loudandconfident.github.io/Speakboldly/instructor.html?bookingRequest='+encodeURIComponent(item.id);
  const lines=['Name: '+item.name,'Email: '+item.email,'Program: '+item.program,'Appointment: '+type.title,'Date: '+item.date,'Time: '+sbDisplayTime(item.time)+'–'+sbDisplayTime(slot?.endTime||'')+' (Cairo time)','Duration: '+type.duration+' minutes','Payment reported by student: '+item.paid,'',item.kind==='trial'?'Trial session: no payment screenshot required.':'Payment screenshots are sent separately to '+SB_PAYMENT_EMAIL+'. Check payment before approving.','','Accept: '+url+'&decision=accept','Decline: '+url+'&decision=decline','','Sign in to the Instructor Portal and confirm your decision. The slot is not reserved until accepted.','','Speak Boldly'];
  row[14]='sending';row[15]='';sheet.getRange(index+2,1,1,16).setValues([row]);
  MailApp.sendEmail({to,subject:'Registration request — '+type.title+' — '+item.name,body:lines.join('\n'),name:'Speak Boldly'});row[14]='sent';
 }catch(error){row[14]=row[14]==='sending'?'delivery_unknown':'failed';row[15]=sbExamSafe(error.message);}
 sheet.getRange(index+2,1,1,16).setValues([row]);
}
function sbRegistrationCalendar(data,book){
 const kind=String(data.kind||'session'),type=sbRegistrationType(kind,String(data.program||'')),window=sbBookingWindow(),today=window.start,month=String(data.month||today.slice(0,7));
 if(!/^\d{4}-\d{2}$/.test(month)||Number(month.slice(5))<1||Number(month.slice(5))>12||month<today.slice(0,7)||month>window.end.slice(0,7))throw new Error('Booking is available only within the next six weeks.');
 const busy=sbBookingBusy(book),blocked=new Set(sbCalendarAvailability(book)),[year,m]=month.split('-').map(Number),count=new Date(Date.UTC(year,m,0)).getUTCDate(),days=[];
 for(let day=1;day<=count;day++){
  const date=month+'-'+String(day).padStart(2,'0'),available=!blocked.has(date)&&date>=today&&date<=window.end;
  const slots=sbRegistrationSlots(date,kind,String(data.program||'')).map(slot=>{const start=sbCairoTimestamp(date,slot.time);return {...slot,date,status:start<=Date.now()?'past':sbBookingOverlap(start,busy,[],type.duration)?'taken':!available?'unavailable':'available'};});days.push({date,available,slots});
 }
 return {ok:true,registrationVersion:1,month,today,kind,duration:type.duration,timeZone:'Africa/Cairo',windowStart:today,windowEnd:window.end,days};
}
function sbSubmitRegistration(data,book){
 const name=String(data.name||'').normalize('NFKC').trim().replace(/\s+/g,' '),email=String(data.email||'').trim().toLowerCase(),kind=String(data.kind||''),type=sbRegistrationType(kind,String(data.program||'').trim()),program=String(data.program||(kind==='placement'?'Assessment':kind==='trial'?'Trial session':kind==='workshop'?'Workshop':'Session')).trim(),paid=String(data.paid||''),id=String(data.requestId||''),date=String(data.date||''),time=String(data.time||'');
 if(!name||name.length>100||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Enter your name and a valid email address.');
 if((!SB_SESSION_PROGRAMS.includes(program)&&!['Session','Workshop'].includes(program))||(['session','workshop'].includes(kind)&&['Assessment','Trial session'].includes(program)))throw new Error('Choose the course you are registering for.');if(kind==='workshop'&&program!=='Workshop'&&!/workshop/i.test(program))throw new Error('Choose a workshop program.');
 if(!['yes','no','not-required'].includes(paid)||! /^[A-Za-z0-9-]{1,100}$/.test(id))throw new Error('Choose your payment status and retry.');
 if(program==='Make-up / revision session'&&(kind!=='session'||sbBookingRows(book.getSheetByName('Clients'),3).filter(person=>String(person[2]).replace(/^'/,'').trim().toLowerCase()===email).length!==1))throw new Error('Make-up / revision sessions are for already enrolled clients. Use your registered email and choose Session.');
 const sheet=sbRegistrationSheet(book,true),rows=sbBookingRows(sheet,16),fingerprint=row=>[String(row[1]).replace(/^'/,''),String(row[2]).replace(/^'/,''),String(row[3]).replace(/^'/,''),String(row[4]),String(row[5]),String(row[6]),String(row[7])].join('|'),values=[name,email,program,paid,kind,date,time].join('|');
 let index=rows.findIndex(row=>String(row[0])===id);
 if(index>=0){if(fingerprint(rows[index])!==values)throw new Error('This request changed. Start a new request.');return {ok:true,requestId:id,status:String(rows[index][9]),notificationStatus:String(rows[index][14])};}
 const same=rows.find(row=>['awaiting','accepting'].includes(String(row[9]))&&fingerprint(row)===values);if(same)return {ok:true,requestId:String(same[0]),status:String(same[9]),notificationStatus:String(same[14])};
 if(rows.filter(row=>String(row[2]).replace(/^'/,'')===email&&['awaiting','accepting'].includes(String(row[9]))).length>=5)throw new Error('You already have five pending requests. Contact your instructor before requesting more.');
 const window=sbBookingWindow();if(date<window.start||date>window.end||sbCalendarDateBlocked(date,book))throw new Error('This date is unavailable.');
 if(!sbRegistrationSlots(date,kind,program).some(slot=>slot.time===time))throw new Error('Choose an available start time for this appointment type.');
 const start=sbCairoTimestamp(date,time);if(start<=Date.now()||sbBookingOverlap(start,sbBookingBusy(book),[],type.duration))throw new Error('This slot is no longer available. Refresh the calendar.');
 if(rows.filter(row=>String(row[10]).slice(0,10)===new Date().toISOString().slice(0,10)).length>=50)throw new Error('The daily registration request limit has been reached. Contact your instructor.');
 const row=[id,sbExamSafe(name),sbExamSafe(email),sbExamSafe(program),paid,kind,date,time,type.duration,'awaiting',new Date().toISOString(),'','','','',''];sheet.getRange(sheet.getLastRow()+1,7,1,2).setNumberFormat('@');sheet.appendRow(row);index=sheet.getLastRow()-2;sbRegistrationNotify(sheet,index,row);
 return {ok:true,requestId:id,status:'awaiting',notificationStatus:String(row[14])};
}
function sbRegistrationClient(book,row,data){
 const sheet=book.getSheetByName('Clients'),rows=sbBookingRows(sheet,14),email=String(row[2]).replace(/^'/,''),matches=rows.filter(person=>String(person[2]).replace(/^'/,'').trim().toLowerCase()===email),existing=row[11]?rows.find(person=>String(person[0])===String(row[11])):matches[0];
 if(matches.length>1)throw new Error('More than one client uses this email. Resolve the duplicate client records first.');
 if(data.clientId&&(!existing||String(existing[0])!==String(data.clientId)))throw new Error('The client record changed. Refresh before accepting.');
 if(existing)return {sheet,row:existing,index:rows.findIndex(person=>String(person[0])===String(existing[0]))+2,isNew:false};
 const normalize=value=>String(value).replace(/^'/,'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
 if(rows.some(person=>normalize(person[1])===normalize(row[1])))throw new Error('A client with this name has a different email. Update their record before accepting.');
 const used=new Set(rows.map(person=>String(person[3]).padStart(4,'0'))),reserved=PropertiesService.getScriptProperties().getProperty('SB_INSTRUCTOR_CODE');
 let code;for(let value=1000;value<=9999;value++){const candidate=String(value);if(!used.has(candidate)&&candidate!==reserved&&candidate!=='1962'){code=candidate;break;}}if(!code)throw new Error('No student codes are available.');
 return {sheet,row:[String(row[11]||'registration-'+Utilities.getUuid()),row[1],row[2],code,sbExamSafe(String(data.level||'Not assessed')),'Unpaid',0,0,new Date().toISOString(),'[]','[]',row[3],0,new Date().toISOString()],index:sheet.getLastRow()+1,isNew:true};
}
function handleRegistrationOwner(data,book){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sheet=sbRegistrationSheet(book),rows=sheet?sbBookingRows(sheet,16):[];
  if(data.action==='listRegistrationRequests')return {ok:true,requests:rows.filter(row=>['awaiting','accepting'].includes(String(row[9]))).map(sbRegistrationView)};
  const index=rows.findIndex(row=>String(row[0])===String(data.requestId));if(index<0)throw new Error('Registration request not found.');const row=rows[index];
  if(data.action==='retryRegistrationNotification'){if(row[14]!=='failed')throw new Error('Only a failed notification can be retried. Check delivery before retrying uncertain messages.');sbRegistrationNotify(sheet,index,row);return {ok:true,request:sbRegistrationView(row)};}
  if(!['accept','decline'].includes(data.decision))throw new Error('Choose Accept or Decline.');
  if(row[9]==='accepted'||row[9]==='declined'){if(row[9]!==({accept:'accepted',decline:'declined'}[data.decision]))throw new Error('This request was already decided.');return {ok:true,request:sbRegistrationView(row)};}
  if(data.decision==='decline'){if(row[9]==='accepting')throw new Error('Acceptance is in progress. Retry Accept to finish safely.');row[9]='declined';row[13]=new Date().toISOString();sheet.getRange(index+2,1,1,16).setValues([row]);return {ok:true,request:sbRegistrationView(row)};}
  const payment=String(data.payment||''),level=String(data.level||'Not assessed');if(!['Paid','Part paid','Unpaid'].includes(payment)||!(/^[1-9]\d{0,3}$/.test(level)||['Not assessed','A1','A2','B1','B2','C1','C2'].includes(level)))throw new Error('Choose the verified payment status and level.');
  const requestedCourse=String(row[3]).replace(/^'/,''),course=['Session','Workshop'].includes(requestedCourse)?String(data.program||''):requestedCourse;if(['session','workshop'].includes(String(row[5]))&&(!SB_SESSION_PROGRAMS.includes(course)||['Assessment','Trial session'].includes(course)))throw new Error('Choose the registered program before accepting this session.');if(String(row[5])==='workshop'&&!/workshop/i.test(course))throw new Error('Choose the registered workshop.');
  const type=sbRegistrationType(String(row[5]),course);if(type.duration!==Number(row[8]))throw new Error('The program duration does not match this booking. Ask for a booking from the correct program.');const program=type.program||course,start=sbCairoTimestamp(String(row[6]),String(row[7])),sessions=sbSessionsSheet(),sessionRows=sbBookingRows(sessions,14),saved=row[12]?sessionRows.find(item=>String(item[0])===String(row[12])):null;
  if(!saved){if(!sbRegistrationSlots(String(row[6]),String(row[5]),course).some(slot=>slot.time===String(row[7])))throw new Error('This availability window was removed or dimmed. Ask the student to choose another slot.');const window=sbBookingWindow();if(start<=Date.now()||String(row[6])>window.end||sbCalendarDateBlocked(String(row[6]),book))throw new Error('This date is no longer available. Ask the student to choose another slot.');if(sbBookingOverlap(start,sbBookingBusy(book),[],type.duration))throw new Error('This slot has been taken. Decline this request or ask the student to choose another slot.');}
  const client=sbRegistrationClient(book,row,data),number=sessionRows.filter(item=>String(item[1])===String(client.row[0])&&String(item[10]||'')===program).reduce((max,item)=>Math.max(max,Number(item[2])||0),0)+1;
  const plan={clientId:String(client.row[0]),number,date:String(row[6]),time:String(row[7]),program,course,level,duration:type.duration};
  if(!saved)row[12]=sbSessionId(plan);row[11]=String(client.row[0]);row[9]='accepting';sheet.getRange(index+2,1,1,16).setValues([row]);
  if(client.isNew){client.row[11]=sbExamSafe(course);client.sheet.getRange(1,10,1,5).setValues([['Permissions','Level history','Program','Hours baseline','Hours baseline set at (UTC)']]);client.row[5]=payment;client.sheet.getRange(client.index,4).setNumberFormat('@');client.sheet.getRange(client.index,1,1,14).setValues([client.row]);}else if(!saved){client.sheet.getRange(client.index,6).setValue(payment);}
  if(!saved){plan.number=number;const plannedId=sbSessionId(plan);if(plannedId!==String(row[12]))throw new Error('The client session numbers changed while accepting. Contact your instructor before retrying.');sbSaveSheetSession(plan);}
  row[9]='accepted';row[13]=new Date().toISOString();sheet.getRange(index+2,1,1,16).setValues([row]);
  return {ok:true,request:sbRegistrationView(row)};
 }finally{lock.releaseLock();}
}


const SB_EXAM_V2_KEYS = {"1": {"C": [0, 1, 2, 0, 1], "D": ["has", "went", "are", "studying", "swim"], "F": ["I live in Cairo.", "Where are you going?", "I don’t know.", "Mira said, “Hello.”", "We bought bread, milk and eggs."]}, "2": {"C": [1, 0, 2, 1, 0], "D": ["heavier", "already", "will", "for", "to"], "F": ["I live in Cairo.", "Where are you going?", "I don’t know.", "Mira said, “Hello.”", "We bought bread, milk and eggs."]}, "3": {"C": [1, 0, 2, 1, 1], "D": ["since", "built", "if", "check", "begun"], "F": ["I live in Cairo.", "Where are you going?", "I don’t know.", "Mira said, “Hello.”", "We bought bread, milk and eggs."]}, "4": {"C": [0, 1, 2, 0, 1], "D": ["would", "have", "for", "lived", "be"], "F": ["I live in Cairo.", "Where are you going?", "I don’t know.", "Mira said, “Hello.”", "We bought bread, milk and eggs."]}, "5": {"C": [0, 1, 1, 2, 0], "D": ["meeting", "breaking", "would", "be", "in"], "F": ["I live in Cairo.", "Where are you going?", "I don’t know.", "Mira said, “Hello.”", "We bought bread, milk and eggs."]}, "6": {"C": [1, 0, 2, 1, 0], "D": ["would", "be", "than", "reconsider", "being"], "F": ["I live in Cairo.", "Where are you going?", "I don’t know.", "Mira said, “Hello.”", "We bought bread, milk and eggs."]}, "7": {"A": [1, 0, 2, 0, 1, 2, 0, 1, 2, 0], "B": ["Not only was the plan expensive, but it was also impractical.", "I would rather you had told me yesterday.", "Although the evidence was limited, they made a decision.", "She objected to being excluded.", "Had I known about the delay, I would have called."], "C": [1, 0, 2, 1, 0], "D": ["than", "on", "verified", "took", "stay"], "F": ["However, the results remain uncertain.", "The manager’s decision surprised us.", "Mira asked, “Have you checked the source?”", "We need three things: time, funding and support.", "If the figures change, we will review the plan."]}, "8": {"A": [0, 1, 2, 0, 1, 2, 0, 1, 2, 0], "B": ["Were the results different, we would reconsider.", "The committee demanded that the source be disclosed.", "Scarcely had she arrived when the meeting began.", "The claim, which lacks supporting evidence, is misleading.", "He spoke as if he had known the answer all along."], "C": [1, 2, 0, 1, 2], "D": ["to", "for", "be", "when", "draw"], "F": ["Nevertheless, the evidence is not conclusive.", "The researcher’s findings were published on Monday.", "The report asks, “Can we verify this claim?”", "The tool has one major limitation: it cannot verify its own sources.", "Although the answer sounded convincing, it was incorrect."]}};
function sbExamV2Marks(level,answers){
 const old=SB_EXAM_OBJECTIVE_KEYS[level]||SB_EXAM_V2_KEYS[level],key=SB_EXAM_V2_KEYS[level];if(!old||!key)return null;
 const choice=(values,section)=>{const items=values.map((expected,i)=>{const accepted=Array.isArray(expected)?expected:[expected],answer=answers[section]?.[i+1];return {number:i+1,accepted,answer:answer===undefined?null:answer,correct:accepted.includes(Number(answer))&&answer!==undefined&&answer!==''};});return {score:items.filter(x=>x.correct).length,outOf:items.length,complete:true,items};};
 const written=(values,section,strict=false)=>{const normalize=value=>strict?String(value||'').normalize('NFKC').replace(/[“”]/g,'"').replace(/[‘’]/g,"'").replace(/, and /g,' and ').replace(/\s+/g,' ').trim():sbExamNormalizeCorrection(value);const items=values.map((expected,i)=>{const answer=String(answers[section]?.[i+1]||'');return {number:i+1,expected,answer,status:!answer.trim()?'unanswered':normalize(answer)===normalize(expected)?'correct':section==='D'?'incorrect':'review'};});return {score:items.filter(x=>x.status==='correct').length,outOf:items.length,complete:!items.some(x=>x.status==='review'),items};};
 return {A:choice(old.A.slice(0,10),'A'),B:written(old.B.slice(0,5),'B'),C:choice(key.C,'C'),D:written(key.D,'D'),F:written(key.F,'F',true)};
}
function sbExamV2Answers(value){
 const answers={examVersion:2,A:{},B:{},C:{},D:{},E:'',F:{}};
 for(const section of ['A','B','C','D','F']){const entries=value[section]||{};if(typeof entries!=='object'||Array.isArray(entries))throw new Error('Invalid answers.');for(const key of Object.keys(entries)){if(!/^[1-9]\d?$/.test(key)||Number(key)>(section==='A'?10:5))throw new Error('Invalid question number.');const answer=entries[key];if(section==='A'||section==='C'){if(!Number.isInteger(Number(answer))||String(answer)===''||Number(answer)<0||Number(answer)>2)throw new Error('Invalid multiple-choice answer.');answers[section][key]=Number(answer);}else{if(typeof answer!=='string'||answer.length>5000)throw new Error('Answer too long.');answers[section][key]=answer;}}}
 if(value.E!==undefined&&(typeof value.E!=='string'||value.E.length>15000))throw new Error('Writing answer too long.');answers.E=value.E||'';if(JSON.stringify(answers).length>40000)throw new Error('Your answers are too long to save.');return answers;
}


function sbCalendarSlotRevision(date){return sbExamHash(PropertiesService.getScriptProperties().getProperty('SB_CALENDAR_SLOTS_'+date)||'default');}
function sbOwnerCalendarSlots(data){
 const month=String(data.month||sbBookingToday().slice(0,7));if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('Choose a calendar month.');const [year,m]=month.split('-').map(Number),days={},revisions={};for(let n=1;n<=new Date(Date.UTC(year,m,0)).getUTCDate();n++){const date=month+'-'+String(n).padStart(2,'0');days[date]=sbBookingSlots(date);revisions[date]=sbCalendarSlotRevision(date);}return {ok:true,days,revisions};
}
function sbSaveCalendarSlots(data){
 const lock=LockService.getScriptLock();lock.waitLock(20000);try{const date=String(data.date||''),parsed=new Date(date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||date<sbBookingToday())throw new Error('Choose today or a future date.');if(data.revision!==sbCalendarSlotRevision(date))throw new Error('The slots changed on another device. Refresh the calendar before editing.');if(!Array.isArray(data.slots)||data.slots.length>24)throw new Error('Use up to 24 availability windows per day.');const slots=data.slots.map(item=>{const time=String(item.time||''),endTime=String(item.endTime||'');if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||endTime<=time||typeof item.enabled!=='boolean')throw new Error('Enter a valid start, later end time, and access setting.');return {time,endTime,enabled:item.enabled,label:time+'–'+endTime};}).sort((a,b)=>a.time.localeCompare(b.time));for(let i=1;i<slots.length;i++)if(slots[i].time<slots[i-1].endTime)throw new Error('Availability windows must not overlap.');PropertiesService.getScriptProperties().setProperty('SB_CALENDAR_SLOTS_'+date,JSON.stringify(slots));return {ok:true,date,slots,revision:sbCalendarSlotRevision(date)};}finally{lock.releaseLock();}
}


function sbDisplayTime(value){const match=String(value||'').match(/^(\d{1,2}):(\d{2})$/);if(!match)return String(value||'');const hour=Number(match[1]);return (hour%12||12)+':'+match[2]+' '+(hour<12?'AM':'PM');}
function sbSaveSessionSeries(p){
 if(!Array.isArray(p.sessions)||p.sessions.length<1||p.sessions.length>52)throw new Error('Choose between 1 and 52 weekly appointments.');
 const sheet=sbSessionsSheet(),existing=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues():[],clients=sbExamBook().getSheetByName('Clients'),ids=clients&&clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,1).getValues().map(row=>String(row[0])):[],seen=new Set();
 const first=p.sessions[0],planned=p.sessions.map((input,index)=>{const record={...input,clientId:String(input.clientId||''),number:Number(input.number),date:String(input.date||''),time:String(input.time||''),program:String(input.program||''),level:String(input.level||'')};const date=new Date(String(first.date)+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+index*7);if(record.clientId!==first.clientId||record.program!==first.program||record.time!==first.time||record.level!==String(first.level||'')||record.number!==Number(first.number)+index||record.date!==date.toISOString().slice(0,10))throw new Error('Use the same client, program, weekday and time with consecutive session numbers.');if(!ids.includes(record.clientId)||!Number.isInteger(record.number)||record.number<1||record.number>9999||!SB_SESSION_PROGRAMS.includes(record.program))throw new Error('Check the client, program and session numbers.');if(record.level&&!/^[1-9]\d{0,3}$/.test(record.level)&&!['Not assessed','A1','A2','B1','B2','C1','C2'].includes(record.level))throw new Error('Choose a valid session level.');if(record.course&&(!SB_SESSION_PROGRAMS.includes(record.course)||['Assessment','Trial session'].includes(record.course)))throw new Error('Choose a valid course.');const id=sbSessionId(record),start=sbCairoTimestamp(record.date,record.time),duration=record.program==='Assessment'?30:['Trial session','English Momentum'].includes(record.program)?60:90;if(seen.has(id))throw new Error('Duplicate appointment.');seen.add(id);const saved=existing.find(row=>String(row[0])===id);if(saved){if(String(saved[7])==='cancelled')throw new Error('A planned appointment was cancelled. Refresh before booking this series.');return record;}if(start<=Date.now()||sbCalendarDateBlocked(record.date))throw new Error(record.date+' is past or dimmed. No new appointments were added.');if(existing.some(row=>String(row[7])!=='cancelled'&&start<Date.parse(row[5])+sbSessionDuration(row)*60000&&start+duration*60000>Date.parse(row[5])))throw new Error('An appointment overlaps on '+record.date+'. No new appointments were added.');if(existing.some(row=>String(row[1])===record.clientId&&Number(row[2])===record.number&&String(row[10])===record.program&&String(row[0])!==id&&String(row[7])!=='cancelled'))throw new Error('Session '+record.number+' already exists for this client and program.');return record;});
 // Complete validation happens before any write. Stable IDs make a retry safe after a partial Sheets failure.
 for(const record of planned)sbSaveSheetSession(record);return planned.length;
}
