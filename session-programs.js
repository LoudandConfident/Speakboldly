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
export function nextSessionNumber(sessions,clientId,program,level='',hasHistory=false){return sessions.filter(session=>session.clientId===clientId&&session.reminderStatus!=='cancelled'&&(!session.program||session.program===program)&&(!level||String(session.level)===String(level)||(!session.level&&!hasHistory))).reduce((highest,session)=>Math.max(highest,Number(session.number)||0),0)+1;}
export function suggestedSessionProgram(client){if(SESSION_PROGRAMS.some(program=>program.title===client?.program))return client.program;const value=String(client?.level||'').toLowerCase();if(/business|e-mail/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='writing')?.title;if(/interview/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='interview')?.title;if(/speaking/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='speaking')?.title;if(/ielts/.test(value))return SESSION_PROGRAMS.find(program=>program.id==='ielts')?.title;return SESSION_PROGRAMS.find(program=>program.id==='general-8')?.title;}
