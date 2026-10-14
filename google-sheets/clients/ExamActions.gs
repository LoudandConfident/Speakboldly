// Add this file only for a multi-file project. UnifiedCode.gs already includes it.
const SB_EXAM_HEADERS = ['Attempt ID','Client ID','Name','Level','Status','Opened at','Submitted at','Answers','Marks','Score','Feedback','Reviewed at','Version','Program','Deadline','Notification status','Notification error','Age'];
const SB_PORTAL_ACCESS_HEADERS = ['Item ID','Section','Title','URL','Enabled'];
const SB_EXAM_SESSION_HEADERS = ['Token hash','Visitor ID','Name','Program','Expires at','Age'];
const SB_STUDENT_EXAM_ACTIONS = ['studentPortalAccess','studentFolderLogin','studentExamLogin','studentExamGet','studentExamDraft','studentExamSubmit'];
const SB_INSTRUCTOR_EXAM_ACTIONS = ['learningLevelAccess','saveLearningLevelAccess','weeklyPortalPasswords','listExamAttempts','reviewExamAttempt','listPortalAccess','savePortalAccess','retryExamNotification'];
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
 for(const group of ['material','calendar','exercises','assessments',...Array.from({length:8},(_,i)=>'level:'+(i+1)),'exercise:comprehension','exercise:listening','exercise:resources','contact','practice']){
  const bytes=Utilities.computeHmacSha256Signature('Speak Boldly weekly password:'+week.start+':'+group,secret);let number=0;
  for(const byte of bytes)number=(number*256+(byte&255))%900000;
  passwords[group]=String(100000+number);
 }
 return {weekStart:week.start,nextChange:week.next,passwords};
}
function sbLearningLevelAccess(){const raw=PropertiesService.getScriptProperties().getProperty('SB_LEARNING_LEVEL_ACCESS');let saved={};try{saved=JSON.parse(raw||'{}');}catch{}return Object.fromEntries(Array.from({length:8},(_,i)=>[String(i+1),saved[String(i+1)]!==false]));}
function sbLearningItemLevel(item){const match=String(item.title||'').match(/(?:^|[^a-z0-9])level[\s_-]*([1-8])(?:[^0-9]|$)/i);return match?Number(match[1]):null;}
function sbPortalFolderGroup(key){
 if(/^level:[1-8]$/.test(key)||['exercise:comprehension','exercise:listening','exercise:resources','contact','practice'].includes(key))return key;
 if(key==='exercises'||['program:comprehension','program:listening'].includes(key))return 'exercises';
 if(key==='material'||/^program:[a-z][a-z0-9-]{0,60}$/.test(key))return 'material';
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
  return {id:String(row[0]),clientId:String(row[1]),name:String(row[2]).replace(/^'/,''),level:Number(row[3]),status:String(row[4]),openedAt:String(row[5]),submittedAt:String(row[6]),answers:row[7]?JSON.parse(String(row[7])):{A:{},B:{},C:{},D:'',E:''},marks:row[8]?JSON.parse(String(row[8])):null,score:row[9]===''?null:Number(row[9]),feedback:String(row[10]).replace(/^'/,''),reviewedAt:String(row[11]),version:Number(row[12]||1),program:String(row[13]).replace(/^'/,''),deadline:Number(row[14]),serverNow:Date.now(),notificationStatus:String(row[15]),notificationError:String(row[16]),age:row[17]?Number(row[17]):null,automatic:row[6]?sbExamObjectiveMarks(Number(row[3]),row[7]?JSON.parse(String(row[7])):{A:{},B:{}}):null};
}
// Backend-only marking: student responses never contain these keys or results.
const SB_EXAM_OBJECTIVE_KEYS = {"1": {"A": [1, 1, 2, [0, 1], 1, 0, 1, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 2, 1], "B": ["She works in a department store.", "Where are you from?", "I would like a coffee, please.", "There is a bank on Main Street.", "He doesn't speak Japanese.", "We were at the restaurant yesterday.", "I went to the movies last Saturday.", "She can use a computer.", "Those shirts are very expensive.", "What were you doing at 8:00 last night?"]}, "2": {"A": [1, 0, 0, 2, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], "B": ["I usually take the train to work.", "The flight will arrive at 8:30.", "How long does it take to get to the hotel?", "She is responsible for answering customer complaints.", "We didn't go on a business trip last month.", "There are too many people in this restaurant.", "This hotel is the most comfortable hotel in town.", "I feel like eating something spicy.", "I was driving home when the accident happened.", "I used to play tennis when I was younger."]}, "3": {"A": [0, [0, 1], 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0], "B": ["Have you ever gone to New York?", "I saw him yesterday.", "She has worked here for five years.", "I suggest taking a taxi.", "The museum was built in 1920.", "This bag is mine. Yours is over there.", "The agent told me to return the car with a full tank.", "I had the mechanic check the brakes.", "I haven't been to the theater lately.", "The final report has been completed."]}, "4": {"A": [1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 2, 0, 0, 1, 0, 1, 1, 0, 1], "B": ["The invitations will be sent out tomorrow.", "He said he couldn't come because he had other plans.", "If I have time, I will help you.", "She asked me if she could borrow my phone.", "I apologize for arriving late.", "The airline should have given us a refund.", "I have been working here since 2021.", "If I had more money, I would travel more.", "I wish I could save more every month.", "By the time we arrived, the meeting had already started."]}, "5": {"A": [0, [0, 1], 1, 1, 0, 1, 2, 0, 1, 0, 1, 1, 1, 0, [0, 2], 0, 1, 1, 0, 1], "B": ["I normally go to work by metro.", "While I was working in Dubai, I met my husband.", "She is responsible for organizing the weekly meetings.", "He suggested going to the gym after work.", "I stopped eating fast food because I wanted to be healthier.", "A pharmacist is a person who prepares and sells medicine.", "Before buying packaged food, read the nutrition label.", "If I were you, I would speak to a doctor.", "The tickets can be bought online.", "The article can't have been true; every fact in it was wrong."]}, "6": {"A": [0, 1, 1, 0, 0, [0, 1, 2], 1, 0, 1, 1, 0, [0, 1], 1, 0, 1, 1, 0, 0, 0, 1], "B": ["He is quite a dependable person, but he isn't as patient as his brother.", "Would you mind telling me why you want to learn Spanish?", "If I had stayed at home, I wouldn't have met my best friend.", "The recruiter recommended that I update my résumé.", "She looks like she is feeling much better today.", "The doctor advised that he rest for several days.", "We are going to get the roof repaired next week.", "It was such terrible weather that we stayed indoors.", "It is essential that the government reduce pollution immediately.", "Riding a bike is nearly as cheap as taking the bus."]}};
function sbExamNormalizeCorrection(value){return String(value||'').normalize('NFKC').toLowerCase().replace(/[’‘]/g,"'").replace(/\bdoesn't\b/g,'does not').replace(/\bdidn't\b/g,'did not').replace(/\bcouldn't\b/g,'could not').replace(/\bwouldn't\b/g,'would not').replace(/\bisn't\b/g,'is not').replace(/\bhaven't\b/g,'have not').replace(/\bcan't\b/g,'cannot').replace(/[.,;?!]/g,'').replace(/\s+/g,' ').trim();}
function sbExamObjectiveMarks(level,answers){
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
    if(data.action==='studentPortalAccess')return sbExamResponse({ok:true,passwordSettings:{revision:sbPortalWeek().start+':folders-v2',weekly:true},levelAccess:sbLearningLevelAccess(),items:items.map(item=>{const level=sbLearningItemLevel(item),enabled=item.enabled&&(!level||sbLearningLevelAccess()[String(level)]);return {...item,enabled,url:enabled?item.url:''};})});
    if(data.action==='studentFolderLogin'){
      const group=sbPortalFolderGroup(data.folder),weekly=sbWeeklyPortalPasswords();
      if(/^level:[1-8]$/.test(group)&&!sbLearningLevelAccess()[group.split(':')[1]])throw new Error('This level is currently closed by your instructor.');
      if(String(data.passcode||'')!==weekly.passwords[group])throw new Error('Incorrect folder password.');
      return sbExamResponse({ok:true,revision:weekly.weekStart+':folders-v2'});
    }
    if(data.action==='studentExamLogin') {
      const requestedLevel=data.level===undefined?null:Number(data.level);if(requestedLevel!==null&&(!Number.isInteger(requestedLevel)||requestedLevel<1||requestedLevel>8))throw new Error('Choose a valid level.');
      if(requestedLevel&&!sbLearningLevelAccess()[String(requestedLevel)])throw new Error('This level is currently closed by your instructor.');
      const passcode=sbWeeklyPortalPasswords().passwords[requestedLevel?'level:'+requestedLevel:'assessments'];if(String(data.passcode||'')!==passcode)throw new Error('Incorrect assessment password.');
      const name=String(data.name||'').trim(),program=String(data.program||'').trim(),age=data.age===undefined?'':Number(data.age);if(age!==''&&(!Number.isInteger(age)||age<1||age>120))throw new Error('Enter a valid age.');
      if(!name||name.length>100||!program||program.length>100)throw new Error('Enter your name and program.');
      const levels=items.filter(item=>item.section==='tests'&&item.enabled&&(!requestedLevel||item.id==='test:'+requestedLevel)).map(item=>Number(item.id.split(':')[1]));
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
    if(!Number.isInteger(level)||level<1||level>6)throw new Error('Choose a valid level.');
    if(saved[6]&&Number(saved[6])!==level)throw new Error('Your passcode allows only your selected level.');
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
