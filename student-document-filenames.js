const safe=value=>String(value||'').normalize('NFKC').replace(/[\\/:*?"<>|\u0000-\u001f\u007f]/g,'-').replace(/\s+/g,' ').trim().replace(/[. ]+$/,'').slice(0,90);
export function documentDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),get=key=>parts.find(part=>part.type===key).value;
 return get('year')+'-'+get('month')+'-'+get('day');
}
export function studentDocumentFilename(name,title,{level='',date=documentDate()}={}){
 const program=safe(level),label=program?(/^\d+$/.test(program)?'Level '+program:program):'';
 return [safe(name)||'Student',label,safe(title)||'Document',safe(date)].filter(Boolean).join(' — ')+'.pdf';
}
