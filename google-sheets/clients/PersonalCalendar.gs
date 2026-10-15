// Read-only subscription feed for the instructor's personal calendar.
// Included in UnifiedCode.gs; add separately only in a multi-file project.
function sbPersonalCalendarSettings(data){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{const props=PropertiesService.getScriptProperties();let token=props.getProperty('SB_PERSONAL_CALENDAR_TOKEN');if(data.action==='resetPersonalCalendarLink'||!token){token=Utilities.getUuid()+Utilities.getUuid();props.setProperty('SB_PERSONAL_CALENDAR_TOKEN',token);}return {ok:true,token};}finally{lock.releaseLock();}
}
function sbCalendarEscape(value){return String(value||'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/;/g,'\\;').replace(/,/g,'\\,');}
function sbCalendarUtc(milliseconds){return new Date(milliseconds).toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');}
function sbCalendarFold(line){let bytes=0,part='',parts=[];for(const char of line){const size=char.codePointAt(0)<=0x7f?1:char.codePointAt(0)<=0x7ff?2:char.codePointAt(0)<=0xffff?3:4;if(bytes+size>75){parts.push(part);part=' ';bytes=1;}part+=char;bytes+=size;}parts.push(part);return parts.join('\r\n');}
function sbPersonalCalendarText(book){
 const clients=book.getSheetByName('Clients'),sessions=book.getSheetByName('Sessions');if(!clients||!sessions)throw new Error('Calendar is not ready.');
 const people=clients.getLastRow()>1?clients.getRange(2,1,clients.getLastRow()-1,12).getValues():[],names=new Map(people.filter(row=>row[0]).map(row=>[String(row[0]),String(row[1]).replace(/^'/,'')]));
 const rows=sessions.getLastRow()>1?sessions.getRange(2,1,sessions.getLastRow()-1,15).getValues():[],lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Speak Boldly//Instructor Sessions//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH','X-WR-CALNAME:Speak Boldly sessions','X-WR-TIMEZONE:Africa/Cairo','REFRESH-INTERVAL;VALUE=DURATION:PT1H','X-PUBLISHED-TTL:PT1H'],seen=new Set(),stamp=sbCalendarUtc(Date.now());
 for(const row of rows){const id=String(row[0]);if(!id||seen.has(id)||!names.has(String(row[1]))||!/^\d{4}-\d{2}-\d{2}$/.test(String(row[3]))||!/^\d{2}:\d{2}$/.test(String(row[4])))continue;seen.add(id);let starts;try{starts=sbCairoTimestamp(String(row[3]),String(row[4]));}catch{continue;}
  const program=String(row[10]||'English coaching').replace(/^'/,''),label=program+' — Session '+row[2],cancelled=row[7]==='cancelled',description='Client: '+names.get(String(row[1]))+'\nProgram: '+program+'\nRegistered course: '+String(row[14]||program)+'\nLevel: '+String(row[11]||'Not specified')+'\nSession: '+row[2]+(typeof SB_ZOOM_URL==='string'?'\nZoom: '+SB_ZOOM_URL:'');
  lines.push('BEGIN:VEVENT','UID:'+sbCalendarEscape(id)+'@speakboldly','DTSTAMP:'+stamp,'DTSTART:'+sbCalendarUtc(starts),'DTEND:'+sbCalendarUtc(starts+sbSessionDuration(row)*60*1000),'SUMMARY:'+sbCalendarEscape(names.get(String(row[1]))+' — '+label),'DESCRIPTION:'+sbCalendarEscape(description),'STATUS:'+(cancelled?'CANCELLED':'CONFIRMED'),'TRANSP:'+(cancelled?'TRANSPARENT':'OPAQUE'),'END:VEVENT');
 }
 lines.push('END:VCALENDAR');return lines.map(sbCalendarFold).join('\r\n')+'\r\n';
}
function sbPersonalCalendarFeed(token){
 const props=PropertiesService.getScriptProperties(),expected=props.getProperty('SB_PERSONAL_CALENDAR_TOKEN');
 if(!expected||typeof token!=='string'||token!==expected)return ContentService.createTextOutput('Invalid calendar subscription link.').setMimeType(ContentService.MimeType.TEXT);
 const book=SpreadsheetApp.openById(props.getProperty('CLIENT_SHEET_ID'));
 return ContentService.createTextOutput(sbPersonalCalendarText(book)).setMimeType(ContentService.MimeType.ICAL);
}
