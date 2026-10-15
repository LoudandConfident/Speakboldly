import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {dailyMissionSet,missionPositionForDate,MISSION_DAYS} from './daily-mission-set.js';
import {dailyPassages} from './daily-mission-passages.js';
const manifest=JSON.parse(await readFile(new URL('./daily-missions/index.json',import.meta.url)));
const levels=['foundation','developing','stretching'];
const fileFetch=async url=>({ok:true,json:async()=>JSON.parse(await readFile(new URL(url.pathname,url)))});
test('549 complete materials preserve the original 24 per level',async()=>{
 let total=0;const all=new Set(),averages=[];
 for(const [li,level] of levels.entries()){
  const missions=[];for(const chunk of manifest.levels[level].chunks){const data=JSON.parse(await readFile(new URL('./daily-missions/'+level+'/'+chunk.file,import.meta.url)));assert.equal(data.missions.length,chunk.count);missions.push(...data.missions);}
  assert.equal(missions.length,183);assert.equal(new Set(missions.map(m=>m.transcript)).size,183);
  assert.equal(missions.filter(m=>m.source==='original-24').length,24);
  for(const [i,m] of missions.entries()){
   assert.equal(m.number,i+1);assert.equal(m.level,level);assert.equal(m.paragraphs.length,3);assert.ok(m.paragraphs.every(p=>p.trim()));
   for(const key of ['title','transcript','phrase','question','answer','say'])assert.ok(m[key]?.trim(),key);
   assert.equal(m.useItems.length,2);for(const item of m.useItems)assert.ok(m.transcript.toLowerCase().includes(item.expression.toLowerCase()));
   assert.equal(m.build.rules.length,2);for(const rule of m.build.rules){assert.ok(rule.structure.includes('+'));assert.ok(rule.example);assert.equal(rule.explanation,undefined);}
   assert.equal(m.fixItems.length,2);assert.notEqual(m.fixItems[0].mistake,m.fixItems[1].mistake);for(const item of m.fixItems){assert.ok(item.answer);assert.notEqual(item.mistake,item.answer);assert.ok(item.explanation);}
   assert.equal(m.vocabulary,undefined);
   assert.ok(m.transcript.toLowerCase().includes(m.phrase.toLowerCase()));
   if(i<24)assert.equal(m.transcript,dailyPassages[i].levels[li][0]);
   all.add(m.transcript);total++;
  }
  averages.push(missions.reduce((n,m)=>n+m.transcript.split(/\s+/).length,0)/183);
 }
 assert.equal(total,549);assert.equal(all.size,549);assert.ok(averages[0]<averages[1]&&averages[1]<averages[2]);
});
test('183-day cycle, leap dates and invalid dates',()=>{
 const indices=[];for(let i=0;i<183;i++){const d=new Date(Date.UTC(2026,9,15+i));indices.push(missionPositionForDate(d.toISOString().slice(0,10)).index);}
 assert.equal(new Set(indices).size,MISSION_DAYS);assert.equal(missionPositionForDate('2027-04-16').index,0);
 assert.doesNotThrow(()=>missionPositionForDate('2028-02-29'));assert.throws(()=>missionPositionForDate('2027-02-29'));assert.throws(()=>missionPositionForDate('bad'));
});
test('loads one small chunk, caches it, switches levels and retries failures',async()=>{
 const requests=[];const fetcher=async url=>{requests.push(url.pathname);return fileFetch(url);};
 const first=await dailyMissionSet('2026-10-15','foundation',fetcher);assert.equal(first.number,1);
 await dailyMissionSet('2026-10-16','foundation',fetcher);assert.equal(requests.length,1);
 await dailyMissionSet('2026-10-15','developing',fetcher);assert.equal(requests.length,2);
 const last=await dailyMissionSet('2027-04-15','stretching',fetcher);assert.equal(last.number,183);assert.equal(requests.length,3);
 let count=0;const flaky=async url=>{if(++count===1)throw Error('offline');return fileFetch(url);};
 await assert.rejects(dailyMissionSet('2026-10-15','foundation',flaky));assert.equal((await dailyMissionSet('2026-10-15','foundation',flaky)).number,1);
});
