export const MISSION_DAYS=365, MISSION_CHUNK_SIZE=31, MISSION_VERSION='full-year-2026-v7-past-stories';
const levels=['foundation','developing','stretching'], caches=new WeakMap();
export function missionPositionForDate(day){
 const stamp=Date.parse(day+'T00:00:00Z');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!Number.isFinite(stamp)||new Date(stamp).toISOString().slice(0,10)!==day)throw new Error('Invalid mission date');
 const ordinal=Math.round((stamp-Date.UTC(2026,9,15))/86400000),scenario=ordinal%2===0,poolSize=scenario?183:182,poolIndex=((Math.floor(ordinal/2)%poolSize)+poolSize)%poolSize,index=poolIndex*2+(scenario?0:1);
 return {index,chunk:String(Math.floor(index/MISSION_CHUNK_SIZE)+1).padStart(2,'0'),offset:index%MISSION_CHUNK_SIZE};
}
export function missionPositionForLevel(day,level){const offset={foundation:0,developing:122,stretching:244}[level]||0;return missionPositionForDate(new Date(Date.parse(day+'T00:00:00Z')+offset*86400000).toISOString().slice(0,10));}
export async function dailyMissionSet(day,level='foundation',fetcher=globalThis.fetch){
 if(!levels.includes(level))level='foundation';
 const position=missionPositionForLevel(day,level),key=level+'/'+position.chunk;
 let cache=caches.get(fetcher);if(!cache){cache=new Map();caches.set(fetcher,cache);}
 if(!cache.has(key))cache.set(key,(async()=>{
  const response=await fetcher(new URL('./daily-missions/'+key+'.json?v='+MISSION_VERSION,import.meta.url));
  if(!response.ok)throw new Error('Mission download failed');
  const data=await response.json();
  if(data.version!==MISSION_VERSION||data.level!==level||!Array.isArray(data.missions))throw new Error('Invalid mission library');
  return data.missions;
 })().catch(error=>{cache.delete(key);throw error;}));
 const mission=(await cache.get(key))[position.offset];
 if(!mission||mission.number!==position.index+1||mission.level!==level||(!Array.isArray(mission.paragraphs)||mission.paragraphs.length<3||mission.paragraphs.length>8))throw new Error('Missing daily mission');
 return {...mission,day,level};
}
