// Included in UnifiedCode.gs. Add separately only in a multi-file project.
const SB_PUBLIC_BOOKING_ACTIONS=['studentBookingLogin','studentBookingCalendar','studentBookSlots','studentRegisterSlot'];
const SB_OWNER_BOOKING_ACTIONS=['listRegistrationRequests','reviewRegistration','retryRegistrationNotification','instructorOverview','calendarAvailability','saveCalendarDay','calendarSlots','saveCalendarSlots','bookingSettings','saveBookingSettings','checkStudentPortal'];
const SB_BOOKING_HEADERS=['Request ID','Client ID','Name','Planned sessions','Session IDs','Created at','Status','Notification status','Notification error'];
function setupBookingCalendar(){
 const props=PropertiesService.getScriptProperties(),book=sbExamBook();
 if(!book.getSheetByName('Sessions'))setupSheetReminders();
 let requests=book.getSheetByName('Booking requests');if(!requests)requests=book.insertSheet('Booking requests');
 if(!requests.getLastRow())requests.appendRow(SB_BOOKING_HEADERS);
 else if(JSON.stringify(requests.getRange(1,1,1,9).getValues()[0])!==JSON.stringify(SB_BOOKING_HEADERS))throw new Error('Booking requests headers differ. Existing data was not changed.');
 requests.setFrozenRows(1);requests.getRange('A1:I1').setFontWeight('bold');
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
 const saved=PropertiesService.getScriptProperties().getProperty('SB_CALENDAR_SLOTS_'+date);if(saved!==null&&saved!==undefined)return JSON.parse(saved);

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
  if(data.public!==true&&String(data.passcode||'')!==passcode)throw new Error('Incorrect booking passcode. Please ask your instructor for the current passcode.');
  const payload=Utilities.base64EncodeWebSafe(JSON.stringify({version:data.public===true?'public-calendar-v1':version,public:data.public===true,expires:Date.now()+8*60*60*1000,nonce:Utilities.getUuid()}));
  return {token:payload+'.'+sign(payload)};
 }
 try{const parts=String(data.token||'').split('.');if(parts.length!==2||parts[1]!==sign(parts[0]))throw new Error();const claims=JSON.parse(Utilities.newBlob(Utilities.base64DecodeWebSafe(parts[0])).getDataAsString());if(claims.version!==(claims.public===true?'public-calendar-v1':version)||!Number.isFinite(claims.expires)||claims.expires<=Date.now())throw new Error();}
 catch(error){throw new Error('Calendar access expired. Reopen the calendar to continue.');}
 return {};
}
function sbBookingBusy(book){
 const sessions=sbBookingRows(book.getSheetByName('Sessions'),14).filter(row=>row[0]&&String(row[7])!=='cancelled').map(row=>({start:Date.parse(row[5]),id:String(row[0]),duration:sbSessionDuration(row)}));
 const pending=book.getSheetByName('Booking requests')?sbBookingRows(book.getSheetByName('Booking requests'),9):[];const legacyPending=pending.filter(row=>row[6]==='pending');
 for(const row of legacyPending)for(const item of JSON.parse(String(row[3])))if(!sessions.some(entry=>entry.id===item.id))sessions.push({start:item.starts,id:item.id});
 return sessions.filter(item=>Number.isFinite(item.start));
}
function sbBookingOverlap(start,busy,ownIds=[],duration=90){return busy.some(item=>!ownIds.includes(item.id)&&start<item.start+(item.duration||90)*60000&&start+duration*60000>item.start);}
function sbBookingNotify(sheet,index,row){
 if(['sent','sending'].includes(String(row[7])))return;
 try{
  const to=PropertiesService.getScriptProperties().getProperty('SB_EXAM_NOTIFY_EMAIL');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL to your notification address.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
  row[7]='sending';row[8]='';sheet.getRange(index+2,1,1,9).setValues([row]);
  const lines=JSON.parse(String(row[3])).map(item=>'Session '+item.number+' — '+item.date+' — '+sbDisplayTime(item.time)+' (Cairo time)');
  MailApp.sendEmail({to,subject:'New slot booking — '+String(row[2]).replace(/^'/,''),body:'Name: '+String(row[2]).replace(/^'/,'')+'\n\n'+lines.join('\n')+'\n\nReview the instructor calendar and send class confirmation manually through Actions.\n\nSpeak Boldly',name:'Speak Boldly'});row[7]='sent';
 }catch(error){row[7]='failed';row[8]=sbExamSafe(error.message);}
 sheet.getRange(index+2,1,1,9).setValues([row]);
}
function sbBookingWindow(){const today=sbBookingToday(),end=new Date(today+'T12:00:00Z');end.setUTCDate(end.getUTCDate()+42);return {start:today,end:end.toISOString().slice(0,10)};}
function handlePublicBooking(data){
 const lock=LockService.getScriptLock();
 try{
  const auth=sbBookingAuth(data);
  if(data.action==='studentBookingLogin')return sbExamResponse({ok:true,...auth,registrationVersion:1,paymentEmail:SB_PAYMENT_EMAIL,programDurations:{'English Momentum':60},programs:SB_SESSION_PROGRAMS.filter(program=>!['Assessment','Trial session'].includes(program))});
  lock.waitLock(20000);const book=sbExamBook();if(!book.getSheetByName('Sessions'))throw new Error('The instructor needs to set up the calendar first.');
  if(data.action==='studentBookingCalendar')return sbExamResponse(sbRegistrationCalendar(data,book));
  if(data.action==='studentRegisterSlot')return sbExamResponse(sbSubmitRegistration(data,book));
  throw new Error('Booking now requires instructor approval. Refresh the calendar to send a registration request.');
 }catch(error){return sbExamResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}
function sbCalendarAvailability(book) {
 const sheet=book.getSheetByName('Calendar availability');
 if(!sheet||sheet.getLastRow()<2)return [];
 return sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues().filter(row=>row[0]&&(row[1]===false||String(row[1]).toLowerCase()==='false')).map(row=>row[0] instanceof Date?Utilities.formatDate(row[0],'Africa/Cairo','yyyy-MM-dd'):String(row[0])).filter(date=>/^\d{4}-\d{2}-\d{2}$/.test(date));
}
function sbCalendarDateBlocked(date,book){return sbCalendarAvailability(book||sbExamBook()).includes(String(date));}
function sbSaveCalendarDay(book,data) {
 const date=String(data.date||''),parsed=new Date(date+'T12:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||typeof data.available!=='boolean')throw new Error('Choose a valid date and availability.');
 if(date<sbBookingToday())throw new Error('Only today and future dates can be changed.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  let sheet=book.getSheetByName('Calendar availability');
  if(!sheet){sheet=book.insertSheet('Calendar availability');sheet.appendRow(['Date','Available','Updated at (UTC)']);sheet.setFrozenRows(1);}
  const headers=sheet.getRange(1,1,1,3).getValues()[0];if(JSON.stringify(headers)!==JSON.stringify(['Date','Available','Updated at (UTC)']))throw new Error('Calendar availability headers differ. Existing data was not changed.');
  const rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,3).getValues():[],index=rows.findIndex(row=>(row[0] instanceof Date?Utilities.formatDate(row[0],'Africa/Cairo','yyyy-MM-dd'):String(row[0]))===date),target=index<0?sheet.getLastRow()+1:index+2;
  sheet.getRange(target,1).setNumberFormat('@');sheet.getRange(target,1,1,3).setValues([[date,data.available,new Date().toISOString()]]);
  return {ok:true,blockedDates:sbCalendarAvailability(book),calendarAvailabilityReady:true};
 }finally{lock.releaseLock();}
}
function sbInstructorOverview(book) {
 const clientSheet=book.getSheetByName('Clients'),clients=clientSheet&&clientSheet.getLastRow()>1?clientSheet.getRange(2,1,clientSheet.getLastRow()-1,12).getValues():[],people=new Map(clients.filter(row=>row[0]).map(row=>[String(row[0]),row]));
 const sessionSheet=book.getSheetByName('Sessions'),sessions=sessionSheet&&sessionSheet.getLastRow()>1?sessionSheet.getRange(2,1,sessionSheet.getLastRow()-1,12).getValues():[],today=sbBookingToday(),now=Date.now();
 const classes=sessions.filter(row=>row[0]&&String(row[7])!=='cancelled'&&people.has(String(row[1]))).map(row=>({id:String(row[0]),clientId:String(row[1]),name:String(people.get(String(row[1]))[1]).replace(/^'/,''),date:String(row[3]),time:String(row[4]),startsAt:String(row[5]),number:Number(row[2]),program:String(row[10]||'').replace(/^'/,''),level:String(row[11]||'').replace(/^'/,'')})).filter(item=>Number.isFinite(Date.parse(item.startsAt))).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt));
 const logSheet=book.getSheetByName('EmailLog'),logs=logSheet&&logSheet.getLastRow()>1?logSheet.getRange(2,1,logSheet.getLastRow()-1,7).getValues():[],sent=new Map();
 for(const row of logs){if(row[4]!=='sent'||!row[5])continue;const key=String(row[1])+':'+String(row[2]),time=Date.parse(row[5]);if(Number.isFinite(time))sent.set(key,Math.max(sent.get(key)||0,time));}
 const attemptSheet=book.getSheetByName('Exam attempts'),attempts=attemptSheet&&attemptSheet.getLastRow()>1?attemptSheet.getRange(2,1,attemptSheet.getLastRow()-1,18).getValues():[],pendingReviews=[],reportsToPrepare=[];
 const normalize=value=>String(value||'').replace(/^'/,'').normalize('NFKC').trim().toLowerCase();
 for(const row of attempts){if(!row[0]||!row[6])continue;
  const matching=clients.filter(person=>normalize(person[1])===normalize(row[2])),client=clients.find(person=>String(person[0])===String(row[1]))||(matching.length===1?matching[0]:null),stamp=Date.parse(row[11]||row[6]);
  if(!client||(sent.get(String(client[0])+':final')||0)<stamp){if(!row[11])pendingReviews.push({id:String(row[0]),name:String(row[2]).replace(/^'/,''),level:Number(row[3]),notificationStatus:String(row[15]),submittedAt:String(row[6])});reportsToPrepare.push({id:String(row[0]),clientId:client?String(client[0]):'',name:String(row[2]).replace(/^'/,''),level:Number(row[3]),reviewedAt:String(row[11]),submittedAt:String(row[6]),writingPending:!row[11]});}
 }
 const documentSheet=book.getSheetByName('TeacherDocuments'),documents=documentSheet&&documentSheet.getLastRow()>1?documentSheet.getRange(2,1,documentSheet.getLastRow()-1,4).getValues():[],latest=new Map(),drafts=[];
 for(const row of documents){let record;try{record=JSON.parse(String(row[3]));}catch{continue;}if(String(row[0]).startsWith('draft:')){if(record.values&&Object.values(record.values).some(value=>String(value).trim()))drafts.push({type:record.type,updatedAt:String(row[2])});continue;}if(!record.client?.id||!record.type)continue;const key=String(record.client.id)+':'+String(record.type),stamp=Date.parse(record.preparedAt||row[2]);if(!latest.has(key)||stamp>latest.get(key).stamp)latest.set(key,{record,stamp});}
 const preparedReports=[];for(const [key,entry]of latest){const record=entry.record;if(record.status==='sent'||record.sentAt||(sent.get(key)||0)>=entry.stamp)continue;preparedReports.push({id:record.id,clientId:record.client.id,name:record.client.name,type:record.type,title:record.title,preparedAt:record.preparedAt||''});}
 return {ok:true,today,refreshedAt:new Date().toISOString(),classes:classes.filter(item=>item.date===today),nextClass:classes.find(item=>Date.parse(item.startsAt)>=now)||null,upcomingClasses:classes.filter(item=>item.date>today&&Date.parse(item.startsAt)<now+7*86400000),zoomUrl:PropertiesService.getScriptProperties().getProperty('SB_ZOOM_URL')||'',backupStatus:{lastSuccess:PropertiesService.getScriptProperties().getProperty('SB_BACKUP_LAST_SUCCESS')||'',dailyEnabled:PropertiesService.getScriptProperties().getProperty('SB_BACKUP_DAILY_ENABLED')==='true'},pendingReviews,reportsToPrepare,preparedReports,drafts,registrationRequests:sbRegistrationRows(book).filter(row=>['awaiting','accepting'].includes(String(row[9]))).map(sbRegistrationView)};
}
function handleOwnerBooking(data){
 try{
  const props=PropertiesService.getScriptProperties(),book=sbExamBook();
  if(['listRegistrationRequests','reviewRegistration','retryRegistrationNotification'].includes(data.action))return sbExamResponse(handleRegistrationOwner(data,book));
  if(data.action==='instructorOverview')return sbExamResponse(sbInstructorOverview(book));
  if(data.action==='calendarAvailability')return sbExamResponse({ok:true,blockedDates:sbCalendarAvailability(book),calendarAvailabilityReady:true});
  if(data.action==='calendarSlots')return sbExamResponse(sbOwnerCalendarSlots(data));
  if(data.action==='saveCalendarSlots')return sbExamResponse(sbSaveCalendarSlots(data));
  if(data.action==='saveCalendarDay')return sbExamResponse(sbSaveCalendarDay(book,data));
  if(data.action==='checkStudentPortal')return sbExamResponse({ok:true,examsReady:['Exam attempts','Exam sessions','Portal access'].every(name=>Boolean(book.getSheetByName(name))),bookingReady:['Sessions','Booking requests'].every(name=>Boolean(book.getSheetByName(name))),notificationEmail:props.getProperty('SB_EXAM_NOTIFY_EMAIL')||'',remainingEmailQuota:MailApp.getRemainingDailyQuota()});
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


function sbCalendarSlotRevision(date){return sbExamHash(PropertiesService.getScriptProperties().getProperty('SB_CALENDAR_SLOTS_'+date)||'default');}
function sbOwnerCalendarSlots(data){
 const month=String(data.month||sbBookingToday().slice(0,7));if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(month))throw new Error('Choose a calendar month.');const [year,m]=month.split('-').map(Number),days={},revisions={};for(let n=1;n<=new Date(Date.UTC(year,m,0)).getUTCDate();n++){const date=month+'-'+String(n).padStart(2,'0');days[date]=sbBookingSlots(date);revisions[date]=sbCalendarSlotRevision(date);}return {ok:true,days,revisions};
}
function sbSaveCalendarSlots(data){
 const lock=LockService.getScriptLock();lock.waitLock(20000);try{const date=String(data.date||''),parsed=new Date(date+'T12:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(parsed.getTime())||parsed.toISOString().slice(0,10)!==date||date<sbBookingToday())throw new Error('Choose today or a future date.');if(data.revision!==sbCalendarSlotRevision(date))throw new Error('The slots changed on another device. Refresh the calendar before editing.');if(!Array.isArray(data.slots)||data.slots.length>24)throw new Error('Use up to 24 availability windows per day.');const slots=data.slots.map(item=>{const time=String(item.time||''),endTime=String(item.endTime||'');if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(endTime)||endTime<=time||typeof item.enabled!=='boolean')throw new Error('Enter a valid start, later end time, and access setting.');return {time,endTime,enabled:item.enabled,label:time+'–'+endTime};}).sort((a,b)=>a.time.localeCompare(b.time));for(let i=1;i<slots.length;i++)if(slots[i].time<slots[i-1].endTime)throw new Error('Availability windows must not overlap.');PropertiesService.getScriptProperties().setProperty('SB_CALENDAR_SLOTS_'+date,JSON.stringify(slots));return {ok:true,date,slots,revision:sbCalendarSlotRevision(date)};}finally{lock.releaseLock();}
}
