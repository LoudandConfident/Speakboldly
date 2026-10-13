// Run once in Apps Script to grant email permission. This does not send an email.
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
