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
