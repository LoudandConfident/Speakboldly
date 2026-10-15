import test from 'node:test';
import assert from 'node:assert/strict';
import {dailyMission,cairoMissionDate,missionWeekDates,missionLevels,readMissionState,writeMissionState,MISSION_STORAGE_KEY} from './daily-mission-data.js';
const storage=()=>{const map=new Map();return {getItem:key=>map.get(key)||null,setItem:(key,value)=>map.set(key,value)};};
test('371 days have distinct missions and rotate all seven formats for every level',()=>{
 for(const level of Object.keys(missionLevels)){const missions=Array.from({length:371},(_,i)=>dailyMission(new Date(Date.UTC(2026,0,1+i)).toISOString().slice(0,10),level));assert.equal(new Set(missions.map(m=>m.id)).size,371);assert.equal(new Set(missions.map(m=>m.type)).size,7);assert.equal(new Set(missions.map(m=>m.title)).size,53);assert(missions.every(m=>m.instruction&&m.difficulty&&m.response&&m.level===level));for(const mission of missions.filter(m=>m.type==='Hear it'))assert(mission.audio&&mission.model===mission.audio);for(const mission of missions.filter(m=>m.type==='Fix it'))assert(mission.model);}
});
test('Cairo midnight changes the daily mission and a week runs Monday to Sunday',()=>{
 const before=cairoMissionDate(new Date('2026-10-15T20:59:59Z')),after=cairoMissionDate(new Date('2026-10-15T21:00:00Z'));assert.equal(before,'2026-10-15');assert.equal(after,'2026-10-16');assert.notEqual(dailyMission(before).id,dailyMission(after).id);assert.deepEqual(missionWeekDates('2026-11-01'),['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01']);
});
test('personal details, drafts and one completion per day survive reload on the same device',()=>{
 const device=storage(),state=readMissionState(device);state.name='Mariam';state.level='developing';state.days['2026-10-15']={answer:'My short response.',done:true,level:'developing'};writeMissionState(device,state);const loaded=readMissionState(device);assert.deepEqual(loaded,state);loaded.days['2026-10-15'].done=true;writeMissionState(device,loaded);assert.equal(Object.values(readMissionState(device).days).filter(d=>d.done).length,1);assert.deepEqual(readMissionState(storage()).days,{});
});
test('invalid saved data is contained and storage failure is not reported as successful saving',()=>{
 const device=storage();device.setItem(MISSION_STORAGE_KEY,'not json');assert.deepEqual(readMissionState(device).days,{});device.setItem(MISSION_STORAGE_KEY,JSON.stringify({name:12,level:'owner',days:{bad:{done:true},'2026-10-15':{answer:123,done:'yes',level:'admin'}}}));const state=readMissionState(device);assert.equal(state.name,'');assert.equal(state.level,'foundation');assert.deepEqual(state.days,{'2026-10-15':{answer:'',done:false,level:'foundation'}});assert.throws(()=>writeMissionState({setItem(){throw new Error('quota');}},state),/quota/);
});
test('stored history is bounded and correction difficulty follows the chosen practice level',()=>{
 const device=storage(),state=readMissionState(device);for(let i=0;i<450;i++)state.days[new Date(Date.UTC(2025,0,1+i)).toISOString().slice(0,10)]={answer:'notes',done:true,level:'foundation'};writeMissionState(device,state);assert.equal(Object.keys(readMissionState(device).days).length,400);assert.notEqual(dailyMission('2026-01-04','foundation').model,dailyMission('2026-01-04','stretching').model);
});
