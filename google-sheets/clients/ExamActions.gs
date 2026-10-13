// Add this file only for a multi-file project. UnifiedCode.gs already includes it.
const SB_EXAM_HEADERS = ['Attempt ID','Client ID','Name','Level','Status','Opened at','Submitted at','Answers','Marks','Score','Feedback','Reviewed at','Version','Program','Deadline','Notification status','Notification error','Age'];
const SB_PORTAL_ACCESS_HEADERS = ['Item ID','Section','Title','URL','Enabled'];
const SB_EXAM_SESSION_HEADERS = ['Token hash','Visitor ID','Name','Program','Expires at','Age'];
const SB_STUDENT_EXAM_ACTIONS = ['studentPortalAccess','studentExamLogin','studentExamGet','studentExamDraft','studentExamSubmit'];
const SB_INSTRUCTOR_EXAM_ACTIONS = ['listExamAttempts','reviewExamAttempt','listPortalAccess','savePortalAccess','retryExamNotification'];
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
    if(data.action==='studentPortalAccess')return sbExamResponse({ok:true,items:items.map(item=>({...item,url:item.enabled?item.url:''}))});
    if(data.action==='studentExamLogin') {
      if(String(data.passcode||'')!=='1111')throw new Error('Incorrect assessment password.');
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
