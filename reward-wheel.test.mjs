import test from 'node:test';import assert from 'node:assert/strict';
import {WHEEL_PRIZES,WHEEL_SECTORS,WHEEL_STORAGE_KEY,readMonthlySpin,drawMonthlySpin,rewardMonth,safeRewardShareUrl,rewardWhatsAppUrl,wheelRestAngle} from './reward-wheel-model.js';
const store=()=>{const values=new Map();return {getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)};};
test('the wheel contains only the two available rewards, in equal sectors',()=>{assert.deepEqual(WHEEL_PRIZES.map(x=>x.id),['discount','practice']);for(const id of ['discount','practice'])assert.equal(WHEEL_SECTORS.filter(x=>x===id).length,3);});
test('a draw is saved before animation and cannot be changed by reopening or reloading',()=>{
 const storage=store(),now=new Date('2026-11-28T12:00Z'),first=drawMonthlySpin(storage,{now,random:()=>0,reference:()=> 'ABCDEF1234'});assert.equal(first.prizeId,'discount');assert.equal(first.persisted,true);
 const second=drawMonthlySpin(storage,{now,random:()=>.99,reference:()=> 'DIFFERENT'});assert.equal(second.prizeId,first.prizeId);assert.equal(second.reference,first.reference);assert.equal(readMonthlySpin(storage,now).sector,first.sector);
});
test('the next monthly draw opens at Cairo midnight and old malformed results are ignored',()=>{
 const storage=store();drawMonthlySpin(storage,{now:new Date('2026-11-30T21:59:59Z'),random:()=>0,reference:()=> 'ABCDEF'});assert.equal(rewardMonth(new Date('2026-11-30T22:00Z')),'2026-12');
 const next=drawMonthlySpin(storage,{now:new Date('2026-11-30T22:00Z'),random:()=>.25,reference:()=> 'NEXTMONTH'});assert.equal(next.month,'2026-12');assert.equal(next.prizeId,'practice');
 storage.setItem(WHEEL_STORAGE_KEY,'broken');assert.equal(readMonthlySpin(storage),null);
});
test('a blocked local store leaves an honest unsaved result and all sectors align with the pointer',()=>{
 const result=drawMonthlySpin({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}},{random:()=>.99,reference:()=> 'ABCDEF'});assert.equal(result.persisted,false);
 for(let i=0;i<6;i++)assert.equal((wheelRestAngle(i)+(i+.5)*60)%360,0);
});
test('WhatsApp carries a review request and never exposes private portal links or a voucher code',()=>{
 const r=drawMonthlySpin(store(),{now:new Date('2026-11-28T12:00Z'),random:()=>0,reference:()=> 'ABCDEF'});
 const url=new URL(rewardWhatsAppUrl(r,'https://speakboldly.space/student-portal/?token=private'));assert.equal(url.hostname,'wa.me');assert.equal(url.pathname,'/201283786904');const copy=url.searchParams.get('text');assert.match(copy,/Please check my eligibility/);assert(copy.includes(r.reference));assert.doesNotMatch(copy,/token=|voucher code|automatically approved/);
 assert.equal(safeRewardShareUrl('https://evil.example/programs/'),'https://speakboldly.space/programs/');assert.equal(safeRewardShareUrl('https://speakboldly.space/motivation/test.html?secret=private'),'https://speakboldly.space/motivation/test.html');
});
