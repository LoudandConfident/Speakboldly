// Included in UnifiedCode.gs. Add separately only in a multi-file project.
const SB_PUBLIC_BOOKING_ACTIONS=['studentBookingLogin','studentBookingCalendar','studentBookSlots'];
const SB_OWNER_BOOKING_ACTIONS=['bookingSettings','saveBookingSettings','checkStudentPortal'];
const SB_BOOKING_HEADERS=['Request ID','Client ID','Name','Planned sessions','Session IDs','Created at','Status','Notification status','Notification error'];
function setupBookingCalendar(){
 const props=PropertiesService.getScriptProperties(),book=sbExamBook();
 if(!book.getSheetByName('Sessions'))setupSheetReminders();
 let requests=book.getSheetByName('Booking requests');if(!requests)requests=book.insertSheet('Booking requests');
 if(!requests.getLastRow())requests.appendRow(SB_BOOKING_HEADERS);
 else if(JSON.stringify(requests.getRange(1,1,1,9).getValues()[0])!==JSON.stringify(SB_BOOKING_HEADERS))throw new Error('Booking requests headers differ. Existing data was not changed.');
 requests.setFrozenRows(1);requests.getRange('A1:I1').setFontWeight('bold');
 if(!props.getProperty('SB_BOOKING_PASSCODE'))props.setProperty('SB_BOOKING_PASSCODE','19962');
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
 const sessions=sbBookingRows(book.getSheetByName('Sessions'),10).filter(row=>row[0]&&String(row[7])!=='cancelled').map(row=>({start:Date.parse(row[5]),id:String(row[0])}));
 const pending=sbBookingRows(book.getSheetByName('Booking requests'),9).filter(row=>row[6]==='pending');
 for(const row of pending)for(const item of JSON.parse(String(row[3])))if(!sessions.some(entry=>entry.id===item.id))sessions.push({start:item.starts,id:item.id});
 return sessions.filter(item=>Number.isFinite(item.start));
}
function sbBookingOverlap(start,busy,ownIds=[]){return busy.some(item=>!ownIds.includes(item.id)&&start<item.start+90*60000&&start+90*60000>item.start);}
function sbBookingNotify(sheet,index,row){
 if(['sent','sending'].includes(String(row[7])))return;
 try{
  const to=PropertiesService.getScriptProperties().getProperty('SB_EXAM_NOTIFY_EMAIL');if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL to your notification address.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
  row[7]='sending';row[8]='';sheet.getRange(index+2,1,1,9).setValues([row]);
  const lines=JSON.parse(String(row[3])).map(item=>'Session '+item.number+' — '+item.date+' — '+item.time+' (Cairo time)');
  MailApp.sendEmail({to,subject:'New slot booking — '+String(row[2]).replace(/^'/,''),body:'Name: '+String(row[2]).replace(/^'/,'')+'\n\n'+lines.join('\n')+'\n\nReview the instructor calendar and send class confirmation manually through Actions.\n\nSpeak Boldly',name:'Speak Boldly'});row[7]='sent';
 }catch(error){row[7]='failed';row[8]=sbExamSafe(error.message);}
 sheet.getRange(index+2,1,1,9).setValues([row]);
}
function handlePublicBooking(data){
 const lock=LockService.getScriptLock();
 try{
  const auth=sbBookingAuth(data);if(data.action==='studentBookingLogin')return sbExamResponse({ok:true,...auth});
  lock.waitLock(20000);const book=sbExamBook();if(!book.getSheetByName('Sessions')||!book.getSheetByName('Booking requests'))throw new Error('The instructor needs to run setupStudentPortal first.');
  const busy=sbBookingBusy(book),today=sbBookingToday();
  if(data.action==='studentBookingCalendar'){
   const month=String(data.month||today.slice(0,7));if(!/^\d{4}-\d{2}$/.test(month))throw new Error('Choose a valid month.');
   const [year,m]=month.split('-').map(Number),[cy,cm]=today.slice(0,7).split('-').map(Number),difference=(year-cy)*12+m-cm;
   if(m<1||m>12||difference<0||difference>2)throw new Error('Booking is available for the current month and the next two months.');
   const count=new Date(Date.UTC(year,m,0)).getUTCDate(),days=[];
   for(let n=1;n<=count;n++){
    const date=month+'-'+String(n).padStart(2,'0'),slots=[];
    for(const slot of sbBookingSlots(date)){const start=sbCairoTimestamp(date,slot.time),status=start<=Date.now()?'past':sbBookingOverlap(start,busy)?'taken':'available';slots.push({...slot,date,status});}
    days.push({date,slots});
   }
   return sbExamResponse({ok:true,month,today,timeZone:'Africa/Cairo',days});
  }
  const name=String(data.name||'').trim(),requestId=String(data.requestId||'');
  if(!name||name.length>100||! /^[A-Za-z0-9-]{1,100}$/.test(requestId)||!Array.isArray(data.slots)||!data.slots.length||data.slots.length>16)throw new Error('Enter your registered name and select between 1 and 16 slots.');
  const clients=sbBookingRows(book.getSheetByName('Clients'),12),normalized=value=>String(value||'').replace(/^'/,'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
  const matches=clients.filter(row=>normalized(row[1])===normalized(name));if(matches.length!==1)throw new Error('Use your registered name. Ask your instructor to check your client record.');
  const client=matches[0];if(String(client[5])!=='Paid')throw new Error('Your instructor needs to finalize your payment status before you can book.');
  const slots=data.slots.map(item=>({date:String(item.date||''),time:String(item.time||'')})).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
  if(new Set(slots.map(item=>item.date+' '+item.time)).size!==slots.length)throw new Error('Select each slot only once.');
  const sheet=book.getSheetByName('Booking requests'),rows=sbBookingRows(sheet,9);let index=rows.findIndex(row=>String(row[0])===requestId),row=index<0?null:rows[index];
  if(row){const previous=JSON.parse(String(row[3])).map(item=>({date:item.date,time:item.time}));if(String(row[1])!==String(client[0])||JSON.stringify(previous)!==JSON.stringify(slots))throw new Error('Booking request changed. Start a new selection.');}
  let plans=row?JSON.parse(String(row[3])):[];
  if(!row){
   const sessionRows=sbBookingRows(book.getSheetByName('Sessions'),10);let number=sessionRows.filter(item=>String(item[1])===String(client[0])).reduce((maximum,item)=>Math.max(maximum,Number(item[2])||0),0);for(const pending of rows.filter(entry=>String(entry[1])===String(client[0])&&entry[6]==='pending'))for(const item of JSON.parse(String(pending[3])))number=Math.max(number,Number(item.number)||0);
   for(const slot of slots){
    if(!sbBookingSlots(slot.date).some(item=>item.time===slot.time))throw new Error('Choose one of the available calendar slots.');
    const starts=sbCairoTimestamp(slot.date,slot.time);if(starts<=Date.now()||starts>Date.now()+90*86400000)throw new Error('Choose a future slot within the next three months.');
    if(sbBookingOverlap(starts,busy)||sbBookingOverlap(starts,plans))throw new Error('One of your selected slots has just been taken. Refresh the calendar and choose another slot.');
    number++;if(number>9999)throw new Error('Ask your instructor to check your session numbers.');
    const item={clientId:String(client[0]),number,date:slot.date,time:slot.time,program:String(client[11]||''),level:String(client[4]||'')};plans.push({...item,id:sbSessionId(item),starts,start:starts});
   }
   row=[requestId,String(client[0]),sbExamSafe(client[1]),JSON.stringify(plans),JSON.stringify(plans.map(item=>item.id)),new Date().toISOString(),'pending','',''];sheet.appendRow(row);index=sheet.getLastRow()-2;
  }
  if(row[6]!=='complete'){
   const sessions=book.getSheetByName('Sessions'),existing=sbBookingRows(sessions,10),ownIds=plans.map(item=>item.id);
   const missing=plans.filter(item=>!existing.some(entry=>String(entry[0])===item.id));
   if(missing.some(item=>sbBookingOverlap(item.starts,busy,ownIds)))throw new Error('A selected slot is no longer available. Contact your instructor.');
   if(missing.length){const first=sessions.getLastRow()+1;sessions.getRange(first,4,missing.length,2).setNumberFormat('@');sessions.getRange(first,1,missing.length,12).setValues(missing.map(item=>[item.id,item.clientId,item.number,item.date,item.time,new Date(item.starts).toISOString(),new Date(item.starts-86400000).toISOString(),'pending','','',item.program||'',item.level||'']));}
   row[6]='complete';sheet.getRange(index+2,1,1,9).setValues([row]);
  }
  sbBookingNotify(sheet,index,row);
  return sbExamResponse({ok:true,booked:plans.map(item=>({date:item.date,time:item.time,number:item.number})),notificationStatus:String(row[7])});
 }catch(error){return sbExamResponse({ok:false,error:error.message});}
 finally{if(lock.hasLock())lock.releaseLock();}
}
function handleOwnerBooking(data){
 try{
  const props=PropertiesService.getScriptProperties(),book=sbExamBook();
  if(data.action==='checkStudentPortal')return sbExamResponse({ok:true,examsReady:['Exam attempts','Exam sessions','Portal access'].every(name=>Boolean(book.getSheetByName(name))),bookingReady:['Sessions','Booking requests'].every(name=>Boolean(book.getSheetByName(name)))&&Boolean(props.getProperty('SB_BOOKING_PASSCODE')),notificationEmail:props.getProperty('SB_EXAM_NOTIFY_EMAIL')||'',remainingEmailQuota:MailApp.getRemainingDailyQuota()});
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
