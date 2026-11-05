import {createHmac,timingSafeEqual,createHash} from 'node:crypto';
import {DatabaseSync} from 'node:sqlite';
import {mkdirSync} from 'node:fs';
import {join} from 'node:path';
import {connect as tlsConnect} from 'node:tls';

const MAILBOX='Contactus@speakboldly.space';
export function privateMailSignature(raw,secret){return createHmac('sha256',secret).update(raw).digest('base64url');}
export function validatePrivateMail(input,now=Date.now()){
 if(!input||!/^[-a-zA-Z0-9]{8,100}$/.test(input.requestId||''))throw Error('Invalid request ID.');
 if(typeof input.to!=='string'||!/^[^\s<>,;@]+@[^\s<>,;@]+\.[^\s<>,;@]+$/.test(input.to))throw Error('One valid recipient is required.');
 if(typeof input.subject!=='string'||!input.subject.trim()||input.subject.length>250||/[\r\n]/.test(input.subject))throw Error('Invalid subject.');
 for(const name of ['text','html'])if(typeof input[name]!=='string'||input[name].length>100000)throw Error('Invalid message content.');
 if(!Number.isFinite(input.timestamp)||Math.abs(now-input.timestamp)>300000)throw Error('Expired request.');
 const a=input.attachment;if(!a||a.mimeType!=='application/pdf'||typeof a.name!=='string'||!a.name.endsWith('.pdf')||a.name.length>200||/[\r\n/\\]/.test(a.name)||typeof a.base64!=='string'||a.base64.length>7400000||!/^[A-Za-z0-9+/]+={0,2}$/.test(a.base64))throw Error('Invalid PDF attachment.');
 const pdf=Buffer.from(a.base64,'base64');if(pdf.length>5500000||!pdf.subarray(0,5).equals(Buffer.from('%PDF-')))throw Error('Invalid PDF attachment.');
 return {requestId:input.requestId,to:input.to,subject:input.subject,text:input.text,html:input.html,attachment:{name:a.name,mimeType:a.mimeType,base64:a.base64}};
}

