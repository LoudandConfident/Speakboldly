// Add this file to the existing Clients Apps Script project.
// Run setupSheetReminders once from the Google account that should send reminders.
const SB_SESSION_HEADERS=['Session ID','Client ID','Session number','Date (Cairo)','Time (Cairo)','Starts at (UTC)','Remind at (UTC)','Status','Sent at (UTC)','Last error'];
function setupSheetReminders(){
 const props=PropertiesService.getScriptProperties(),id=props.getProperty('CLIENT_SHEET_ID');
 if(!id)throw new Error('Run setupClientSync first.');
 const sheet=SpreadsheetApp.openById(id).getSheetByName('Sessions')||SpreadsheetApp.openById(id).insertSheet('Sessions');
 if(!sheet.getLastRow())sheet.appendRow(SB_SESSION_HEADERS);
 else if(JSON.stringify(sheet.getRange(1,1,1,10).getValues()[0])!==JSON.stringify(SB_SESSION_HEADERS))throw new Error('Sessions headers differ. Existing data has not been replaced.');
 sheet.setFrozenRows(1);sheet.getRange('A1:J1').setFontWeight('bold');
 // Authorization is requested here before any clients are emailed.
 MailApp.getRemainingDailyQuota();
 ScriptApp.getProjectTriggers().filter(t=>t.getHandlerFunction()==='sendDueSheetReminders').forEach(t=>ScriptApp.deleteTrigger(t));
 ScriptApp.newTrigger('sendDueSheetReminders').timeBased().everyMinutes(5).create();
 props.setProperty('SB_REMINDERS_ENABLED','true');
}
function sbSessionsSheet(){
 const id=PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID');
 const sheet=SpreadsheetApp.openById(id).getSheetByName('Sessions');
 if(!sheet)throw new Error('Add Sessions.gs and run setupSheetReminders first.');
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
 const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,[c.clientId,c.number,c.date,c.time].join('|'));
 return bytes.map(b=>(b&255).toString(16).padStart(2,'0')).join('');
}
function sbListSheetSessions(){
 const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,10).getValues():[];
 return rows.filter(r=>r[0]).map(r=>({id:String(r[0]),clientId:String(r[1]),number:Number(r[2]),date:String(r[3]),time:String(r[4]),name:'',reminderStatus:String(r[7]),reminderAt:new Date(r[6]).toISOString(),sentAt:r[8]?new Date(r[8]).toISOString():null}));
}
function sbSaveSheetSession(input){
 const c={clientId:String(input.clientId||''),number:Number(input.number),date:String(input.date||''),time:String(input.time||'')};
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(c.clientId)||!Number.isInteger(c.number)||c.number<1||c.number>9999)throw new Error('Choose an existing client and valid session number.');
 const starts=sbCairoTimestamp(c.date,c.time),id=sbSessionId(c),sheet=sbSessionsSheet();
 const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,10).getValues():[];
 const existing=rows.find(r=>String(r[0])===id);
 if(existing)return id; // Retries never create duplicate reminders or restore cancelled classes.
 if(starts<=Date.now())throw new Error('Choose a future session.');
 const clients=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
 const ids=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,1).getValues():[];
 if(!ids.some(r=>String(r[0])===c.clientId))throw new Error('Save this client to the Clients sheet first.');
 const row=sheet.getLastRow()+1;sheet.getRange(row,4,1,2).setNumberFormat('@');
 sheet.getRange(row,1,1,10).setValues([[id,c.clientId,c.number,c.date,c.time,new Date(starts).toISOString(),new Date(starts-86400000).toISOString(),'pending','','']]);
 return id;
}
function handleSheetSessionAction(p){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  if(p.action==='saveSession'){if(!p.session)throw new Error('Session missing.');sbSaveSheetSession(p.session);}
  if(p.action==='cancelSession'){
   const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,10).getValues():[],index=rows.findIndex(r=>String(r[0])===String(p.sessionId));
   if(index<0)throw new Error('Session not found.');
   if(rows[index][7]==='sending')throw new Error('A reminder is being sent. Try again shortly.');
   sheet.getRange(index+2,8).setValue('cancelled');
  }
  const props=PropertiesService.getScriptProperties();
  const ready=props.getProperty('SB_REMINDERS_ENABLED')==='true'&&ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()==='sendDueSheetReminders');
  const respond=typeof clientSyncResponse==='function'?clientSyncResponse:response;
  return respond({ok:true,classes:sbListSheetSessions(),emailReady:ready});
 }finally{lock.releaseLock();}
}
function sendDueSheetReminders(){
 const props=PropertiesService.getScriptProperties();
 if(props.getProperty('SB_REMINDERS_ENABLED')!=='true')return;
 const lock=LockService.getScriptLock();if(!lock.tryLock(1000))return;
 try{
  const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,10).getValues():[];
  const clients=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
  const people=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,3).getValues():[];
  let remaining=MailApp.getRemainingDailyQuota(),count=0;
  for(let i=0;i<rows.length;i++){
   const r=rows[i],row=i+2,status=String(r[7]),starts=Date.parse(r[5]),due=Date.parse(r[6]);
   if(status==='sending'){sheet.getRange(row,8).setValue('delivery_unknown');continue;}
   if(!['pending','failed'].includes(status)||!Number.isFinite(starts)||!Number.isFinite(due))continue;
   if(starts<=Date.now()){sheet.getRange(row,8).setValue('expired');continue;}
   if(due>Date.now()||remaining<1||count>=20)continue;
   const person=people.find(c=>String(c[0])===String(r[1])),email=person?String(person[2]).trim():'';
   if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){sheet.getRange(row,8).setValue('failed');sheet.getRange(row,10).setValue('Client email missing or invalid.');continue;}
   const when=Utilities.formatDate(new Date(starts),'Africa/Cairo','EEEE, d MMMM yyyy — h:mm a');
   const text='Hello '+String(person[1])+',\n\nThis is a reminder confirming your upcoming English class.\n\nSession number: '+r[2]+'\nDate and time: '+when+' (Cairo time)\n\nJoin on Zoom:\nhttps://us06web.zoom.us/j/79051707388\nPasscode: 7P1NpA\n\nPlease note: No same-day cancellations are allowed.\n\nSee you in class!\nSpeak Boldly';
   // Persist a claim first. An interrupted send is not retried blindly.
   sheet.getRange(row,8).setValue('sending');sheet.getRange(row,10).setValue('');SpreadsheetApp.flush();
   try{
    MailApp.sendEmail({to:email,subject:'Your class reminder — Session '+r[2]+' — Speak Boldly',body:text,name:'Speak Boldly',replyTo:'speakboldly16@gmail.com'});
    sheet.getRange(row,8,1,3).setValues([['sent',new Date().toISOString(),'']]);remaining--;count++;
   }catch(error){sheet.getRange(row,8).setValue('delivery_unknown');sheet.getRange(row,10).setValue(String(error.message||error));}
  }
 }finally{lock.releaseLock();}
}
