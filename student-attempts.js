const KEY='speak-boldly-student-code-attempts-v1';
export function cairoDay(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=t=>parts.find(p=>p.type===t).value;return get('year')+'-'+get('month')+'-'+get('day');
}
export function takeStudentAttempt(storage,now=new Date()){
 const day=cairoDay(now);let saved;
 try{saved=JSON.parse(storage.getItem(KEY)||'null');}catch{throw new Error('Code attempts could not be saved in this browser. Please enable browser storage.');}
 const used=saved?.day===day?Number(saved.used):0;
 if(!Number.isInteger(used)||used<0||used>=3)throw new Error('You’ve used your three code attempts for today. Please try again after midnight Cairo time.');
 try{storage.setItem(KEY,JSON.stringify({day,used:used+1}));}catch{throw new Error('Code attempts could not be saved in this browser. Please enable browser storage.');}
 return 3-used-1;
}
