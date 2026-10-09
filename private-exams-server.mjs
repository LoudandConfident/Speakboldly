import {createClassReminders} from './class-reminders.mjs';
import {createPortalUploads} from './portal-uploads-server.mjs';
import {cairoDay} from './student-attempts.js';
import {DatabaseSync} from 'node:sqlite';
import {randomBytes,randomUUID,createHash,timingSafeEqual} from 'node:crypto';
import {validateClient} from './admin-clients.js';
import {canOpenFile} from './portal-access.js';
const hash=value=>createHash('sha256').update(value).digest('hex');
const safeEqual=(a,b)=>timingSafeEqual(Buffer.from(hash(a)),Buffer.from(hash(b)));
export function createExamBackend({dbPath,adminPassword,exams,origins=[],now=()=>Date.now(),sendScoreEmail=null,sendReminderEmail=null,storageDirectory=null}){
 const db=new DatabaseSync(dbPath);db.exec('PRAGMA foreign_keys=ON; PRAGMA journal_mode=WAL;');
 db.exec(`CREATE TABLE IF NOT EXISTS clients(id TEXT PRIMARY KEY,data TEXT NOT NULL);
 CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY,role TEXT NOT NULL,client_id TEXT,expires INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS attempts(id TEXT PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),level INTEGER NOT NULL,opened TEXT NOT NULL,submitted TEXT,answers TEXT,objective INTEGER,reviewed TEXT,marks TEXT,feedback TEXT,total REAL);
 CREATE TABLE IF NOT EXISTS events(id INTEGER PRIMARY KEY,client_id TEXT NOT NULL REFERENCES clients(id),level INTEGER NOT NULL,at TEXT NOT NULL,kind TEXT NOT NULL);`);
 db.exec('CREATE TABLE IF NOT EXISTS score_emails(attempt_id TEXT PRIMARY KEY, fingerprint TEXT NOT NULL, recipient TEXT NOT NULL, status TEXT NOT NULL)');
 db.exec('CREATE TABLE IF NOT EXISTS student_attempt_limits(identity TEXT NOT NULL,day TEXT NOT NULL,used INTEGER NOT NULL,PRIMARY KEY(identity,day))');
 function studentLimit(identity,consume=false){const day=cairoDay(),row=db.prepare('SELECT used FROM student_attempt_limits WHERE identity=? AND day=?').get(identity,day);if((row?.used||0)>=3)throw error('You’ve used your three code attempts for today. Try again after midnight Cairo time.',429);if(consume)db.prepare('INSERT INTO student_attempt_limits VALUES(?,?,1) ON CONFLICT(identity,day) DO UPDATE SET used=used+1').run(identity,day);}
 for(const [name,type]of [['deadline','INTEGER'],['extension','TEXT'],['extension_requested','TEXT'],['auto_submitted','INTEGER DEFAULT 0']])if(!db.prepare('PRAGMA table_info(attempts)').all().some(c=>c.name===name))db.exec('ALTER TABLE attempts ADD COLUMN '+name+' '+type);
 db.prepare('UPDATE attempts SET deadline=? WHERE deadline IS NULL').run(now()+25*60000);
 function complete(row,answers,automatic=false){const e=catalog.get(row.level),normalized=validateAnswers(e,answers),objective=e.questions.reduce((sum,q)=>sum+(normalized.A[q.number]===q.correct?1:0),0);db.prepare('UPDATE attempts SET submitted=?,answers=?,objective=?,auto_submitted=? WHERE id=?').run(iso(),JSON.stringify(normalized),objective,automatic?1:0,row.id);db.prepare('INSERT INTO events(client_id,level,at,kind) VALUES(?,?,?,?)').run(row.client_id,row.level,iso(),automatic?'Time expired':'Submitted');return db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id);}
 function expire(row){if(row&&!row.submitted&&now()>=row.deadline)return complete(row,row.answers?JSON.parse(row.answers):{},true);return row;}
 const limited=new Map(),catalog=new Map(exams.map(e=>[e.level,e]));
 const allClients=()=>db.prepare('SELECT data FROM clients ORDER BY rowid').all().map(r=>JSON.parse(r.data));
 const getClient=id=>{const row=db.prepare('SELECT data FROM clients WHERE id=?').get(id);return row?JSON.parse(row.data):null;};
 const reminders=createClassReminders({db,getClient,now,sendEmail:sendReminderEmail});
 const error=(message,status=400)=>Object.assign(new Error(message),{status});
 const iso=()=>new Date(now()).toISOString();
 function permission(client,level){return canOpenFile(client,'exams','https://loudandconfident.github.io/Speakboldly/student-files/exams/Level-'+level+'-Exam.pdf');}
 function publicExam(level){const e=catalog.get(level);if(!e)throw error('Exam not found.',404);return{level:e.level,title:e.title,questions:e.questions.map(({correct,...q})=>q),sections:e.sections};}
 function session(req,role){const bearer=req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];if(!bearer)throw error('Please sign in.',401);const s=db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires>?').get(hash(bearer),Date.now());if(!s||s.role!==role)throw error('Please sign in again.',401);return s;}
 function login(req,key){const id=(req.socket.remoteAddress||'unknown')+':'+key,now=Date.now(),old=limited.get(id);if(old&&old.until>now&&old.count>=10)throw error('Too many attempts. Please wait 15 minutes.',429);const record=old&&old.until>now?old:{count:0,until:now+900000};record.count++;limited.set(id,record);}
 function issue(role,clientId=null){const token=randomBytes(32).toString('hex');db.prepare('DELETE FROM sessions WHERE expires<?').run(Date.now());db.prepare('INSERT INTO sessions VALUES(?,?,?,?)').run(hash(token),role,clientId,Date.now()+8*3600000);return token;}
 async function body(req){let raw='',size=0;for await(const chunk of req){size+=chunk.length;if(size>262144)throw error('Submission is too large.',413);raw+=chunk;}try{const value=JSON.parse(raw);if(!value||Array.isArray(value)||typeof value!=='object')throw new Error();return value;}catch{throw error('Invalid request.');}}
 function attemptData(row,owner=false){if(!row)return null;const result={id:row.id,level:row.level,openedAt:row.opened,submittedAt:row.submitted,reviewedAt:row.reviewed,status:row.reviewed?'Reviewed':row.submitted?'Awaiting review':'Opened',deadline:row.deadline,serverNow:now(),extension:row.extension||'none',autoSubmitted:!!row.auto_submitted,percentage:row.reviewed?row.total:null,feedback:row.reviewed?row.feedback:null};if(!row.submitted)result.draftAnswers=row.answers?JSON.parse(row.answers):null;if(owner){result.emailStatus=db.prepare('SELECT status FROM score_emails WHERE attempt_id=?').get(row.id)?.status||'not_requested';result.client=getClient(row.client_id);result.answers=row.answers?JSON.parse(row.answers):null;result.multipleChoiceMarks=row.objective;result.marks=row.marks?JSON.parse(row.marks):null;}return result;}
 function validateAnswers(exam,input){const result={A:{},B:{},C:{},D:'',E:''};if(!input||typeof input!=='object')throw error('Missing answers.');
  for(const q of exam.questions){const value=input.A?.[q.number];if(value!==undefined&&value!==null&&value!==''){if(!Number.isInteger(value)||value<0||value>=q.options.length)throw error('Invalid answer choice.');result.A[q.number]=value;}}
  for(const section of ['B','C'])for(let i=1;i<=exam.sections[section].questions.length;i++){const value=input[section]?.[i]??'';if(typeof value!=='string'||value.length>10000)throw error('An answer is too long.');result[section][i]=value.trim();}
  for(const section of ['D','E']){const value=input[section]??'';if(typeof value!=='string'||value.length>20000)throw error('An answer is too long.');result[section]=value.trim();}return result;
 }
 const uploads=createPortalUploads({db,directory:storageDirectory,session,getClient,allClients,error});
 async function handle(req,res){
  const url=new URL(req.url,'http://localhost');if(!url.pathname.startsWith('/api/'))return false;
  const origin=req.headers.origin;if(origin&&!origins.includes(origin)){res.writeHead(403,{'Content-Type':'application/json'});res.end(JSON.stringify({error:'This website origin is not allowed.'}));return true;}
  const headers={'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};if(origin){headers['Access-Control-Allow-Origin']=origin;headers.Vary='Origin';}
  if(req.method==='OPTIONS'){res.writeHead(204,{...headers,'Access-Control-Allow-Methods':'GET,POST,OPTIONS','Access-Control-Allow-Headers':'Authorization,Content-Type'});res.end();return true;}
  const send=(value,status=200)=>{res.writeHead(status,headers);res.end(JSON.stringify(value));};
  try{
   const path=url.pathname,method=req.method;
   if(path==='/api/status'&&method==='GET'){send({ready:Boolean(adminPassword)&&catalog.size>0,emailReady:!!sendScoreEmail,remindersReady:!!adminPassword&&reminders.emailReady});return true;}
   if(!adminPassword)throw error('Private storage is not configured.',503);
   if(!catalog.size&&!(path.startsWith('/api/admin/')&&!/\/(attempts|exams)(\/|$)/.test(path)))throw error('Private exam storage is not configured.',503);
   if(await uploads(req,res,url,headers))return true;
   if(path==='/api/admin/login'&&method==='POST'){login(req,'admin');const input=await body(req);if(typeof input.password!=='string'||!safeEqual(input.password,adminPassword))throw error('Incorrect owner password.',401);send({token:issue('admin')});return true;}
   if(path==='/api/student/login'&&method==='POST'){login(req,'student');const ip='ip:'+(req.socket.remoteAddress||'unknown');studentLimit(ip);const input=await body(req);if(!/^\d{4}$/.test(input.code||'')||input.code==='1962'){studentLimit(ip,true);throw error('Use your individual client code for an interactive exam.',401);}const client=allClients().find(c=>safeEqual(c.code,input.code));if(!client){studentLimit(ip,true);throw error('Incorrect student code.',401);}studentLimit('client:'+client.id,true);send({token:issue('student',client.id),access:{code:client.code,clientId:client.id,number:allClients().findIndex(c=>c.id===client.id)+1,level:client.level,permissions:client.permissions}});return true;}
   if(path.startsWith('/api/admin/')){
    session(req,'admin');
    if(path==='/api/admin/classes/send-confirmations'&&method==='POST'){if(!reminders.emailReady)throw error('Email sending is not connected yet.',503);send(reminders.queueUpcoming(),202);return true;}
    if(path==='/api/admin/classes'&&method==='GET'){send({classes:reminders.list(),emailReady:reminders.emailReady});return true;}
    if(path==='/api/admin/classes'&&method==='POST'){const record=reminders.save(await body(req));send({class:record,emailReady:reminders.emailReady},201);return true;}
    const cancelClass=path.match(/^\/api\/admin\/classes\/([a-f0-9-]+)\/cancel$/);if(cancelClass&&method==='POST'){reminders.cancel(cancelClass[1]);send({ok:true});return true;}
    if(path==='/api/admin/clients'&&method==='GET'){send({clients:allClients()});return true;}
    if(path==='/api/admin/clients'&&method==='POST'){const input=await body(req),existing=allClients();if(input.id&&!getClient(input.id))throw error('Client not found.',404);let validated;try{validated=validateClient(input,existing,input.id||null);}catch(e){throw error(e.message);}const client={id:input.id||randomUUID(),...validated};if(input.id&&getClient(input.id).code!==client.code)db.prepare('DELETE FROM sessions WHERE role=? AND client_id=?').run('student',input.id);db.prepare('INSERT INTO clients VALUES(?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').run(client.id,JSON.stringify(client));send({client});return true;}
    if(path==='/api/admin/attempts'&&method==='GET'){const rows=db.prepare('SELECT * FROM attempts ORDER BY opened DESC').all().map(expire);send({attempts:rows.map(r=>attemptData(r,true)),events:db.prepare('SELECT * FROM events ORDER BY at DESC LIMIT 200').all().map(e=>({...e,clientName:getClient(e.client_id)?.name}))});return true;}
    const extension=path.match(/^\/api\/admin\/attempts\/([a-f0-9-]+)\/extra-time$/);
    if(extension&&method==='POST'){let row=db.prepare('SELECT * FROM attempts WHERE id=?').get(extension[1]);if(!row||row.extension!=='pending'||row.reviewed)throw error('No pending request found.',404);const input=await body(req);if(!['approve','deny'].includes(input.decision))throw error('Choose approve or deny.');if(input.decision==='approve'){if(row.submitted&&!row.auto_submitted)throw error('This exam was already submitted.');db.prepare('UPDATE attempts SET extension=?,deadline=?,submitted=NULL,objective=NULL,auto_submitted=0 WHERE id=?').run('approved',Math.max(row.deadline,now())+10*60000,row.id);}else db.prepare('UPDATE attempts SET extension=? WHERE id=?').run('denied',row.id);db.prepare('INSERT INTO events(client_id,level,at,kind) VALUES(?,?,?,?)').run(row.client_id,row.level,iso(),'Extra time '+input.decision);send({attempt:attemptData(expire(db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id)),true)});return true;}
    const notes=path.match(/^\/api\/admin\/exams\/([1-6])$/);if(notes&&method==='GET'){const level=Number(notes[1]);send({...publicExam(level),teacherNotes:catalog.get(level).teacherNotes});return true;}
    const review=path.match(/^\/api\/admin\/attempts\/([a-f0-9-]+)\/review$/);if(review&&method==='POST'){const row=db.prepare('SELECT * FROM attempts WHERE id=?').get(review[1]);if(!row?.submitted)throw error('No submitted exam found.',404);if(row.extension==='pending')throw error('Resolve the extra-time request before reviewing this exam.');const input=await body(req),marks={};for(const key of ['B','C','D','E']){const value=input.marks?.[key];if(typeof value!=='number'||!Number.isFinite(value)||value<0||value>20)throw error('Each written section needs a mark from 0 to 20.');marks[key]=value;}if(typeof input.feedback!=='string'||input.feedback.length>10000)throw error('Enter feedback up to 10000 characters.');const total=Math.round((row.objective+Object.values(marks).reduce((a,b)=>a+b,0))*100)/100;db.prepare('UPDATE attempts SET reviewed=?,marks=?,feedback=?,total=? WHERE id=?').run(iso(),JSON.stringify(marks),input.feedback,total,row.id);db.prepare('INSERT INTO events(client_id,level,at,kind) VALUES(?,?,?,?)').run(row.client_id,row.level,iso(),'Reviewed');const client=getClient(row.client_id),recipient=client.email,fingerprint=hash(JSON.stringify([recipient,total,input.feedback]));
     const previous=db.prepare('SELECT * FROM score_emails WHERE attempt_id=?').get(row.id);
     if(!previous||previous.fingerprint!==fingerprint||['failed','not_configured'].includes(previous.status)){
      let emailStatus=sendScoreEmail?'sending':'not_configured';
      db.prepare('INSERT INTO score_emails VALUES(?,?,?,?) ON CONFLICT(attempt_id) DO UPDATE SET fingerprint=excluded.fingerprint,recipient=excluded.recipient,status=excluded.status').run(row.id,fingerprint,recipient,emailStatus);
      if(sendScoreEmail){try{await sendScoreEmail({to:recipient,name:client.name,level:row.level,percentage:total,feedback:input.feedback});emailStatus='sent';}catch{emailStatus='failed';}db.prepare('UPDATE score_emails SET status=? WHERE attempt_id=?').run(emailStatus,row.id);}
     }
     send({attempt:attemptData(db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id),true)});return true;}
   }
   if(path.startsWith('/api/student/')){
    const s=session(req,'student'),client=getClient(s.client_id);if(!client)throw error('Client not found.',403);
    const open=path.match(/^\/api\/student\/exams\/([1-6])$/);
    if(open&&method==='GET'){const level=Number(open[1]);if(!permission(client,level))throw error('Your teacher has not granted access to this exam.',403);const exam=publicExam(level);db.prepare('INSERT INTO events(client_id,level,at,kind) VALUES(?,?,?,?)').run(client.id,level,iso(),'Opened');let row=db.prepare('SELECT * FROM attempts WHERE client_id=? AND level=? ORDER BY opened DESC LIMIT 1').get(client.id,level);if(!row){const id=randomUUID();db.prepare('INSERT INTO attempts(id,client_id,level,opened,deadline) VALUES(?,?,?,?,?)').run(id,client.id,level,iso(),now()+25*60000);row=db.prepare('SELECT * FROM attempts WHERE id=?').get(id);}send({exam,attempt:attemptData(expire(row))});return true;}
    const progress=path.match(/^\/api\/student\/attempts\/([a-f0-9-]+)$/);
    if(progress&&method==='GET'){const row=db.prepare('SELECT * FROM attempts WHERE id=? AND client_id=?').get(progress[1],client.id);if(!row)throw error('Exam not found.',404);if(!permission(client,row.level))throw error('Exam access is locked.',403);send({attempt:attemptData(expire(row))});return true;}
    const action=path.match(/^\/api\/student\/attempts\/([a-f0-9-]+)\/(draft|extra-time|submit)$/);
    if(action&&method==='POST'){let row=db.prepare('SELECT * FROM attempts WHERE id=? AND client_id=?').get(action[1],client.id);if(!row)throw error('Exam not found.',404);if(!permission(client,row.level))throw error('Exam access is locked.',403);row=expire(row);
     if(action[2]==='extra-time'){if(row.submitted||row.extension)throw error('Extra time can be requested once, before the timer ends.');db.prepare('UPDATE attempts SET extension=?,extension_requested=? WHERE id=?').run('pending',iso(),row.id);db.prepare('INSERT INTO events(client_id,level,at,kind) VALUES(?,?,?,?)').run(client.id,row.level,iso(),'Extra time requested');send({attempt:attemptData(db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id))});return true;}
     if(row.submitted){send({attempt:attemptData(row)});return true;}
     const input=await body(req),answers=validateAnswers(catalog.get(row.level),input.answers);
     if(action[2]==='draft'){db.prepare('UPDATE attempts SET answers=? WHERE id=?').run(JSON.stringify(answers),row.id);send({attempt:attemptData(db.prepare('SELECT * FROM attempts WHERE id=?').get(row.id))});return true;}
     if(row.extension==='pending')db.prepare('UPDATE attempts SET extension=? WHERE id=?').run('cancelled',row.id);
     send({attempt:attemptData(complete(row,answers))});return true;
    }
   }
   throw error('Not found.',404);
  }catch(e){send({error:e.status?e.message:'The request could not be completed.'},e.status||400);}
  return true;
 }
 return{handle,runReminders:reminders.runDue,close(){db.close();}};
}
