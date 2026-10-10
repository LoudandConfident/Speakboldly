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
 sheet.setFrozenRows(1);sheet.getRange('A1:I1').setFontWeight('bold');sheet.getRange('D2:D').setNumberFormat('@');sheet.autoResizeColumns(1,9);
 SpreadsheetApp.getUi().alert('Clients sheet ready','Keep your connection key private. Find it under Apps Script > Project Settings > Script Properties > CLIENT_SYNC_KEY. Do not send it in chat. After deploying, share only the web app URL with your website maintainer.',SpreadsheetApp.getUi().ButtonSet.OK);
}
function clientSyncResponse(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function normalizedClientName(value){return String(value||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();}
function safeSheetText(value){const s=String(value??'');return /^[=+\-@]/.test(s)?"'"+s:s;}
function handleClientSync(e){
 const lock=LockService.getScriptLock();
 try{
  if(!e?.postData?.contents||e.postData.contents.length>20000)throw new Error('Invalid request.');
  const p=JSON.parse(e.postData.contents),props=PropertiesService.getScriptProperties();
  const key=props.getProperty('CLIENT_SYNC_KEY');
  if(!key||typeof p.key!=='string'||p.key!==key)throw new Error('Not authorized.');
  if(p.action!=='upsertClient'||!p.client)throw new Error('Invalid action.');
  const c=p.client,name=String(c.name||'').trim(),email=String(c.email||'').trim().toLowerCase(),code=String(c.code||'').trim(),id=String(c.id||'');
  if(!/^[a-zA-Z0-9-]{1,100}$/.test(id)||!name||name.length>100||!/^(?:\d{4}|\d{6})$/.test(code)||code==='1962'||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Check client details.');
  const hours=Number(c.hours),amount=Number(c.amountPaid??0);
  if(!Number.isFinite(hours)||hours<0||hours>100000||!Number.isFinite(amount)||amount<0||amount>100000000)throw new Error('Invalid hours or amount.');
  if(!['Unpaid','Part paid','Paid'].includes(c.payment)||!String(c.level||'')||String(c.level).length>100)throw new Error('Invalid program or payment status.');
  lock.waitLock(20000);
  const sheet=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID')).getSheetByName('Clients');
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,9).getValues():[];
  let rowNumber=sheet.getLastRow()+1;
  rows.forEach((row,i)=>{
   if(String(row[0])===id){rowNumber=i+2;return;}
   if(String(row[3]).padStart(code.length,'0')===code)throw new Error('Student Code is already assigned.');
   if(normalizedClientName(row[1])===normalizedClientName(name))throw new Error('Client name is already registered.');
   if(String(row[2]).toLowerCase()===email)throw new Error('Email already belongs to another client.');
  });
  const values=[id,name,email,code,String(c.level),c.payment,amount,hours,new Date().toISOString()].map(v=>typeof v==='string'?safeSheetText(v):v);
  sheet.getRange(rowNumber,4).setNumberFormat('@');sheet.getRange(rowNumber,1,1,9).setValues([values]);
  return clientSyncResponse({ok:true,clientId:id});
 }catch(error){return clientSyncResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}

// In existing Code.gs, rename only function doPost(event) to handleReviewPost(event).
// Leave doGet and all other review code untouched. This router keeps both features separate.
function doPost(e) {
 let data;
 try {data = JSON.parse(e.postData.contents);} catch {return clientSyncResponse({ok:false,error:'Invalid request.'});}
 if (data.action === 'upsertClient') return handleClientSync(e);
 return handleReviewPost(e);
}
