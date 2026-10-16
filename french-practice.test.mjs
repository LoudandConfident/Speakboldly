import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FRENCH_LEVELS,frenchDate,frenchDayIndex,normalizeFrenchAnswer,frenchExpressionTask,readFrenchProgress,saveFrenchProgress,frenchStorageKey} from './french-practice.js';
const data=JSON.parse(readFileSync(new URL('./french-daily-tasks.json',import.meta.url)));
test('31 original French lessons have three progressively longer readings and meaningful practice',()=>{
 assert.equal(data.version,'fr-31-v1');assert.equal(data.days.length,31);assert.equal(new Set(data.days.map(d=>d.title)).size,31);
 for(const [i,day]of data.days.entries()){assert.equal(day.number,i+1);assert.equal(day.expressions.length,3);assert.equal(new Set(day.expressions.map(e=>e.expression)).size,3);let previous=0;
 for(const level of Object.keys(FRENCH_LEVELS)){const reading=day.readings[level],words=reading.paragraphs.join(' ').split(/\s+/).length;assert(words>previous);previous=words;assert(reading.prompt.length>50);assert(reading.model.split(/\s+/).length>=8);for(const name of ['rule','mistake','correct','explanation'])assert(day.grammar[level][name]);}
 for(const expression of day.expressions){assert(expression.meaning.length>10);assert(expression.example.length>15);assert(frenchExpressionTask(expression.expression).answer);}}
});
test('French dates rotate at Cairo midnight and repeat only after the 31-day library',()=>{
 assert.equal(frenchDate(new Date('2026-10-16T20:59:00Z')),'2026-10-16');assert.equal(frenchDate(new Date('2026-10-16T21:00:00Z')),'2026-10-17');assert.equal(frenchDayIndex('2026-10-16'),0);assert.equal(frenchDayIndex('2026-11-15'),30);assert.equal(frenchDayIndex('2026-11-16'),0);assert.equal(frenchDayIndex('2026-10-15'),30);assert.throws(()=>frenchDayIndex('2026-02-30'));
});
test('expression checking handles punctuation and case while retaining meaningful French accents',()=>{
 assert.equal(normalizeFrenchAnswer('  D’ACCORD ! '),normalizeFrenchAnswer("d'accord"));assert.notEqual(normalizeFrenchAnswer('été'),normalizeFrenchAnswer('ete'));assert.deepEqual(frenchExpressionTask('Je prends mon temps'),{prompt:'Je prends mon ____',answer:'temps'});
});
test('French notes and completion persist independently by date and level without touching English progress',()=>{
 const entries=new Map([['speak-boldly-daily-follow-up-v1:2026-10-16:foundation','English']]),storage={getItem:key=>entries.get(key)||null,setItem:(key,value)=>entries.set(key,value)};
 const value={word:'temps',response:'Je prends mon temps pour lire.',complete:true};saveFrenchProgress(storage,'2026-10-16','foundation',value);assert.deepEqual(readFrenchProgress(storage,'2026-10-16','foundation'),value);assert.deepEqual(readFrenchProgress(storage,'2026-10-17','foundation'),{});assert.deepEqual(readFrenchProgress(storage,'2026-10-16','stretching'),{});assert.equal(entries.get('speak-boldly-daily-follow-up-v1:2026-10-16:foundation'),'English');assert(frenchStorageKey('2026-10-16','foundation').includes('french'));assert.deepEqual(readFrenchProgress({getItem:()=>'{broken'},'2026-10-16','foundation'),{});
});
