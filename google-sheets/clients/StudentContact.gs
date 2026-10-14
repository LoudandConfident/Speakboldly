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
