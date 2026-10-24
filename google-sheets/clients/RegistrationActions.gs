// Included in UnifiedCode.gs. Registration requests are private until approved.
const SB_REGISTRATION_HEADERS=['Request ID','Name','Email','Program','Payment claimed','Appointment type','Date (Cairo)','Time (Cairo)','Duration (minutes)','Status','Created at (UTC)','Client ID','Session ID','Decided at (UTC)','Notification status','Notification error'];
const SB_PAYMENT_EMAIL='billing@speakboldly.space';
function sbRegistrationType(kind,program){
 const types={placement:{title:'Placement test',duration:30,program:'Assessment'},session:{title:'Session',duration:90},workshop:{title:'Workshop',duration:90},trial:{title:'Trial session',duration:60,program:'Trial session'}};
 if(!Object.prototype.hasOwnProperty.call(types,String(kind)))throw new Error('Choose Session, Workshop, Placement test, or Trial session.');
 return {...types[kind],...(kind==='session'&&program==='English Momentum'?{duration:60}:{})};
}
function sbRegistrationSlots(date,kind,program){
 const type=sbRegistrationType(kind,program),slots=[];
 for(const slot of sbBookingSlots(date).filter(slot=>slot.enabled!==false)){
  const [hour,minute]=slot.time.split(':').map(Number),first=hour*60+minute;const end=slot.endTime?Number(slot.endTime.slice(0,2))*60+Number(slot.endTime.slice(3)):first+90;
  for(let offset=0;offset+type.duration<=end-first;offset+=type.duration){const start=first+offset,end=start+type.duration,format=value=>String(Math.floor(value/60)).padStart(2,'0')+':'+String(value%60).padStart(2,'0');slots.push({time:format(start),endTime:format(end),label:format(start)+'–'+format(end),duration:type.duration});}
 }
 return slots;
}
function sbRegistrationSheet(book,create=false){
 let sheet=book.getSheetByName('Registration requests');
 if(!sheet&&create){sheet=book.insertSheet('Registration requests');sheet.appendRow(SB_REGISTRATION_HEADERS);sheet.setFrozenRows(1);}
 if(sheet&&JSON.stringify(sheet.getRange(1,1,1,SB_REGISTRATION_HEADERS.length).getValues()[0])!==JSON.stringify(SB_REGISTRATION_HEADERS))throw new Error('Registration requests headers differ. Existing records were kept.');
 return sheet;
}
function sbRegistrationView(row){
 return {id:String(row[0]),name:String(row[1]).replace(/^'/,''),email:String(row[2]).replace(/^'/,''),program:String(row[3]).replace(/^'/,''),paid:String(row[4]),kind:String(row[5]),date:String(row[6]),time:String(row[7]),duration:Number(row[8]),status:String(row[9]),createdAt:String(row[10]),clientId:String(row[11]),sessionId:String(row[12]),decidedAt:String(row[13]),notificationStatus:String(row[14]),notificationError:String(row[15])};
}
function sbRegistrationRows(book){const sheet=sbRegistrationSheet(book);return sheet?sbBookingRows(sheet,SB_REGISTRATION_HEADERS.length):[];}
function sbRegistrationNotify(sheet,index,row){
 if(['sent','sending'].includes(String(row[14])))return;
 try{
  const to=SB_PAYMENT_EMAIL;
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to||''))throw new Error('Set SB_EXAM_NOTIFY_EMAIL to your notification address.');
  if(MailApp.getRemainingDailyQuota()<1)throw new Error('Daily email quota reached.');
  const item=sbRegistrationView(row),type=sbRegistrationType(item.kind,item.program),slot=sbRegistrationSlots(item.date,item.kind,item.program).find(slot=>slot.time===item.time);
  const url='https://speakboldly.space/instructor.html?bookingRequest='+encodeURIComponent(item.id);
  const lines=['Name: '+item.name,'Email: '+item.email,'Program: '+item.program,'Appointment: '+type.title,'Date: '+item.date,'Time: '+sbDisplayTime(item.time)+'–'+sbDisplayTime(slot?.endTime||'')+' (Cairo time)','Duration: '+type.duration+' minutes','Payment reported by student: '+item.paid,'',item.kind==='trial'?'Trial session: no payment screenshot required.':'Payment screenshots are sent separately to '+SB_PAYMENT_EMAIL+'. Check payment before approving.','','Accept: '+url+'&decision=accept','Decline: '+url+'&decision=decline','','Sign in to the Instructor Portal and confirm your decision. The slot is not reserved until accepted.','','Speak Boldly'];
  const verifiedFrom=sbVerifiedFrom('billing@speakboldly.space');
  row[14]='sending';row[15]='';sheet.getRange(index+2,1,1,16).setValues([row]);
  sbSendDomainEmail({to,subject:'Registration request — '+type.title+' — '+item.name,body:lines.join('\n'),name:'Speak Boldly',replyTo:'billing@speakboldly.space'},verifiedFrom);row[14]='sent';
 }catch(error){row[14]=row[14]==='sending'?'delivery_unknown':'failed';row[15]=sbExamSafe(error.message);}
 sheet.getRange(index+2,1,1,16).setValues([row]);
}
function sbRegistrationCalendar(data,book){
 const kind=String(data.kind||'session'),type=sbRegistrationType(kind,String(data.program||'')),window=sbBookingWindow(),today=window.start,month=String(data.month||today.slice(0,7));
 if(!/^\d{4}-\d{2}$/.test(month)||Number(month.slice(5))<1||Number(month.slice(5))>12||month<today.slice(0,7)||month>window.end.slice(0,7))throw new Error('Booking is available only within the next six weeks.');
 const busy=sbBookingBusy(book),blocked=new Set(sbCalendarAvailability(book)),[year,m]=month.split('-').map(Number),count=new Date(Date.UTC(year,m,0)).getUTCDate(),days=[];
 for(let day=1;day<=count;day++){
  const date=month+'-'+String(day).padStart(2,'0'),available=!blocked.has(date)&&date>=today&&date<=window.end;
  const slots=sbRegistrationSlots(date,kind,String(data.program||'')).map(slot=>{const start=sbCairoTimestamp(date,slot.time);return {...slot,date,status:start<=Date.now()?'past':sbBookingOverlap(start,busy,[],type.duration)?'taken':!available?'unavailable':'available'};});days.push({date,available,slots});
 }
 return {ok:true,registrationVersion:1,month,today,kind,duration:type.duration,timeZone:'Africa/Cairo',windowStart:today,windowEnd:window.end,days};
}
function sbSubmitRegistration(data,book){
 const name=String(data.name||'').normalize('NFKC').trim().replace(/\s+/g,' '),email=String(data.email||'').trim().toLowerCase(),kind=String(data.kind||''),type=sbRegistrationType(kind,String(data.program||'').trim()),program=String(data.program||(kind==='placement'?'Assessment':kind==='trial'?'Trial session':kind==='workshop'?'Workshop':'Session')).trim(),paid=String(data.paid||''),id=String(data.requestId||''),date=String(data.date||''),time=String(data.time||'');
 if(!name||name.length>100||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Enter your name and a valid email address.');
 if((!SB_SESSION_PROGRAMS.includes(program)&&!['Session','Workshop'].includes(program))||(['session','workshop'].includes(kind)&&['Assessment','Trial session'].includes(program)))throw new Error('Choose the course you are registering for.');if(kind==='workshop'&&program!=='Workshop'&&!/workshop/i.test(program))throw new Error('Choose a workshop program.');
 if(!['yes','no','not-required'].includes(paid)||! /^[A-Za-z0-9-]{1,100}$/.test(id))throw new Error('Choose your payment status and retry.');
 if(program==='Make-up / revision session'&&(kind!=='session'||sbBookingRows(book.getSheetByName('Clients'),3).filter(person=>String(person[2]).replace(/^'/,'').trim().toLowerCase()===email).length!==1))throw new Error('Make-up / revision sessions are for already enrolled clients. Use your registered email and choose Session.');
 const sheet=sbRegistrationSheet(book,true),rows=sbBookingRows(sheet,16),fingerprint=row=>[String(row[1]).replace(/^'/,''),String(row[2]).replace(/^'/,''),String(row[3]).replace(/^'/,''),String(row[4]),String(row[5]),String(row[6]),String(row[7])].join('|'),values=[name,email,program,paid,kind,date,time].join('|');
 let index=rows.findIndex(row=>String(row[0])===id);
 if(index>=0){if(fingerprint(rows[index])!==values)throw new Error('This request changed. Start a new request.');return {ok:true,requestId:id,status:String(rows[index][9]),notificationStatus:String(rows[index][14])};}
 const same=rows.find(row=>['awaiting','accepting'].includes(String(row[9]))&&fingerprint(row)===values);if(same)return {ok:true,requestId:String(same[0]),status:String(same[9]),notificationStatus:String(same[14])};
 if(rows.filter(row=>String(row[2]).replace(/^'/,'')===email&&['awaiting','accepting'].includes(String(row[9]))).length>=5)throw new Error('You already have five pending requests. Contact your instructor before requesting more.');
 const window=sbBookingWindow();if(date<window.start||date>window.end||sbCalendarDateBlocked(date,book))throw new Error('This date is unavailable.');
 if(!sbRegistrationSlots(date,kind,program).some(slot=>slot.time===time))throw new Error('Choose an available start time for this appointment type.');
 const start=sbCairoTimestamp(date,time);if(start<=Date.now()||sbBookingOverlap(start,sbBookingBusy(book),[],type.duration))throw new Error('This slot is no longer available. Refresh the calendar.');
 if(rows.filter(row=>String(row[10]).slice(0,10)===new Date().toISOString().slice(0,10)).length>=50)throw new Error('The daily registration request limit has been reached. Contact your instructor.');
 const row=[id,sbExamSafe(name),sbExamSafe(email),sbExamSafe(program),paid,kind,date,time,type.duration,'awaiting',new Date().toISOString(),'','','','',''];sheet.getRange(sheet.getLastRow()+1,7,1,2).setNumberFormat('@');sheet.appendRow(row);index=sheet.getLastRow()-2;sbRegistrationNotify(sheet,index,row);
 return {ok:true,requestId:id,status:'awaiting',notificationStatus:String(row[14])};
}
function sbRegistrationClient(book,row,data){
 const sheet=book.getSheetByName('Clients'),rows=sbBookingRows(sheet,14),email=String(row[2]).replace(/^'/,''),matches=rows.filter(person=>String(person[2]).replace(/^'/,'').trim().toLowerCase()===email),existing=row[11]?rows.find(person=>String(person[0])===String(row[11])):matches[0];
 if(matches.length>1)throw new Error('More than one client uses this email. Resolve the duplicate client records first.');
 if(data.clientId&&(!existing||String(existing[0])!==String(data.clientId)))throw new Error('The client record changed. Refresh before accepting.');
 if(existing)return {sheet,row:existing,index:rows.findIndex(person=>String(person[0])===String(existing[0]))+2,isNew:false};
 const normalize=value=>String(value).replace(/^'/,'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
 if(rows.some(person=>normalize(person[1])===normalize(row[1])))throw new Error('A client with this name has a different email. Update their record before accepting.');
 const used=new Set(rows.map(person=>String(person[3]).padStart(4,'0'))),reserved=PropertiesService.getScriptProperties().getProperty('SB_INSTRUCTOR_CODE');
 let code;for(let value=1000;value<=9999;value++){const candidate=String(value);if(!used.has(candidate)&&candidate!==reserved&&candidate!=='1962'){code=candidate;break;}}if(!code)throw new Error('No student codes are available.');
 return {sheet,row:[String(row[11]||'registration-'+Utilities.getUuid()),row[1],row[2],code,sbExamSafe(String(data.level||'Not assessed')),'Unpaid',0,0,new Date().toISOString(),'[]','[]',row[3],0,new Date().toISOString()],index:sheet.getLastRow()+1,isNew:true};
}
function handleRegistrationOwner(data,book){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sheet=sbRegistrationSheet(book),rows=sheet?sbBookingRows(sheet,16):[];
  if(data.action==='listRegistrationRequests')return {ok:true,requests:rows.filter(row=>['awaiting','accepting'].includes(String(row[9]))).map(sbRegistrationView)};
  const index=rows.findIndex(row=>String(row[0])===String(data.requestId));if(index<0)throw new Error('Registration request not found.');const row=rows[index];
  if(data.action==='retryRegistrationNotification'){if(row[14]!=='failed')throw new Error('Only a failed notification can be retried. Check delivery before retrying uncertain messages.');sbRegistrationNotify(sheet,index,row);return {ok:true,request:sbRegistrationView(row)};}
  if(!['accept','decline'].includes(data.decision))throw new Error('Choose Accept or Decline.');
  if(row[9]==='accepted'||row[9]==='declined'){if(row[9]!==({accept:'accepted',decline:'declined'}[data.decision]))throw new Error('This request was already decided.');return {ok:true,request:sbRegistrationView(row)};}
  if(data.decision==='decline'){if(row[9]==='accepting')throw new Error('Acceptance is in progress. Retry Accept to finish safely.');row[9]='declined';row[13]=new Date().toISOString();sheet.getRange(index+2,1,1,16).setValues([row]);return {ok:true,request:sbRegistrationView(row)};}
  const payment=String(data.payment||''),level=String(data.level||'Not assessed');if(!['Paid','Part paid','Unpaid'].includes(payment)||!(/^[1-9]\d{0,3}$/.test(level)||['Not assessed','A1','A2','B1','B2','C1','C2'].includes(level)))throw new Error('Choose the verified payment status and level.');
  const requestedCourse=String(row[3]).replace(/^'/,''),course=['Session','Workshop'].includes(requestedCourse)?String(data.program||''):requestedCourse;if(['session','workshop'].includes(String(row[5]))&&(!SB_SESSION_PROGRAMS.includes(course)||['Assessment','Trial session'].includes(course)))throw new Error('Choose the registered program before accepting this session.');if(String(row[5])==='workshop'&&!/workshop/i.test(course))throw new Error('Choose the registered workshop.');
  const type=sbRegistrationType(String(row[5]),course);if(type.duration!==Number(row[8]))throw new Error('The program duration does not match this booking. Ask for a booking from the correct program.');const program=type.program||course,start=sbCairoTimestamp(String(row[6]),String(row[7])),sessions=sbSessionsSheet(),sessionRows=sbBookingRows(sessions,14),saved=row[12]?sessionRows.find(item=>String(item[0])===String(row[12])):null;
  if(!saved){if(!sbRegistrationSlots(String(row[6]),String(row[5]),course).some(slot=>slot.time===String(row[7])))throw new Error('This availability window was removed or dimmed. Ask the student to choose another slot.');const window=sbBookingWindow();if(start<=Date.now()||String(row[6])>window.end||sbCalendarDateBlocked(String(row[6]),book))throw new Error('This date is no longer available. Ask the student to choose another slot.');if(sbBookingOverlap(start,sbBookingBusy(book),[],type.duration))throw new Error('This slot has been taken. Decline this request or ask the student to choose another slot.');}
  const client=sbRegistrationClient(book,row,data),number=sessionRows.filter(item=>String(item[1])===String(client.row[0])&&String(item[10]||'')===program).reduce((max,item)=>Math.max(max,Number(item[2])||0),0)+1;
  const plan={clientId:String(client.row[0]),number,date:String(row[6]),time:String(row[7]),program,course:['Assessment','Trial session'].includes(course)?'':course,level,duration:type.duration};
  if(!saved)row[12]=sbSessionId(plan);row[11]=String(client.row[0]);row[9]='accepting';sheet.getRange(index+2,1,1,16).setValues([row]);
  if(client.isNew){client.row[11]=sbExamSafe(course);client.sheet.getRange(1,10,1,5).setValues([['Permissions','Level history','Program','Hours baseline','Hours baseline set at (UTC)']]);client.row[5]=payment;client.sheet.getRange(client.index,4).setNumberFormat('@');client.sheet.getRange(client.index,1,1,14).setValues([client.row]);}else if(!saved){client.sheet.getRange(client.index,6).setValue(payment);}
  if(!saved){plan.number=number;const plannedId=sbSessionId(plan);if(plannedId!==String(row[12]))throw new Error('The client session numbers changed while accepting. Contact your instructor before retrying.');sbSaveSheetSession(plan);}
  row[9]='accepted';row[13]=new Date().toISOString();sheet.getRange(index+2,1,1,16).setValues([row]);
  return {ok:true,request:sbRegistrationView(row)};
 }finally{lock.releaseLock();}
}
