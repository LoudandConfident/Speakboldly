export const MOTIVATION_PIN={date:'2026-10-24',day:20750,revision:'213c7c67-d6c4-4afe-aa73-494b6a8c9630'};
const isLegacy=value=>!value?.revision||value.revision==='0'||value.revision===MOTIVATION_PIN.revision;
export const INITIAL_MOTIVATION_FREEZE={frozen:false,weekly:true,day:MOTIVATION_PIN.day,until:'',revision:'0'};
let settings={...INITIAL_MOTIVATION_FREEZE},lastLoad=0,pending;
export function setMotivationSettings(value){
 settings=value&&typeof value.frozen==='boolean'?{...value,weekly:true}:{...INITIAL_MOTIVATION_FREEZE};
 // Retire the October migration pins, while honouring every later instructor choice.
 if(isLegacy(settings))settings={...settings,frozen:false,until:'',selection:undefined};
 lastLoad=Date.now();return motivationSettings();
}
export function motivationSettings(){return {...settings};}
export function motivationIsFrozen(now,dayNumber){
 const until=settings.until?Math.floor(Date.parse(settings.until+'T00:00:00Z')/86400000):Infinity;
 return settings.frozen&&Number.isInteger(settings.day)&&dayNumber(now)<until;
}
export function motivationDay(now,dayNumber){
 const today=motivationIsFrozen(now,dayNumber)?settings.day:dayNumber(now);
 return today-((new Date(today*86400000).getUTCDay()+6)%7);
}
export async function refreshMotivationSettings(doc,{force=false}={}){
 if(pending)return pending;
 if(!force&&Date.now()-lastLoad<60000)return settings;
 const endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue;if(!endpoint)return settings;
 const win=doc.defaultView,controller=new win.AbortController(),timer=win.setTimeout(()=>controller.abort(),10000);
 pending=(async()=>{try{
  const explicitDate=new URL(win.location.href).searchParams.get('motivation');
  const read=async date=>{const r=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'dailyMotivationSettings',date:date||undefined}),signal:controller.signal});const d=await r.json();return r.ok&&d.ok?d.settings:null;};
  let value=await read(explicitDate||null);
  if(value){if(!explicitDate&&(!value.frozen||isLegacy(value))){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(new win.Date()),part=type=>parts.find(p=>p.type===type).value,d=new Date(part('year')+'-'+part('month')+'-'+part('day')+'T00:00:00Z');d.setUTCDate(d.getUTCDate()-((d.getUTCDay()+6)%7));if(value.message?.date&&value.message.date<d.toISOString().slice(0,10))delete value.message;}setMotivationSettings(value);}
 }catch{}finally{win.clearTimeout(timer);lastLoad=Date.now();pending=null;}return settings;})();
 return pending;
}
