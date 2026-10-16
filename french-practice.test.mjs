import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FRENCH_LEVELS,frenchDate,frenchDayIndex,normalizeFrenchAnswer,frenchExpressionTask,readFrenchProgress,saveFrenchProgress,frenchStorageKey,loadFrenchDay,normalizeFrenchSentence,frenchSpeechRate} from './french-practice.js';
const manifest=JSON.parse(readFileSync(new URL('./french-daily-tasks.json',import.meta.url))),chunks=manifest.chunks.map(chunk=>JSON.parse(readFileSync(new URL('./french-daily-tasks/'+chunk.file,import.meta.url)))),data={version:manifest.version,days:chunks.flatMap(chunk=>chunk.days)};
test('365 French lessons have three progressively longer readings and complete practice',()=>{
 assert.equal(data.version,'fr-365-v2');assert.equal(manifest.totalDays,365);assert.equal(chunks.length,12);assert.equal(data.days.length,365);assert.equal(new Set(data.days.map(d=>d.title)).size,365);for(const level of Object.keys(FRENCH_LEVELS)){assert.equal(new Set(data.days.map(day=>day.readings[level].paragraphs.join(' '))).size,365);assert(new Set(data.days.map(day=>day.grammar[level].correct)).size>300);}
 for(const [i,day]of data.days.entries()){assert.equal(day.number,i+1);assert(day.question.includes('?'));assert(day.answer.length>40);assert.equal(day.expressions.length,3);assert.equal(new Set(day.expressions.map(e=>e.expression)).size,3);let previous=0;
 for(const level of Object.keys(FRENCH_LEVELS)){const reading=day.readings[level],words=reading.paragraphs.join(' ').split(/\s+/).length;assert(words>previous);previous=words;assert(reading.prompt.length>50);assert(reading.model.split(/\s+/).length>=8);for(const name of ['rule','mistake','correct','explanation'])assert(day.grammar[level][name]);}
 for(const expression of day.expressions){assert(expression.meaning.length>10);assert(expression.example.length>15);assert(frenchExpressionTask(expression.expression).answer);}}
});
test('French dates rotate at Cairo midnight and repeat only after the full 365-day library',()=>{
 assert.equal(frenchDate(new Date('2026-10-16T20:59:00Z')),'2026-10-16');assert.equal(frenchDate(new Date('2026-10-16T21:00:00Z')),'2026-10-17');assert.equal(frenchDayIndex('2026-10-16'),0);assert.equal(frenchDayIndex('2026-11-15'),30);assert.equal(frenchDayIndex('2026-11-16'),31);assert.equal(frenchDayIndex('2027-10-15'),364);assert.equal(frenchDayIndex('2027-10-16'),0);assert.equal(frenchDayIndex('2026-10-15'),364);assert.throws(()=>frenchDayIndex('2026-02-30'));
});
test('expression checking handles punctuation and case while retaining meaningful French accents',()=>{
 assert.equal(normalizeFrenchAnswer('  D’ACCORD ! '),normalizeFrenchAnswer("d'accord"));assert.notEqual(normalizeFrenchAnswer('été'),normalizeFrenchAnswer('ete'));assert.deepEqual(frenchExpressionTask('Je prends mon temps'),{prompt:'Je prends mon ____',answer:'temps'});
});
test('French notes and completion persist independently by date and level without touching English progress',()=>{
 const entries=new Map([['speak-boldly-daily-follow-up-v1:2026-10-16:foundation','English']]),storage={getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)};
 const value={word:'temps',response:'Je prends mon temps pour lire.',complete:true};saveFrenchProgress(storage,'2026-10-16','foundation',value);assert.deepEqual(readFrenchProgress(storage,'2026-10-16','foundation'),value);assert.deepEqual(readFrenchProgress(storage,'2026-10-17','foundation'),{});assert.deepEqual(readFrenchProgress(storage,'2026-10-16','stretching'),{});assert.equal(entries.get('speak-boldly-daily-follow-up-v1:2026-10-16:foundation'),'English');assert(frenchStorageKey('2026-10-16','foundation').includes('french'));assert.deepEqual(readFrenchProgress({getItem:()=>'{broken'},'2026-10-16','foundation'),{});
});

test('French day loader reads only the required chunks, caches them and reaches day 365',async()=>{
 const calls=[],fetcher=async url=>{calls.push(String(url));return {ok:true,json:async()=>JSON.parse(readFileSync(new URL(url).pathname))};};
 for(let index=0;index<365;index++){const day=new Date(Date.UTC(2026,9,16)+index*86400000).toISOString().slice(0,10);const value=await loadFrenchDay(day,fetcher);assert.equal(value.number,index+1);}
 assert.equal(calls.length,12);assert(calls[0].includes('/01.json'));assert(calls.at(-1).includes('/12.json'));assert(calls.every(call=>call.includes('fr-365-v2')));assert.equal((await loadFrenchDay('2027-10-16',fetcher)).number,1);assert.equal(calls.length,12);
});
test('failed or stale French downloads can be retried without retaining a bad cache',async()=>{
 let count=0;const fetcher=async()=>{count++;return count===1?{ok:false}:{ok:true,json:async()=>chunks[0]};};await assert.rejects(loadFrenchDay('2026-10-16',fetcher));assert.equal((await loadFrenchDay('2026-10-16',fetcher)).number,1);assert.equal(count,2);
 let attempts=0;const stale=async()=>({ok:true,json:async()=>++attempts===1?{...chunks[0],version:'fr-31-v1'}:chunks[0]});await assert.rejects(loadFrenchDay('2026-10-16',stale));assert.equal((await loadFrenchDay('2026-10-16',stale)).number,1);
});
test('sentence checks preserve meaningful spaces and accents; all three levels have voice rates',()=>{
 assert.notEqual(normalizeFrenchSentence('Quoiqu’il en soit'),normalizeFrenchSentence('Quoi qu’il en soit'));assert.equal(normalizeFrenchSentence('  J’ai décidé de lire ! '),normalizeFrenchSentence("J'ai décidé de lire."));assert.notEqual(normalizeFrenchSentence('Je suis allée.'),normalizeFrenchSentence('Je suis allee.'));assert.deepEqual(Object.keys(FRENCH_LEVELS).map(frenchSpeechRate),[.8,.9,1]);
});
