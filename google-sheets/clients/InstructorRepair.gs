// Additive repair: no Code.gs replacement, no data migration, no test emails.
function setupInstructorLoginRepair(){
 const ui=SpreadsheetApp.getUi(),a=ui.prompt('Instructor password','Enter the password you want to use for the instructor dashboard (at least 8 characters). It stays private in this Google project.',ui.ButtonSet.OK_CANCEL);
 if(a.getSelectedButton()!==ui.Button.OK)return;
 const password=a.getResponseText();if(password.length<8||password.length>128)throw Error('Use a password between 8 and 128 characters.');
 const b=ui.prompt('Confirm instructor password','Enter the same password again.',ui.ButtonSet.OK_CANCEL);if(b.getSelectedButton()!==ui.Button.OK)return;if(b.getResponseText()!==password)throw Error('The passwords did not match. Nothing changed.');
 const props=PropertiesService.getScriptProperties();if(!props.getProperty('CLIENT_SYNC_KEY'))throw Error('Your existing Clients project connection is missing. Keep the original Clients project.');
 const salt=Utilities.getUuid()+Utilities.getUuid();props.setProperties({SB_INSTRUCTOR_PASSWORD_SALT:salt,SB_INSTRUCTOR_PASSWORD_HASH:sbRepairPasswordHash(password,salt)});
 console.log('Instructor password saved privately. Existing Clients/Sessions were not changed. Deploy a New version of this existing web app. No email sent.');
}
function sbRepairPasswordHash(password,salt){return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+':'+password));}
function sbInstructorRepairEvent(event){
 let p;try{p=JSON.parse(event?.postData?.contents||'null');}catch{return null;}if(!p)return null;
 const json=x=>ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON),props=PropertiesService.getScriptProperties(),cache=CacheService.getScriptCache();
 try{
  if(p.action==='instructorLogin'){
   const salt=props.getProperty('SB_INSTRUCTOR_PASSWORD_SALT'),expected=props.getProperty('SB_INSTRUCTOR_PASSWORD_HASH');if(!salt||!expected)throw Error('Run setupInstructorLoginRepair in the existing Apps Script project, then deploy a New version.');
   const lock=LockService.getScriptLock();lock.waitLock(10000);try{const count=Number(cache.get('sb-instructor-login-failures')||0);if(count>=10)throw Error('Too many unsuccessful attempts. Try again in 15 minutes.');
    const password=String(p.password||'');if(password.length>128||sbRepairPasswordHash(password,salt)!==expected){cache.put('sb-instructor-login-failures',String(count+1),900);throw Error('Incorrect instructor password.');}
    cache.remove('sb-instructor-login-failures');const credential='SBI_'+Utilities.getUuid()+Utilities.getUuid(),expires=Date.now()+21600000;cache.put('sb-instructor-session:'+sbRepairPasswordHash(credential,salt),JSON.stringify({expires,salt}),21600);return json({ok:true,credential,expires});
   }finally{lock.releaseLock();}
  }
  if(String(p.key||'').startsWith('SBI_')){const salt=props.getProperty('SB_INSTRUCTOR_PASSWORD_SALT');let session;try{session=JSON.parse(cache.get('sb-instructor-session:'+sbRepairPasswordHash(p.key,salt))||'null');}catch{}if(!session||session.salt!==salt||session.expires<=Date.now())throw Error('Your instructor session expired. Sign in again with your instructor password.');p.key=props.getProperty('CLIENT_SYNC_KEY');event.postData.contents=JSON.stringify(p);}
  if(p.action==='emailRoutingSettings'){sbRequireClientConnection(p);return json(sbRepairMailStatus(p.kind));}
  if(p.action==='sendClientEmail'&&['notes','actionplan','progress','final','registration'].includes(p.kind)){sbRequireClientConnection(p);return json(sbRepairSendDocument(p));}
  return null;
 }catch(error){return json({ok:false,error:String(error.message||error)});}
}
function sbRepairMailStatus(kind){const routes={};for(const k of ['confirmation','progress','final','registration','notes','actionplan','paymentReminder','motivation'])routes[k]={from:['registration','paymentReminder'].includes(k)?'billing@speakboldly.space':'noreply@speakboldly.space',replyTo:['registration','paymentReminder'].includes(k)?'billing@speakboldly.space':'askcoach@speakboldly.space'};if(kind){if(!routes[kind])throw Error('Choose a supported email action.');sbRepairVerifiedFrom(routes[kind].from);}return{ok:true,version:'domain-email-2026-10-24',routes};}
function sbRepairVerifiedFrom(address){if(typeof sbVerifiedFrom==='function')return sbVerifiedFrom(address);const alias=GmailApp.getAliases().find(a=>a.toLowerCase()===address.toLowerCase());if(alias)return alias;if(String(Session.getEffectiveUser().getEmail()).toLowerCase()===address.toLowerCase())return '';throw Error('Verify '+address+' in Gmail → Settings → Accounts and Import → Send mail as, then try again. No email was sent.');}
function sbRepairSendDocument(p){
 const id=String(p.clientId||''),requestId=String(p.requestId||''),kind=p.kind;if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!/^[a-zA-Z0-9-]{1,100}$/.test(requestId))throw Error('Invalid document email request.');
 const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID')),sheet=book.getSheetByName('Clients'),client=sheet&&sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues().find(r=>String(r[0])===id):null;
 if(!client||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(client[2]))||/[\r\n,;]/.test(String(client[2])))throw Error('Check this client’s email address.');
 const encoded=String(p.pdfBase64||'');if(!encoded||encoded.length>7500000||!/^[A-Za-z0-9+/]*={0,2}$/.test(encoded))throw Error('A completed PDF is required.');const bytes=Utilities.base64Decode(encoded);if(bytes.length>5500000||String.fromCharCode(...bytes.slice(0,5).map(x=>x&255))!=='%PDF-')throw Error('Use a valid completed PDF under 5.5 MB.');
 const session=Number(p.sessionNumber||0);if(p.sessionNumber&&(!Number.isInteger(session)||session<1||session>9999))throw Error('Check the notes session number.');
 const route=sbRepairMailStatus(kind).routes[kind],from=sbRepairVerifiedFrom(route.from),title={notes:'Notes',actionplan:'Action plan',progress:'Progress report',final:'Final report',registration:'Payment and registration confirmation'}[kind],safe=x=>String(x||'').replace(/[\\/:*?"<>|\u0000-\u001f]/g,'-').slice(0,100),name=String(client[1]||'Learner').replace(/^'/,''),filename=[safe(name),safe(client[4]),title,kind==='notes'&&session?'Session '+session:'',Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd')].filter(Boolean).join(' — ')+'.pdf',attachment=Utilities.newBlob(bytes,'application/pdf',filename);
 const lock=LockService.getScriptLock();lock.waitLock(20000);try{
  let log=book.getSheetByName('EmailLog');if(!log){log=book.insertSheet('EmailLog');log.appendRow(['Request ID','Client ID','Kind','Recipient','Status','Sent at (UTC)','Error']);}
  const old=log.getLastRow()>1?log.getRange(2,1,log.getLastRow()-1,7).getValues().find(r=>String(r[0])===requestId):null;
  if(old){if(String(old[1])!==id||String(old[2])!==kind)throw Error('Email request identity mismatch.');if(old[4]==='sent')return{ok:true,status:'sent',recipient:String(old[3])};throw Error('Delivery is uncertain. Check EmailLog and Sent mail before retrying.');}
  if(MailApp.getRemainingDailyQuota()<1)throw Error('Google’s daily email quota has been reached. No email sent.');
  const row=log.getLastRow()+1;log.getRange(row,1,1,7).setValues([[requestId,id,kind,String(client[2]),'sending','','']]);SpreadsheetApp.flush();
  try{const text='Hello '+name+',\n\nPlease find your '+title.toLowerCase()+(kind==='notes'&&session?' for session '+session:'')+' attached.\n\nReply to this email if you have questions.\n\nEnglish Language Coaching\n© 2026 Founded by Mira Nasser Louis.';
   const message={to:String(client[2]),subject:title+(kind==='notes'&&session?' · Session '+session:'')+' — Speak Boldly',body:text,name:'Speak Boldly',replyTo:route.replyTo,attachments:[attachment]};if(typeof sbBrandedEmail==='function'){const escape=x=>String(x).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));message.htmlBody=sbBrandedEmail(title,'<p>Hello '+escape(name)+',</p><p>Please find your '+escape(title.toLowerCase())+(kind==='notes'&&session?' for session '+session:'')+' attached.</p>');}if(typeof sbSendDomainEmail==='function')sbSendDomainEmail(message,from);else{const {to,subject,body,...options}=message;GmailApp.sendEmail(to,subject,body,{...options,...(from?{from}:{})});}
   log.getRange(row,5,1,3).setValues([['sent',new Date().toISOString(),'']]);return{ok:true,status:'sent',recipient:String(client[2])};
  }catch(error){log.getRange(row,5,1,3).setValues([['delivery_unknown','',String(error.message||error)]]);throw Error('Email delivery could not be confirmed. Check EmailLog and Sent mail before sending again.');}
 }finally{lock.releaseLock();}
}