// Narrow IMAP client: TLS, login, Sent selection, Message-ID search and APPEND only.
export async function connectSentMailbox({user,password,folder,connect=tlsConnect}){
 if(!folder||folder.length>150||/[\r\n\x00-\x1f]/.test(folder))throw Error('Configure the verified Sent folder first.');
 const quote=value=>{if(/[\r\n\x00]/.test(value))throw Error('Invalid mailbox configuration.');return '"'+value.replace(/\\/g,'\\\\').replace(/"/g,'\\"')+'"';};
 const socket=connect({host:'mail.privateemail.com',port:993,servername:'mail.privateemail.com',rejectUnauthorized:true});socket.setTimeout(20000,()=>socket.destroy(Error('Mailbox timeout.')));
 let buffer='',queue=[],waiting=[],failure=null,tag=0;
 const fail=()=>{failure=Error('Sent mailbox connection failed.');for(const waiter of waiting.splice(0))waiter.reject(failure);};
 socket.on('error',fail);socket.on('close',fail);socket.on('data',bytes=>{buffer+=bytes.toString('utf8');if(buffer.length>2000000){socket.destroy();return;}let i;while((i=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,i);buffer=buffer.slice(i+2);const waiter=waiting.shift();if(waiter)waiter.resolve(line);else queue.push(line);}});
 const line=()=>failure?Promise.reject(failure):queue.length?Promise.resolve(queue.shift()):new Promise((resolve,reject)=>waiting.push({resolve,reject}));
 async function command(value,literal){const id='SB'+(++tag);socket.write(id+' '+value+'\r\n');const rows=[];for(;;){const row=await line();if(row.startsWith('+')){if(!literal)throw Error('Unexpected mailbox response.');socket.write(literal);socket.write('\r\n');literal=null;}else if(row.startsWith(id+' ')){if(!row.startsWith(id+' OK'))throw Error('Sent mailbox operation failed.');return rows.concat(row);}else if(row.startsWith('* BYE'))throw Error('Sent mailbox disconnected.');else rows.push(row);}}
 try{if(!(await line()).startsWith('* OK'))throw Error('Sent mailbox was not ready.');await command('LOGIN '+quote(user)+' '+quote(password));const selected=await command('SELECT '+quote(folder));if(selected.some(row=>row.includes('[READ-ONLY]')))throw Error('Sent folder is read-only.');}
 catch(error){socket.destroy();throw error;}
 return {async ensureCopy(raw,messageId){if(!/^<sb-notes-[-a-zA-Z0-9]{8,100}@speakboldly\.space>$/.test(messageId))throw Error('Invalid message identity.');const found=await command('UID SEARCH HEADER Message-ID '+quote(messageId));if(found.some(row=>/^\* SEARCH\s+\d/.test(row)))return;await command('APPEND '+quote(folder)+' (\\Seen) {'+raw.length+'}',raw);},close(){socket.end();}};
}

export function createPrivateMailRelay({directory,secret,compose,send,connectSent,verifySMTP=async()=>{},now=Date.now}){
 if(typeof secret!=='string'||secret.length<32)throw Error('A private relay secret is required.');
 if(directory!==':memory:')mkdirSync(directory,{recursive:true,mode:0o700});
 const db=new DatabaseSync(directory===':memory:'?':memory:':join(directory,'notes-mail.sqlite'));db.exec('PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS deliveries(id TEXT PRIMARY KEY,hash TEXT NOT NULL,status TEXT NOT NULL,raw BLOB NOT NULL,sent_at TEXT,error TEXT,lease INTEGER NOT NULL DEFAULT 0)');
 async function deliver(input){const mail=validatePrivateMail(input,now()),hash=createHash('sha256').update(JSON.stringify(mail)).digest('hex');let row=db.prepare('SELECT * FROM deliveries WHERE id=?').get(mail.requestId);
  if(row&&row.hash!==hash)throw Error('Request ID already belongs to different content.');if(row?.status==='sent')return {ok:true,status:'sent',recipient:mail.to,sentAt:row.sent_at,sentCopy:true};
  if(row&&['sending','delivery_unknown'].includes(row.status))return {ok:false,status:'delivery_unknown',error:'Sending was interrupted. Check delivery before creating another request.'};
  if(row?.status==='copying'&&row.lease>now())return {ok:false,status:'sent_copy_pending',error:'The message was sent. Its Sent-folder copy is still being saved.'};
  const messageId='<sb-notes-'+mail.requestId+'@speakboldly.space>';
  if(!row){const raw=await compose({...mail,messageId,from:MAILBOX});db.prepare("INSERT OR IGNORE INTO deliveries(id,hash,status,raw) VALUES(?,?,'new',?)").run(mail.requestId,hash,raw);row=db.prepare('SELECT * FROM deliveries WHERE id=?').get(mail.requestId);if(row.hash!==hash)throw Error('Request content changed.');}
  if(row.status==='sent')return {ok:true,status:'sent',recipient:mail.to,sentAt:row.sent_at,sentCopy:true};
  if(['sending','delivery_unknown'].includes(row.status))return {ok:false,status:'delivery_unknown',error:'This send is already in progress or unconfirmed.'};
  let mailbox;try{mailbox=await connectSent();}catch{return {ok:false,status:row.status==='new'?'not_sent':'sent_copy_pending',error:row.status==='new'?'The Sent mailbox could not be verified. Nothing was sent.':'The email was sent; saving its Sent-folder copy is pending.'};}
  try{
   if(row.status==='new'){
    const claimed=db.prepare("UPDATE deliveries SET status='sending' WHERE id=? AND status='new'").run(mail.requestId);if(!claimed.changes)return {ok:false,status:'delivery_unknown',error:'This send is already in progress. Do not create another request.'};
    try{await send({raw:Buffer.from(row.raw),to:mail.to,from:MAILBOX});const sentAt=new Date(now()).toISOString();db.prepare("UPDATE deliveries SET status='sent_copy_pending',sent_at=? WHERE id=?").run(sentAt,mail.requestId);row={...row,status:'sent_copy_pending',sent_at:sentAt};}
    catch{db.prepare("UPDATE deliveries SET status='delivery_unknown',error='SMTP delivery unconfirmed' WHERE id=?").run(mail.requestId);return {ok:false,status:'delivery_unknown',error:'SMTP delivery could not be confirmed. Do not resend without checking.'};}
   }
   const claim=db.prepare("UPDATE deliveries SET status='copying',lease=? WHERE id=? AND (status='sent_copy_pending' OR (status='copying' AND lease<=?))").run(now()+60000,mail.requestId,now());if(!claim.changes)return {ok:false,status:'sent_copy_pending',error:'The message was sent. Its Sent-folder copy is still being saved.'};
   try{await mailbox.ensureCopy(Buffer.from(row.raw),messageId);db.prepare("UPDATE deliveries SET status='sent',lease=0 WHERE id=?").run(mail.requestId);return {ok:true,status:'sent',recipient:mail.to,sentAt:row.sent_at,sentCopy:true};}
   catch{db.prepare("UPDATE deliveries SET status='sent_copy_pending',lease=0 WHERE id=?").run(mail.requestId);return {ok:false,status:'sent_copy_pending',error:'The email was sent. Retry this same request to save its Sent-folder copy; it will not send the email again.'};}
  }finally{mailbox.close();}
 }
 return {deliver,close:()=>db.close(),async handle(req,res){const path=new URL(req.url,'http://localhost').pathname;if(!['/api/private-mail/notes','/api/private-mail/check'].includes(path))return false;const reply=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store'});res.end(JSON.stringify(data));};if(req.method!=='POST'){reply(405,{ok:false,error:'POST required.'});return true;}try{let size=0,parts=[];for await(const part of req){size+=part.length;if(size>8000000){reply(413,{ok:false,error:'Request too large.'});return true;}parts.push(part);}const raw=Buffer.concat(parts),provided=String(req.headers['x-sb-signature']||''),expected=privateMailSignature(raw,secret);if(provided.length!==expected.length||!timingSafeEqual(Buffer.from(provided),Buffer.from(expected))){reply(401,{ok:false,error:'Not authorized.'});return true;}const input=JSON.parse(raw.toString('utf8'));if(path.endsWith('/check')){if(!Number.isFinite(input.timestamp)||Math.abs(now()-input.timestamp)>300000)throw Error('Expired request.');const mailbox=await connectSent();try{await verifySMTP();}finally{mailbox.close();}reply(200,{ok:true,ready:true,sender:MAILBOX,provider:'namecheap',checkedAt:new Date(now()).toISOString()});}else{const result=await deliver(input);reply(result.ok?200:409,result);}}catch{reply(400,{ok:false,error:'The private mail request could not be processed.'});}return true;}};
}

export async function configuredPrivateMailRelay(env,directory){
 if(env.PRIVATE_MAIL_ENABLED!=='true')return null;
 if(String(env.PRIVATE_MAIL_USER||'').toLowerCase()!==MAILBOX.toLowerCase()||!env.PRIVATE_MAIL_PASSWORD||!env.PRIVATE_MAIL_SENT_FOLDER||String(env.PRIVATE_MAIL_RELAY_SECRET||'').length<32)throw Error('Private mail configuration is incomplete.');
 const {default:nodemailer}=await import('nodemailer'),smtp=nodemailer.createTransport({host:'mail.privateemail.com',port:465,secure:true,auth:{user:env.PRIVATE_MAIL_USER,pass:env.PRIVATE_MAIL_PASSWORD},tls:{rejectUnauthorized:true},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:20000}),composer=nodemailer.createTransport({streamTransport:true,buffer:true,newline:'windows'});
 return createPrivateMailRelay({directory,secret:env.PRIVATE_MAIL_RELAY_SECRET,compose:async mail=>(await composer.sendMail({from:'Speak Boldly <'+MAILBOX+'>',to:mail.to,subject:mail.subject,text:mail.text,html:mail.html,messageId:mail.messageId,attachments:[{filename:mail.attachment.name,content:Buffer.from(mail.attachment.base64,'base64'),contentType:'application/pdf'}]})).message,send:async mail=>{const result=await smtp.sendMail({envelope:{from:mail.from,to:[mail.to]},raw:mail.raw});if(result.accepted?.length!==1||result.rejected?.length)throw Error('Recipient not accepted.');},verifySMTP:()=>smtp.verify(),connectSent:()=>connectSentMailbox({user:env.PRIVATE_MAIL_USER,password:env.PRIVATE_MAIL_PASSWORD,folder:env.PRIVATE_MAIL_SENT_FOLDER})});
}
