import {randomUUID} from 'node:crypto';
import nodemailer from 'nodemailer';
import {validateSession} from './admin-calendar.js';
export const ZOOM_URL='https://us06web.zoom.us/j/79051707388';
export const ZOOM_PASSCODE='7P1NpA';
const day=24*60*60*1000;
const cairoParts=timestamp=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(new Date(timestamp)).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
export function cairoSessionTimestamp(date,time){
 if(!/^\d{2}:\d{2}$/.test(time)||Number(time.slice(0,2))>23||Number(time.slice(3))>59)throw new Error('Choose a valid class time.');
 const utc=Date.parse(date+'T'+time+':00Z'),matches=[];
 for(const offset of [2,3]){const candidate=utc-offset*3600000,p=cairoParts(candidate);if(`${p.year}-${p.month}-${p.day}`===date&&`${p.hour}:${p.minute}`===time)matches.push(candidate);}
 if(matches.length!==1)throw new Error('This Cairo time is skipped or repeated by a daylight-saving change. Choose a different time.');
 return matches[0];
}
export function reminderMessage({name,number,startsAt,id}){
 const date=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date(startsAt));
 const time=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',hour:'numeric',minute:'2-digit',hour12:true}).format(new Date(startsAt));
 return {subject:`Your class confirmation — Session ${number} — Speak Boldly`,messageId:`<class-${id}@speakboldly.local>`,text:`Hello ${name},\n\nThis is a reminder confirming your upcoming English class.\n\nSession number: ${number}\nDate: ${date}\nTime: ${time} (Cairo time)\n\nJoin on Zoom:\n${ZOOM_URL}\nPasscode: ${ZOOM_PASSCODE}\n\nPlease note: No same-day cancellations are allowed.\n\nSee you in class!\nSpeak Boldly\nMira Nasser Louis`};
}
export function createReminderMailer(env){
 if(!env.SMTP_HOST||!env.SMTP_USER||!env.SMTP_PASSWORD)return null;
 const port=Number(env.SMTP_PORT||587),transport=nodemailer.createTransport({host:env.SMTP_HOST,port,secure:port===465,requireTLS:port!==465,auth:{user:env.SMTP_USER,pass:env.SMTP_PASSWORD},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:15000});
 return async record=>{const result=await transport.sendMail({from:env.SMTP_FROM||'speakboldly16@gmail.com',replyTo:'speakboldly16@gmail.com',to:record.to,...reminderMessage(record)});if(!result.accepted?.length||result.rejected?.length)throw new Error('Recipient was not accepted.');};
}
export function createClassReminders({db,getClient,now=()=>Date.now(),sendEmail=null}){
 db.exec(`CREATE TABLE IF NOT EXISTS class_sessions(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),number INTEGER NOT NULL,date TEXT NOT NULL,time TEXT NOT NULL,starts_at INTEGER NOT NULL,remind_at INTEGER NOT NULL,status TEXT NOT NULL DEFAULT 'pending',attempts INTEGER NOT NULL DEFAULT 0,retry_at INTEGER NOT NULL DEFAULT 0,sent_at INTEGER);`);
 // SMTP cannot prove whether an interrupted delivery was accepted. Do not resend blindly.
 db.prepare("UPDATE class_sessions SET status='delivery_unknown' WHERE status='sending'").run();
 function list(){return db.prepare('SELECT * FROM class_sessions ORDER BY starts_at').all().map(row=>({id:row.id,clientId:row.client_id,name:getClient(row.client_id)?.name||'',number:row.number,date:row.date,time:row.time,reminderStatus:row.status,reminderAt:new Date(row.remind_at).toISOString(),sentAt:row.sent_at?new Date(row.sent_at).toISOString():null}));}
 function save(input){
  const client=getClient(input.clientId);if(!client)throw new Error('Choose an existing client in private storage.');
  const record=validateSession({...input,name:client.name});if(!record.time)throw new Error('Choose a class time for the reminder.');
  const startsAt=cairoSessionTimestamp(record.date,record.time);if(startsAt<=now())throw new Error('Choose a future class date and time.');
  if(db.prepare("SELECT id FROM class_sessions WHERE client_id=? AND number=? AND status!='cancelled'").get(client.id,record.number))throw new Error('This client already has that session number. Cancel the old entry before rescheduling.');
  const id=randomUUID();db.prepare('INSERT INTO class_sessions(id,client_id,number,date,time,starts_at,remind_at) VALUES(?,?,?,?,?,?,?)').run(id,client.id,record.number,record.date,record.time,startsAt,startsAt-day);
  return list().find(row=>row.id===id);
 }
 function cancel(id){const row=db.prepare('SELECT status FROM class_sessions WHERE id=?').get(id);if(!row)throw new Error('Class not found.');if(row.status==='sending')throw new Error('A reminder is being sent. Try again shortly.');db.prepare("UPDATE class_sessions SET status='cancelled' WHERE id=?").run(id);}
 function queueUpcoming(){
  if(!sendEmail)throw new Error('Email sending is not connected yet.');
  const result=db.prepare("UPDATE class_sessions SET remind_at=MIN(remind_at,?),retry_at=0 WHERE starts_at>? AND attempts<3 AND status IN ('pending','failed')").run(now(),now());
  return {queued:Number(result.changes)};
 }
 let busy=false;
 async function runDue(){
  if(busy||!sendEmail)return;busy=true;
  try{
   db.prepare("UPDATE class_sessions SET status='expired' WHERE starts_at<=? AND status IN ('pending','failed')").run(now());
   const rows=db.prepare("SELECT * FROM class_sessions WHERE remind_at<=? AND starts_at>? AND retry_at<=? AND attempts<3 AND status IN ('pending','failed') ORDER BY remind_at LIMIT 20").all(now(),now(),now());
   for(const row of rows){
    const claimed=db.prepare("UPDATE class_sessions SET status='sending',attempts=attempts+1 WHERE id=? AND status IN ('pending','failed')").run(row.id);if(!claimed.changes)continue;
    try{const client=getClient(row.client_id);if(!client?.email)throw new Error('Client email missing.');await sendEmail({to:client.email,name:client.name,number:row.number,startsAt:row.starts_at,id:row.id});db.prepare("UPDATE class_sessions SET status='sent',sent_at=? WHERE id=?").run(now(),row.id);}
    catch{db.prepare("UPDATE class_sessions SET status='failed',retry_at=? WHERE id=?").run(now()+5*60000,row.id);}
   }
  }finally{busy=false;}
 }
 return{list,save,cancel,queueUpcoming,runDue,emailReady:!!sendEmail};
}
