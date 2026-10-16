export const FRENCH_LEVELS={foundation:'A1–A2 · Français simple',developing:'B1–B2 · Français au quotidien',stretching:'C1–C2 · Nuances et réflexion'};
export const FRENCH_DAYS=365,FRENCH_VERSION='fr-365-v2';
export function frenchDate(now=new Date()){const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),part=name=>parts.find(item=>item.type===name).value;return part('year')+'-'+part('month')+'-'+part('day');}
export function frenchDayIndex(day){const stamp=Date.parse(day+'T00:00:00Z');if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(stamp)||new Date(stamp).toISOString().slice(0,10)!==day)throw Error('Date invalide.');return ((Math.floor((stamp-Date.UTC(2026,9,16))/86400000)%FRENCH_DAYS)+FRENCH_DAYS)%FRENCH_DAYS;}
const frenchCaches=new WeakMap();
export async function loadFrenchDay(day,fetcher=globalThis.fetch){
 const index=frenchDayIndex(day),chunk=String(Math.floor(index/31)+1).padStart(2,'0');let cache=frenchCaches.get(fetcher);if(!cache){cache=new Map();frenchCaches.set(fetcher,cache);}
 if(!cache.has(chunk))cache.set(chunk,(async()=>{const response=await fetcher(new URL('./french-daily-tasks/'+chunk+'.json?v='+FRENCH_VERSION,import.meta.url));if(!response.ok)throw Error('Lecture indisponible.');const data=await response.json();if(data.version!==FRENCH_VERSION||data.start!==Math.floor(index/31)*31+1||!Array.isArray(data.days))throw Error('Bibliothèque invalide.');return data;})().catch(error=>{cache.delete(chunk);throw error;}));
 const data=await cache.get(chunk),task=data.days[index%31];if(!task||task.number!==index+1||!task.readings||!task.expressions||!task.grammar){cache.delete(chunk);throw Error('Tâche invalide.');}return task;
}
export function normalizeFrenchAnswer(value){return String(value).normalize('NFKC').toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/[^\p{L}\p{N}]/gu,'');}
export function normalizeFrenchSentence(value){return String(value).normalize('NFKC').toLocaleLowerCase('fr').replace(/[’‘]/g,"'").replace(/[«»“”".,;:!?]/g,'').replace(/\s+/g,' ').trim();}
export function frenchSpeechRate(level){return level==='foundation'?.8:level==='developing'?.9:1;}
export function frenchExpressionTask(expression){const last=[...expression.matchAll(/[\p{L}]+(?:['’][\p{L}]+)*/gu)].at(-1);if(!last)throw Error('Expression invalide.');return {prompt:expression.slice(0,last.index)+'____'+expression.slice(last.index+last[0].length),answer:last[0]};}
export const frenchStorageKey=(day,level)=>'speak-boldly-french-practice-v1:'+day+':'+level;
export function readFrenchProgress(storage,day,level){try{const value=JSON.parse(storage.getItem(frenchStorageKey(day,level))||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}}
export function saveFrenchProgress(storage,day,level,value){storage.setItem(frenchStorageKey(day,level),JSON.stringify(value));}
