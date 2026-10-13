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

function doGet() {
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
    if (!event || !event.postData ||
        event.postData.contents.length > 8000000) {
      throw new Error('Invalid request.');
    }

    const data = JSON.parse(event.postData.contents);
    if (SB_PUBLIC_BOOKING_ACTIONS.includes(data.action)) {if(event.postData.contents.length>20000)throw new Error('Request too large.');return handlePublicBooking(data);}
    if (SB_STUDENT_EXAM_ACTIONS.includes(data.action)) {
      if (event.postData.contents.length > 65000) throw new Error('Request too large.');
      return handleStudentExam(data);
    }
    const properties = PropertiesService.getScriptProperties();
    const key = properties.getProperty('CLIENT_SYNC_KEY');

    if (!key || data.key !== key) {
      throw new Error('Incorrect connection key.');
    }

    const sheetId = properties.getProperty('CLIENT_SHEET_ID');
    if (!sheetId) {
      throw new Error('Run setupClientSync first.');
    }

    const sheet = SpreadsheetApp
      .openById(sheetId)
      .getSheetByName('Clients');

    if (!sheet) {
      throw new Error('Clients tab is missing.');
    }

    if(!['sendClientEmail','uploadLibraryFile'].includes(data.action)&&event.postData.contents.length>20000)throw new Error('Request too large.');
    if (SB_OWNER_BOOKING_ACTIONS.includes(data.action)) return handleOwnerBooking(data);
    if (SB_INSTRUCTOR_EXAM_ACTIONS.includes(data.action)) return handleInstructorExam(data);
    if(data.action==='sendClientEmail')return handleClientEmail(data);
    if(['listLibrary','uploadLibraryFile','readLibraryFile','sendLibraryFile'].includes(data.action))return handleLibraryAction(data);

    if(data.action==='deleteClient')return response(sbDeleteClientRecord(data));
    if (data.action === 'checkConnection') {
      return response({ ok: true, connected: true });
    }

    if(['listTeacherDocuments','saveTeacherDocument'].includes(data.action)){if(typeof handleSheetDocumentAction!=='function')throw new Error('Update your Clients Apps Script to enable shared reports.');return handleSheetDocumentAction(data);}

    if (['listSessions', 'saveSession', 'cancelSession'].includes(data.action)) {
      return handleSheetSessionAction(data);
    }

    if (data.action !== 'upsertClient' || !data.client) {
          if (data.action === 'listClients') {
      lock.waitLock(20000);sbApplySessionHours(SpreadsheetApp.openById(sheetId));
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


      throw new Error('Invalid action.');
    }

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

  } catch (error) {
    return response({ ok: false, error: error.message });
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}

// Add this file to the existing Clients Apps Script project.
// Run setupSheetReminders once to create the calendar; emails are sent only from Authorize.
const SB_SESSION_HEADERS=['Session ID','Client ID','Session number','Date (Cairo)','Time (Cairo)','Starts at (UTC)','Remind at (UTC)','Status','Sent at (UTC)','Last error','Program','Level'];
const SB_SESSION_PROGRAMS=["Trial session", "General English — 8 sessions", "General English — 4 sessions", "One Session", "Interview preparation workshop", "E-mail and business writing workshop", "Meetings, presentation and public speaking workshop", "IELTS preparation", "Pronunciation workshop", "English for Information Technology", "Let the kids speak!", "The different learners", "Instructor training"];
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
function sbListSheetSessions(){
 const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues():[];
 return rows.filter(r=>r[0]).map(r=>({id:String(r[0]),clientId:String(r[1]),number:Number(r[2]),date:String(r[3]),time:String(r[4]),name:'',program:String(r[10]||'').replace(/^'/,''),level:String(r[11]||'').replace(/^'/,''),reminderStatus:String(r[7]),reminderAt:new Date(r[6]).toISOString(),sentAt:r[8]?new Date(r[8]).toISOString():null}));
}
function sbSaveSheetSession(input,allowPast=false){
 const c={clientId:String(input.clientId||''),number:Number(input.number),date:String(input.date||''),time:String(input.time||''),program:String(input.program||'').trim(),level:String(input.level||'').trim()};
 if(c.program&&!SB_SESSION_PROGRAMS.includes(c.program))throw new Error('Choose a valid program.');
 if(c.level&&!/^[1-9]\d{0,3}$/.test(c.level)&&!['Not assessed','A1','A2','B1','B2','C1','C2'].includes(c.level))throw new Error('Choose a valid session level.');
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(c.clientId)||!Number.isInteger(c.number)||c.number<1||c.number>9999)throw new Error('Choose an existing client and valid session number.');
 const starts=sbCairoTimestamp(c.date,c.time),id=sbSessionId(c),sheet=sbSessionsSheet();
 const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues():[];
 const existing=rows.find(r=>String(r[0])===id);
 if(existing)return id; // Retries never create duplicate reminders or restore cancelled classes.
 if(starts<=Date.now()&&!allowPast)throw new Error('Choose a future session.');
 if(starts>Date.now()&&rows.some(row=>String(row[7])!=='cancelled'&&starts<Date.parse(row[5])+90*60000&&starts+90*60000>Date.parse(row[5])))throw new Error('This time overlaps an existing appointment.');
 const clients=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
 const ids=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,1).getValues():[];
 if(!ids.some(r=>String(r[0])===c.clientId))throw new Error('Save this client to the Clients sheet first.');
 const row=sheet.getLastRow()+1;sheet.getRange(row,4,1,2).setNumberFormat('@');
 sheet.getRange(row,1,1,12).setValues([[id,c.clientId,c.number,c.date,c.time,new Date(starts).toISOString(),new Date(starts-86400000).toISOString(),starts<=Date.now()?'expired':'pending','','',c.program,c.level]]);
 return id;
}
function handleSheetSessionAction(p){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(p.action==='saveSession'){if(!p.session)throw new Error('Session missing.');sbSaveSheetSession(p.session,p.importPast===true);}
  if(p.action==='cancelSession'){
   const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues():[],index=rows.findIndex(r=>String(r[0])===String(p.sessionId));
   if(index<0)throw new Error('Session not found.');
   if(rows[index][7]==='sending')throw new Error('A reminder is being sent. Try again shortly.');
   sheet.getRange(index+2,8).setValue('cancelled');
  }
  const props=PropertiesService.getScriptProperties();
  const ready=typeof handleClientEmail==='function';
  const respond=typeof clientSyncResponse==='function'?clientSyncResponse:response;
  return respond({ok:true,classes:sbListSheetSessions(),emailReady:ready});
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
const SB_ZOOM_URL='https://us06web.zoom.us/j/79051707388';
const SB_ZOOM_PASSCODE='7P1NpA';
function sbEmailEscape(value){return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function sbBrandedEmail(title,content){
 return '<!doctype html><html><body style="margin:0;background:#faf9f4;font-family:Arial,sans-serif;color:#193c32"><table role="presentation" style="width:100%;max-width:600px;margin:auto;background:#fffef9;border-collapse:collapse"><tr><td style="padding:28px 28px 12px"><img src="'+SB_EMAIL_LOGO+'" width="58" height="58" alt="Speak Boldly logo" style="display:block;border-radius:10px"><h1 style="font-size:24px;margin:18px 0">'+sbEmailEscape(title)+'</h1></td></tr><tr><td style="padding:0 28px 28px;font-size:15px;line-height:1.7">'+content+'<p style="margin-top:28px">Speak Boldly</p></td></tr></table></body></html>';
}
function sbUpcomingClientMeetings(book,clientId){
 const sheet=book.getSheetByName('Sessions');if(!sheet||sheet.getLastRow()<2)return [];
 return sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues().filter(r=>String(r[1])===String(clientId)&&String(r[7])!=='cancelled'&&Number.isFinite(Date.parse(r[5]))&&Date.parse(r[5])>Date.now()).sort((a,b)=>Date.parse(a[5])-Date.parse(b[5]));
}
function sbEmailProgramName(value){return value==='Trial session'?'Conversation-based General English — Trial session':String(value||'').replace(/^General English/,'Conversation-based General English');}
function sbSessionEmailLabel(row){const program=String(row[10]||'').replace(/^'/,'');if(program==='Trial session')return 'Conversation-based General English — Trial session';return (program?sbEmailProgramName(program.replace(/^General English — [48] sessions$/,'General English')):'English class')+' — Session '+row[2];}
function sbSessionEmailDetails(row){const program=String(row[10]||'').replace(/^'/,''),level=String(row[11]||'').replace(/^'/,'');return [program&&program!=='Trial session'?sbEmailProgramName(program):'',level&&level!=='Not assessed'?'Level '+level:''].filter(Boolean).join(' · ');}
function sbCalendarEmail(client,meetings,reminder=false){
 const heading=reminder?'Your upcoming class reminder':'Your class confirmation',name=String(client[1]),program=sbEmailProgramName(client[11]||'');
 const lines=meetings.map(r=>sbSessionEmailLabel(r)+(sbSessionEmailDetails(r)?' ('+sbSessionEmailDetails(r)+')':'')+' — '+Utilities.formatDate(new Date(r[5]),'Africa/Cairo','EEEE, d MMMM yyyy — h:mm a')+' (Cairo time)');
 const intro=reminder?'This is a reminder for your upcoming English class.':'Your upcoming English sessions are confirmed below.';
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
  const word=kind==='notes',encoded=word?p.docxBase64:p.pdfBase64;
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
   const meetings=sbUpcomingClientMeetings(book,id);if(!meetings.length)throw new Error('No upcoming calendar sessions are saved for this client. Add or sync their appointments first.');
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
const SB_INSTRUCTOR_EXAM_ACTIONS = ['weeklyPortalPasswords','listExamAttempts','reviewExamAttempt','listPortalAccess','savePortalAccess','retryExamNotification'];
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
  if(!access.getLastRow()){access.appendRow(SB_PORTAL_ACCESS_HEADERS);for(let level=1;level<=6;level++)access.appendRow(['test:'+level,'tests','Level '+level,'',false]);}
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
// The four shared passwords rotate every Monday at midnight Cairo time.
function sbPortalWeek(){
 const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd'),date=new Date(today+'T12:00:00Z'),offset=(date.getUTCDay()+6)%7;
 date.setUTCDate(date.getUTCDate()-offset);const start=date.toISOString().slice(0,10);date.setUTCDate(date.getUTCDate()+7);
 return {start,next:date.toISOString().slice(0,10)};
}
function sbWeeklyPortalPasswords(){
 const secret=PropertiesService.getScriptProperties().getProperty('CLIENT_SYNC_KEY');if(!secret)throw new Error('Connect your Clients sheet first.');
 const week=sbPortalWeek(),passwords={};
 for(const group of ['material','calendar','exercises','assessments']){
  const bytes=Utilities.computeHmacSha256Signature('Speak Boldly weekly password:'+week.start+':'+group,secret);let number=0;
  for(const byte of bytes)number=(number*256+(byte&255))%900000;
  passwords[group]=String(100000+number);
 }
 return {weekStart:week.start,nextChange:week.next,passwords};
}
function sbPortalFolderGroup(key){
 if(key==='exercises'||['program:comprehension','program:listening'].includes(key))return 'exercises';
 if(key==='material'||/^level:[1-8]$/.test(key)||/^program:[a-z][a-z0-9-]{0,60}$/.test(key))return 'material';
 throw new Error('Choose a valid folder.');
}
function sbExamNotify(sheet,index,row){
  if(!row[6]||['sent','sending'].includes(String(row[15])))return;
  const to=PropertiesService.getScriptProperties().getProperty('SB_EXAM_NOTIFY_EMAIL');
  try{
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL in Script Properties.');
    if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
    row[15]='sending';row[16]='';sheet.getRange(index+2,1,1,18).setValues([row]);
    MailApp.sendEmail({to,subject:'Assessment submitted — '+String(row[2]).replace(/^'/,'')+' — Level '+row[3],body:'An interactive test has been submitted.\n\nName: '+String(row[2]).replace(/^'/,'')+'\nLevel: '+row[3]+'\nProgram: '+String(row[13]).replace(/^'/,'')+'\n\nOpen Instructor Portal → Exam Review to correct the answers and save the score.\n\nSpeak Boldly',name:'Speak Boldly'});
    row[15]='sent';
  }catch(error){row[15]='failed';row[16]=sbExamSafe(error.message);}
  sheet.getRange(index+2,1,1,18).setValues([row]);
}
function sbExamExpire(sheet,index,row){if(!row[6]&&Date.now()>=Number(row[14])){row[4]='Awaiting review';row[6]=new Date().toISOString();row[12]=Number(row[12])+1;sheet.getRange(index+2,1,1,18).setValues([row]);sbExamNotify(sheet,index,row);}}
function sbExamAttempt(row) {
  return {id:String(row[0]),clientId:String(row[1]),name:String(row[2]).replace(/^'/,''),level:Number(row[3]),status:String(row[4]),openedAt:String(row[5]),submittedAt:String(row[6]),answers:row[7]?JSON.parse(String(row[7])):{A:{},B:{},C:{},D:'',E:''},marks:row[8]?JSON.parse(String(row[8])):null,score:row[9]===''?null:Number(row[9]),feedback:String(row[10]).replace(/^'/,''),reviewedAt:String(row[11]),version:Number(row[12]||1),program:String(row[13]).replace(/^'/,''),deadline:Number(row[14]),serverNow:Date.now(),notificationStatus:String(row[15]),notificationError:String(row[16]),age:row[17]?Number(row[17]):null};
}
function sbExamAnswers(value) {
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
    if(data.action==='studentPortalAccess')return sbExamResponse({ok:true,passwordSettings:{revision:sbPortalWeek().start,weekly:true},items:items.map(item=>({...item,url:item.enabled?item.url:''}))});
    if(data.action==='studentFolderLogin'){
      const group=sbPortalFolderGroup(data.folder),weekly=sbWeeklyPortalPasswords();
      if(String(data.passcode||'')!==weekly.passwords[group])throw new Error('Incorrect folder password.');
      return sbExamResponse({ok:true,revision:weekly.weekStart});
    }
    if(data.action==='studentExamLogin') {
      if(String(data.passcode||'')!==sbWeeklyPortalPasswords().passwords.assessments)throw new Error('Incorrect assessment password.');
      const name=String(data.name||'').trim(),program=String(data.program||'').trim(),age=data.age===undefined?'':Number(data.age);if(age!==''&&(!Number.isInteger(age)||age<1||age>120))throw new Error('Enter a valid age.');
      if(!name||name.length>100||!program||program.length>100)throw new Error('Enter your name and program.');
      const levels=items.filter(item=>item.section==='tests'&&item.enabled).map(item=>Number(item.id.split(':')[1]));
      if(!levels.length)throw new Error('Interactive tests are currently closed. Please wait for your instructor to open your level.');
      const token=Utilities.getUuid()+Utilities.getUuid();
      const sessions=book.getSheetByName('Exam sessions');if(!sessions)throw new Error('Run setupStudentExams first.');
      lock.waitLock(20000);sessions.appendRow([sbExamHash(token),Utilities.getUuid(),sbExamSafe(name),sbExamSafe(program),Date.now()+6*60*60*1000,age]);
      return sbExamResponse({ok:true,token,student:{name,program,levels,...(age!==''?{age}:{})}});
    }
    const sessions=book.getSheetByName('Exam sessions'),hash=sbExamHash(String(data.token||''));
    const saved=sessions&&sessions.getLastRow()>1?sessions.getRange(2,1,sessions.getLastRow()-1,6).getValues().find(row=>String(row[0])===hash&&Number(row[4])>Date.now()):null;
    if(!saved)throw new Error('Your session expired. Ask your instructor to check your saved assessment.');
    const session={clientId:String(saved[1]),name:String(saved[2]).replace(/^'/,''),program:String(saved[3]).replace(/^'/,''),age:saved[5]||''},level=Number(data.level);
    if(!Number.isInteger(level)||level<1||level>6)throw new Error('Choose a valid level.');
    lock.waitLock(20000);
    const sheet=book.getSheetByName('Exam attempts');if(!sheet)throw new Error('The instructor needs to run setupStudentExams first.');
    const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,18).getValues():[];
    let index=rows.findIndex(row=>String(row[1])===session.clientId&&Number(row[3])===level),row=index<0?null:rows[index];
    if(!row) {
      if(data.action!=='studentExamGet')throw new Error('Open your assessment before saving it.');
      if(!items.some(item=>item.id==='test:'+level&&item.enabled))throw new Error('This level is currently dimmed. Please wait for your instructor to open it.');
      const now=Date.now();row=[Utilities.getUuid(),session.clientId,sbExamSafe(session.name),level,'In progress',new Date(now).toISOString(),'','','','','','',1,sbExamSafe(session.program),now+20*60*1000,'','',session.age];
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
    return sbExamResponse({ok:true,attempt:sbExamAttempt(row)});
  }catch(error){return sbExamResponse({ok:false,error:error.message});}
  finally{if(lock.hasLock())lock.releaseLock();}
}
function handleInstructorExam(data) {
  const lock=LockService.getScriptLock();
  try {
    lock.waitLock(20000);const book=sbExamBook();
    if(data.action==='weeklyPortalPasswords')return sbExamResponse({ok:true,...sbWeeklyPortalPasswords()});
    if(data.action==='listPortalAccess')return sbExamResponse({ok:true,items:sbPortalItems(book)});
    if(data.action==='savePortalAccess'){
      const item=data.item;
      if(!item||!['tests','exercises','levels'].includes(item.section)||typeof item.enabled!=='boolean'||typeof item.title!=='string'||!item.title.trim()||item.title.length>250)throw new Error('Check the portal item.');
      let id,url=String(item.url||'');
      if(item.section==='tests'){if(!/^test:[1-6]$/.test(item.id))throw new Error('Check the test level.');id=item.id;url='';}
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
    const marks={};for(const section of ['A','B','C','D','E']){const mark=data.marks?.[section];if(typeof mark!=='number'||!Number.isFinite(mark)||mark<0||mark>20)throw new Error('Enter a mark from 0 to 20 for every section.');marks[section]=mark;}
    const feedback=String(data.feedback||'');if(feedback.length>10000)throw new Error('Feedback too long.');
    row[4]='Reviewed';row[8]=JSON.stringify(marks);row[9]=Object.values(marks).reduce((a,b)=>a+b,0);row[10]=sbExamSafe(feedback);row[11]=new Date().toISOString();row[12]=Number(row[12])+1;
    sheet.getRange(index+2,1,1,18).setValues([row]);return sbExamResponse({ok:true,attempt:sbExamAttempt(row)});
  }catch(error){return sbExamResponse({ok:false,error:error.message});}
  finally{if(lock.hasLock())lock.releaseLock();}
}

// Included in UnifiedCode.gs. Add separately only in a multi-file project.
const SB_PUBLIC_BOOKING_ACTIONS=['studentBookingLogin','studentBookingCalendar','studentBookSlots'];
const SB_OWNER_BOOKING_ACTIONS=['bookingSettings','saveBookingSettings','checkStudentPortal'];
const SB_BOOKING_HEADERS=['Request ID','Client ID','Name','Planned sessions','Session IDs','Created at','Status','Notification status','Notification error'];
function setupBookingCalendar(){
 const props=PropertiesService.getScriptProperties(),book=sbExamBook();
 if(!book.getSheetByName('Sessions'))setupSheetReminders();
 let requests=book.getSheetByName('Booking requests');if(!requests)requests=book.insertSheet('Booking requests');
 if(!requests.getLastRow())requests.appendRow(SB_BOOKING_HEADERS);
 else if(JSON.stringify(requests.getRange(1,1,1,9).getValues()[0])!==JSON.stringify(SB_BOOKING_HEADERS))throw new Error('Booking requests headers differ. Existing data was not changed.');
 requests.setFrozenRows(1);requests.getRange('A1:I1').setFontWeight('bold');
 if(!props.getProperty('SB_BOOKING_PASSCODE'))props.setProperty('SB_BOOKING_PASSCODE','19962');
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
  if(String(data.passcode||'')!==passcode)throw new Error('Incorrect booking passcode. Please ask your instructor for the current passcode.');
  const payload=Utilities.base64EncodeWebSafe(JSON.stringify({version,expires:Date.now()+8*60*60*1000,nonce:Utilities.getUuid()}));
  return {token:payload+'.'+sign(payload)};
 }
 try{const parts=String(data.token||'').split('.');if(parts.length!==2||parts[1]!==sign(parts[0]))throw new Error();const claims=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());if(claims.version!==version||!Number.isFinite(claims.expires)||claims.expires<=Date.now())throw new Error();}
 catch(error){throw new Error('Booking access expired or the passcode changed. Enter the current passcode again.');}
 return {};
}
function sbBookingBusy(book){
 const sessions=sbBookingRows(book.getSheetByName('Sessions'),10).filter(row=>row[0]&&String(row[7])!=='cancelled').map(row=>({start:Date.parse(row[5]),id:String(row[0])}));
 const pending=sbBookingRows(book.getSheetByName('Booking requests'),9).filter(row=>row[6]==='pending');
 for(const row of pending)for(const item of JSON.parse(String(row[3])))if(!sessions.some(entry=>entry.id===item.id))sessions.push({start:item.starts,id:item.id});
 return sessions.filter(item=>Number.isFinite(item.start));
}
function sbBookingOverlap(start,busy,ownIds=[]){return busy.some(item=>!ownIds.includes(item.id)&&start<item.start+90*60000&&start+90*60000>item.start);}
function sbBookingNotify(sheet,index,row){
 if(['sent','sending'].includes(String(row[7])))return;
 try{
  const to=PropertiesService.getScriptProperties().getProperty('SB_EXAM_NOTIFY_EMAIL');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL to your notification address.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
  row[7]='sending';row[8]='';sheet.getRange(index+2,1,1,9).setValues([row]);
  const lines=JSON.parse(String(row[3])).map(item=>'Session '+item.number+' — '+item.date+' — '+item.time+' (Cairo time)');
  MailApp.sendEmail({to,subject:'New slot booking — '+String(row[2]).replace(/^'/,''),body:'Name: '+String(row[2]).replace(/^'/,'')+'\n\n'+lines.join('\n')+'\n\nReview the instructor calendar and send class confirmation manually through Actions.\n\nSpeak Boldly',name:'Speak Boldly'});row[7]='sent';
 }catch(error){row[7]='failed';row[8]=sbExamSafe(error.message);}
 sheet.getRange(index+2,1,1,9).setValues([row]);
}
function handlePublicBooking(data){
 const lock=LockService.getScriptLock();
 try{
  const auth=sbBookingAuth(data);if(data.action==='studentBookingLogin')return sbExamResponse({ok:true,...auth});
  lock.waitLock(20000);const book=sbExamBook();if(!book.getSheetByName('Sessions')||!book.getSheetByName('Booking requests'))throw new Error('The instructor needs to run setupStudentPortal first.');
  const busy=sbBookingBusy(book),today=sbBookingToday();
  if(data.action==='studentBookingCalendar'){
   const month=String(data.month||today.slice(0,7));if(!/^\d{4}-\d{2}$/.test(month))throw new Error('Choose a valid month.');
   const [year,m]=month.split('-').map(Number),[cy,cm]=today.slice(0,7).split('-').map(Number),difference=(year-cy)*12+m-cm;
   if(m<1||m>12||difference<0||difference>2)throw new Error('Booking is available for the current month and the next two months.');
   const count=new Date(Date.UTC(year,m,0)).getUTCDate(),days=[];
   for(let n=1;n<=count;n++){
    const date=month+'-'+String(n).padStart(2,'0'),slots=[];
    for(const slot of sbBookingSlots(date)){const start=sbCairoTimestamp(date,slot.time),status=start<=Date.now()?'past':sbBookingOverlap(start,busy)?'taken':'available';slots.push({...slot,date,status});}
    days.push({date,slots});
   }
   return sbExamResponse({ok:true,month,today,timeZone:'Africa/Cairo',days});
  }
  const name=String(data.name||'').trim(),requestId=String(data.requestId||'');
  if(!name||name.length>100||! /^[A-Za-z0-9-]{1,100}$/.test(requestId)||!Array.isArray(data.slots)||!data.slots.length||data.slots.length>16)throw new Error('Enter your registered name and select between 1 and 16 slots.');
  const clients=sbBookingRows(book.getSheetByName('Clients'),12),normalized=value=>String(value||'').replace(/^'/,'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
  const matches=clients.filter(row=>normalized(row[1])===normalized(name));if(matches.length!==1)throw new Error('Use your registered name. Ask your instructor to check your client record.');
  const client=matches[0];if(String(client[5])!=='Paid')throw new Error('Your instructor needs to finalize your payment status before you can book.');
  const slots=data.slots.map(item=>({date:String(item.date||''),time:String(item.time||'')})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  if(new Set(slots.map(item=>item.date+' '+item.time)).size!==slots.length)throw new Error('Select each slot only once.');
  const sheet=book.getSheetByName('Booking requests'),rows=sbBookingRows(sheet,9);let index=rows.findIndex(row=>String(row[0])===requestId),row=index<0?null:rows[index];
  if(row){const previous=JSON.parse(String(row[3])).map(item=>({date:item.date,time:item.time}));if(String(row[1])!==String(client[0])||JSON.stringify(previous)!==JSON.stringify(slots))throw new Error('Booking request changed. Start a new selection.');}
  let plans=row?JSON.parse(String(row[3])):[];
  if(!row){
   const sessionRows=sbBookingRows(book.getSheetByName('Sessions'),10);let number=sessionRows.filter(item=>String(item[1])===String(client[0])).reduce((maximum,item)=>Math.max(maximum,Number(item[2])||0),0);for(const pending of rows.filter(entry=>String(entry[1])===String(client[0])&&entry[6]==='pending'))for(const item of JSON.parse(String(pending[3])))number=Math.max(number,Number(item.number)||0);
   for(const slot of slots){
    if(!sbBookingSlots(slot.date).some(item=>item.time===slot.time))throw new Error('Choose one of the available calendar slots.');
    const starts=sbCairoTimestamp(slot.date,slot.time);if(starts<=Date.now()||starts>Date.now()+90*86400000)throw new Error('Choose a future slot within the next three months.');
    if(sbBookingOverlap(starts,busy)||sbBookingOverlap(starts,plans))throw new Error('One of your selected slots has just been taken. Refresh the calendar and choose another slot.');
    number++;if(number>9999)throw new Error('Ask your instructor to check your session numbers.');
    const item={clientId:String(client[0]),number,date:slot.date,time:slot.time,program:String(client[11]||''),level:String(client[4]||'')};plans.push({...item,id:sbSessionId(item),starts,start:starts});
   }
   row=[requestId,String(client[0]),sbExamSafe(client[1]),JSON.stringify(plans),JSON.stringify(plans.map(item=>item.id)),new Date().toISOString(),'pending','',''];sheet.appendRow(row);index=sheet.getLastRow()-2;
  }
  if(row[6]!=='complete'){
   const sessions=book.getSheetByName('Sessions'),existing=sbBookingRows(sessions,10),ownIds=plans.map(item=>item.id);
   const missing=plans.filter(item=>!existing.some(entry=>String(entry[0])===item.id));
   if(missing.some(item=>sbBookingOverlap(item.starts,busy,ownIds)))throw new Error('A selected slot is no longer available. Contact your instructor.');
   if(missing.length){const first=sessions.getLastRow()+1;sessions.getRange(first,4,missing.length,2).setNumberFormat('@');sessions.getRange(first,1,missing.length,12).setValues(missing.map(item=>[item.id,item.clientId,item.number,item.date,item.time,new Date(item.starts).toISOString(),new Date(item.starts-86400000).toISOString(),'pending','','',item.program||'',item.level||'']));}
   row[6]='complete';sheet.getRange(index+2,1,1,9).setValues([row]);
  }
  sbBookingNotify(sheet,index,row);
  return sbExamResponse({ok:true,booked:plans.map(item=>({date:item.date,time:item.time,number:item.number})),notificationStatus:String(row[7])});
 }catch(error){return sbExamResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}
function handleOwnerBooking(data){
 try{
  const props=PropertiesService.getScriptProperties(),book=sbExamBook();
  if(data.action==='checkStudentPortal')return sbExamResponse({ok:true,examsReady:['Exam attempts','Exam sessions','Portal access'].every(name=>Boolean(book.getSheetByName(name))),bookingReady:['Sessions','Booking requests'].every(name=>Boolean(book.getSheetByName(name)))&&Boolean(props.getProperty('SB_BOOKING_PASSCODE')),notificationEmail:props.getProperty('SB_EXAM_NOTIFY_EMAIL')||'',remainingEmailQuota:MailApp.getRemainingDailyQuota()});
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

function sbCountedSessionHours(book,id){const sheet=book.getSheetByName('Sessions');if(!sheet||sheet.getLastRow()<2)return 0;const rows=sheet.getRange(2,1,sheet.getLastRow()-1,13).getValues(),ids=new Set();for(const row of rows)if(String(row[1])===id&&String(row[7])!=='cancelled'&&row[12]==='counted')ids.add(String(row[0]));return ids.size*1.5;}
function sbApplySessionHours(book){
 const sessions=book.getSheetByName('Sessions'),clients=book.getSheetByName('Clients');if(!sessions||!clients)return;
 const props=PropertiesService.getScriptProperties(),first=props.getProperty('SB_SESSION_HOURS_READY')!=='1',today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
 sessions.getRange(1,13).setValue('Hours counted');clients.getRange(1,13,1,2).setValues([['Hours baseline','Hours baseline set at (UTC)']]);
 const people=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,14).getValues():[];
 for(let i=0;i<people.length;i++)if(people[i][0]&&people[i][12]===''){people[i][12]=Number(people[i][7])||0;clients.getRange(i+2,13,1,2).setValues([[people[i][12],new Date().toISOString()]]);}
 const rows=sessions.getLastRow()>1?sessions.getRange(2,1,sessions.getLastRow()-1,13).getValues():[];
 for(let i=0;i<rows.length;i++){const row=rows[i];if(row[0]&&/^\d{4}-\d{2}-\d{2}$/.test(String(row[3]))&&String(row[3])<today&&!row[12]){row[12]=String(row[3])<'2026-10-14'?'baseline':'counted';sessions.getRange(i+2,13).setValue(row[12]);}}
 props.setProperty('SB_SESSION_HOURS_READY','1');
 for(let i=0;i<people.length;i++){const person=people[i];if(!person[0])continue;const ids=new Set(rows.filter(row=>String(row[1])===String(person[0])&&row[7]!=='cancelled'&&row[12]==='counted').map(row=>String(row[0])));const total=Math.round((Number(person[12])+ids.size*1.5)*100)/100;if(Number(person[7])!==total)clients.getRange(i+2,8).setValue(total);}
}
function sbSetClientHours(book,sheet,row,input){
 if(row>sheet.getLastRow())return Number(input.hours);
 const previous=sheet.getRange(row,1,1,14).getValues()[0];if(input.hoursChanged===false)return Number(previous[7]);
 const baseline=Number(input.hours)-sbCountedSessionHours(book,String(previous[0]));if(baseline<0)throw new Error('Hours include completed sessions. Cancel an incorrect session before reducing its counted hours.');sheet.getRange(row,13,1,2).setValues([[baseline,new Date().toISOString()]]);return Number(input.hours);
}
function updateSessionHours(){const lock=LockService.getScriptLock();lock.waitLock(20000);try{sbApplySessionHours(SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')));}finally{lock.releaseLock();}}
function enableAutomaticSessionHours(){updateSessionHours();if(!ScriptApp.getProjectTriggers().some(trigger=>trigger.getHandlerFunction()==='updateSessionHours'))ScriptApp.newTrigger('updateSessionHours').timeBased().everyDays(1).atHour(0).nearMinute(15).inTimezone('Africa/Cairo').create();}
