// Owner-authorized individual emails. Recipients come from Clients, never from browser input.
function handleClientEmail(p){
 const respond=typeof response==='function'?response:clientSyncResponse;
 const id=String(p.clientId||''),kind=String(p.kind||''),requestId=String(p.requestId||'');
 if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!['confirmation','progress','final','registration'].includes(kind)||! /^[a-zA-Z0-9-]{1,100}$/.test(requestId))throw new Error('Invalid email request.');
 const props=PropertiesService.getScriptProperties(),book=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')),clients=book.getSheetByName('Clients');
 const rows=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,9).getValues():[],client=rows.find(r=>String(r[0])===id);
 if(!client||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(client[2])))throw new Error('Client email missing or invalid.');
 let attachment=null;
 if(kind!=='confirmation'){
  if(typeof p.pdfBase64!=='string'||p.pdfBase64.length>7500000||! /^[A-Za-z0-9+/]*={0,2}$/.test(p.pdfBase64))throw new Error('A valid completed PDF is required.');
  const bytes=Utilities.base64Decode(p.pdfBase64);
  if(bytes.length>5500000||String.fromCharCode(...bytes.slice(0,4).map(b=>b&255))!=='%PDF')throw new Error('Invalid PDF attachment.');
  attachment=Utilities.newBlob(bytes,'application/pdf',kind+'-report.pdf');
 }
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  let log=book.getSheetByName('EmailLog');if(!log){log=book.insertSheet('EmailLog');log.appendRow(['Request ID','Client ID','Kind','Recipient','Status','Sent at (UTC)','Error']);}
  const logs=log.getLastRow()>1?log.getRange(2,1,log.getLastRow()-1,7).getValues():[],existing=logs.find(r=>String(r[0])===requestId);
  if(existing){if(String(existing[1])!==id||String(existing[2])!==kind)throw new Error('Email request identity mismatch.');if(existing[4]==='sent')return respond({ok:true,status:'sent',recipient:String(existing[3])});throw new Error('This email has an uncertain delivery status. Check EmailLog before sending it again.');}
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached. Try again tomorrow.');
  const labels={confirmation:'Email confirmation',progress:'Progress report',final:'Final report',registration:'Payment and registration confirmation'};
  const body='Hello '+client[1]+',\n\n'+(kind==='confirmation'?'This confirms your Speak Boldly client details.\n\nProgram / Level: '+client[4]+'\nStudent portal passcode: '+String(client[3]).padStart(4,'0')+'\nStudent portal: https://loudandconfident.github.io/Speakboldly/#students-portal':'Please find your '+labels[kind].toLowerCase()+' attached.')+'\n\nIf you have any questions, reply to this email.\n\nSpeak Boldly';
  const row=log.getLastRow()+1;log.getRange(row,1,1,7).setValues([[requestId,id,kind,String(client[2]),'sending','','']]);SpreadsheetApp.flush();
  try{MailApp.sendEmail({to:String(client[2]),subject:labels[kind]+' — Speak Boldly',body,name:'Speak Boldly',replyTo:'speakboldly16@gmail.com',...(attachment?{attachments:[attachment]}:{})});log.getRange(row,5,1,3).setValues([['sent',new Date().toISOString(),'']]);return respond({ok:true,status:'sent',recipient:String(client[2])});}
  catch(error){log.getRange(row,5).setValue('delivery_unknown');log.getRange(row,7).setValue(String(error.message||error));throw new Error('Email delivery could not be confirmed. Check EmailLog before trying another send.');}
 }finally{lock.releaseLock();}
}
