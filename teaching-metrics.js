export function monthlyTeachingHours(sessions,now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(now),get=k=>parts.find(p=>p.type===k).value;
 const month=get('year')+'-'+get('month'),localNow=Date.parse(month+'-'+get('day')+'T'+get('hour')+':'+get('minute')+':00Z');
 return Math.round(sessions.reduce((total,s)=>{const minutes=Number(s.duration)||90;if(!s.date?.startsWith(month+'-')||['cancelled','canceled'].includes(s.reminderStatus)||['cancelled','canceled'].includes(s.status)||!/^\d{2}:\d{2}$/.test(s.time||''))return total;const end=Date.parse(s.date+'T'+s.time+':00Z')+minutes*60000;return Number.isFinite(end)&&end<=localNow?total+minutes/60:total;},0)*100)/100;
}
export function sessionConfirmationFingerprint(s){return JSON.stringify([s.clientId,Number(s.number),s.date,s.time,s.program||'',String(s.level||''),Number(s.duration)||90,s.location||'']);}
