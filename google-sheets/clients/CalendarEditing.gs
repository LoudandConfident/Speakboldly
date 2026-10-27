// Add this file to the existing Clients Apps Script project.
// See CALENDAR-EDITING-UPDATE.md for the three router changes.
function sbEditSheetSession(p){
 const sheet=sbSessionsSheet(),rows=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,15).getValues():[],index=rows.findIndex(row=>String(row[0])===String(p.sessionId||''));
 if(index<0)throw new Error('Session not found. Refresh the calendar.');
 const old=rows[index];if(String(old[7])==='cancelled')throw new Error('This session was cancelled. Refresh the calendar.');if(String(old[7])==='sending')throw new Error('A session email is being sent. Try again shortly.');
 const input=p.session||{},c={clientId:String(input.clientId||''),number:Number(input.number),date:String(input.date||''),time:String(input.time||''),program:String(input.program||'').trim(),level:String(input.level||'').trim(),duration:sbRequestedSessionDuration(input)};
 if(c.clientId!==String(old[1]))throw new Error('The client for an existing session cannot be changed.');
 if(!Number.isInteger(c.number)||c.number<1||c.number>9999)throw new Error('Enter a valid session number.');
 if(c.program&&!SB_SESSION_PROGRAMS.includes(c.program))throw new Error('Choose a valid program.');
 if(c.level&&!/^[1-9]\d{0,3}$/.test(c.level)&&!['Not assessed','A1','A2','B1','B2','C1','C2'].includes(c.level))throw new Error('Choose a valid level.');
 const start=sbCairoTimestamp(c.date,c.time),snapshot=row=>({clientId:String(row[1]),number:Number(row[2]),date:String(row[3]),time:String(row[4]),program:String(row[10]||'').replace(/^'/,''),level:String(row[11]||'').replace(/^'/,''),duration:sbSessionDuration(row)}),previous=snapshot(old),same=(a,b)=>Object.keys(previous).every(key=>String(a[key])===String(b[key]));
 if(same(c,previous))return String(old[0]);
 if(!p.expectedSession||!same(p.expectedSession,previous))throw new Error('This session changed on another device. Refresh before editing.');
 if(c.date!==String(old[3])&&start>Date.now()&&typeof sbCalendarDateBlocked==='function'&&sbCalendarDateBlocked(c.date))throw new Error('This day is dimmed. Undim it before moving the session.');
 if(start>Date.now()&&rows.some((row,i)=>i!==index&&String(row[7])!=='cancelled'&&start<Date.parse(row[5])+sbSessionDuration(row)*60000&&start+c.duration*60000>Date.parse(row[5])))throw new Error('This time overlaps another appointment.');
 if(rows.some((row,i)=>i!==index&&String(row[7])!=='cancelled'&&String(row[1])===c.clientId&&Number(row[2])===c.number&&String(row[10]||'').replace(/^'/,'')===c.program&&String(row[11]||'').replace(/^'/,'')===c.level))throw new Error('This session number already exists for the client, program and level.');
 const updated=[...old];updated[2]=c.number;updated[3]=c.date;updated[4]=c.time;updated[5]=new Date(start).toISOString();updated[6]=new Date(start-86400000).toISOString();updated[7]=start<=Date.now()?'expired':'pending';updated[8]='';updated[9]='';updated[10]=c.program;updated[11]=c.level;updated[13]=c.duration;if(!['Assessment','Trial session'].includes(c.program))updated[14]=c.program;
 sheet.getRange(index+2,4,1,2).setNumberFormat('@');sheet.getRange(index+2,1,1,15).setValues([updated]);
 return String(old[0]);
}
