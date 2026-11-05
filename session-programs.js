import {courses} from './courses.js?v=prices-oct-27-2026';
export const SESSION_PROGRAMS=[{id:'trial',title:'Trial session'},...courses.map(({id,title})=>({id,title}))];
export const CLIENT_PROGRAMS=SESSION_PROGRAMS.filter(({id})=>!['urgent-session','make-up-revision','instructor-training','different-learners'].includes(id));
export const SESSION_TYPES=[{id:'session',title:'Session'},{id:'trial',title:'Trial session'},{id:'assessment',title:'Assessment'}];
export const INSTRUCTOR_APPOINTMENT_TYPES=[{id:'session',title:'Session — 90 minutes',duration:90},{id:'session120',title:'Session — 120 minutes',duration:120},{id:'trial',title:'Trial session — 60 minutes',duration:60},{id:'assessment',title:'Placement test — 30 minutes',duration:30}];
export function appointmentDurationForType(type){const item=INSTRUCTOR_APPOINTMENT_TYPES.find(item=>item.id===type);if(!item)throw new Error('Choose an appointment type.');return item.duration;}
export function calendarProgramForType(type,program){
 if(type==='trial')return 'Trial session';
 if(type==='assessment')return 'Assessment';
 if(!['session','session120'].includes(type)||!SESSION_PROGRAMS.some(item=>item.id!=='trial'&&item.title===program))throw new Error('Choose a program for this session.');
 return program;
}
export function currentRoundSessions(sessions,clientId,program,level='',hasHistory=false,round={}){
 let rows=sessions.filter(s=>s.clientId===clientId&&s.reminderStatus!=='cancelled'&&(!s.program||s.program===program)&&(!level||String(s.level)===String(level)||(!s.level&&!hasHistory)));
 const date=round.date||'9999-12-31';rows=rows.filter(s=>!s.date||s.date<=date);
 const boundary=(round.history||[]).filter(h=>h.reason==='advanced'||String(h.id||'').startsWith('advanced-')).map(h=>{const d=new Date(h.closedAt);if(!Number.isFinite(d.getTime()))return '';const p=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(d),get=k=>p.find(v=>v.type===k).value;return get('year')+'-'+get('month')+'-'+get('day');}).filter(d=>/^\d{4}-\d{2}-\d{2}$/.test(d)&&d<=date).sort().at(-1);
 if(boundary)rows=rows.filter(s=>!s.date||s.date>=boundary);
 const stamp=s=>s.date+(s.time||'00:00');
 const first=rows.filter(s=>Number(s.number)===1&&s.date).sort((a,b)=>stamp(b).localeCompare(stamp(a)))[0];
 if(first)rows=rows.filter(s=>!s.date||stamp(s)>=stamp(first));
 return rows;
}
export function nextSessionNumber(sessions,clientId,program,level='',hasHistory=false,round={}){return currentRoundSessions(sessions,clientId,program,level,hasHistory,round).reduce((highest,s)=>Math.max(highest,Number(s.number)||0),0)+1;}

export function suggestedSessionProgram(client){if(SESSION_PROGRAMS.some(program=>program.title===client?.program))return client.program;const value=String(client?.level||'').toLowerCase();if(/business|e-mail/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='writing')?.title;if(/interview/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='interview')?.title;if(/speaking/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='speaking')?.title;if(/ielts/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='ielts')?.title;return SESSION_PROGRAMS.find(program=>program.id==='general-8')?.title;}
