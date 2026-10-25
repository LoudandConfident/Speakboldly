export const MOTIVATION_PIN={date:'2026-10-24',day:20750,revision:'213c7c67-d6c4-4afe-aa73-494b6a8c9630'};
const usesPinnedSelection=value=>!value?.revision||value.revision==='0'||value.revision===MOTIVATION_PIN.revision;
export const INITIAL_MOTIVATION_FREEZE={frozen:true,day:MOTIVATION_PIN.day,until:'',revision:'0'};
let settings={...INITIAL_MOTIVATION_FREEZE},lastLoad=0,pending;
export function setMotivationSettings(value){settings=value&&typeof value.frozen==='boolean'?{...value}:{...INITIAL_MOTIVATION_FREEZE};if(settings.frozen&&(settings.until==='2026-10-25'||(settings.revision==='0'&&settings.until==='2026-10-26')))settings.until='';if(usesPinnedSelection(settings))settings={...settings,frozen:true,day:MOTIVATION_PIN.day,until:''};lastLoad=Date.now();return settings;}
export function motivationSettings(){return {...settings};}
export function motivationDay(now,dayNumber){const today=dayNumber(now),until=settings.until?Math.floor(Date.parse(settings.until+'T00:00:00Z')/86400000):Infinity;return settings.frozen&&today<until?settings.day:today;}
export async function refreshMotivationSettings(doc,{force=false}={}){
 if(pending)return pending;
 if(!force&&Date.now()-lastLoad<60000)return settings;
 const endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue;if(!endpoint)return settings;
 const win=doc.defaultView,controller=new win.AbortController(),timer=win.setTimeout(()=>controller.abort(),10000);
 pending=(async()=>{try{
  const explicitDate=new URL(win.location.href).searchParams.get('motivation'),pinned=usesPinnedSelection(settings);
  const read=async date=>{const r=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'dailyMotivationSettings',date:date||undefined}),signal:controller.signal});const d=await r.json();return r.ok&&d.ok?d.settings:null;};
  let value=await read(explicitDate||(pinned?MOTIVATION_PIN.date:null));
  if(value&&pinned&&!explicitDate&&!usesPinnedSelection(value))value=await read(null);
  if(value)setMotivationSettings(value);
 }catch{}finally{win.clearTimeout(timer);lastLoad=Date.now();pending=null;}return settings;})();
 return pending;
}
