import test from 'node:test';
import assert from 'node:assert/strict';
import {createCalendarLoader} from './calendar-loader.js';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return{promise,resolve,reject};};
test('opening a calendar during a dashboard read shares the request and applies its result',async()=>{
 const response=deferred(),seen=[];let reads=0;
 const loader=createCalendarLoader({read:()=>{reads++;return response.promise;},apply:value=>seen.push(value)});
 const dashboard=loader.refresh(),opened=loader.refresh();assert.equal(dashboard,opened);
 response.resolve(['Monica']);assert.equal(await opened,true);assert.equal(reads,1);assert.deepEqual(seen,[['Monica']]);
});
test('a recent snapshot avoids duplicate polling, and manual refresh bypasses freshness',async()=>{
 let time=0,reads=0;const loader=createCalendarLoader({read:async()=>++reads,apply(){},now:()=>time});
 await loader.refresh();time=15000;await loader.refresh();assert.equal(reads,1);
 await loader.refresh({force:true});assert.equal(reads,2);time=46000;await loader.refresh();assert.equal(reads,3);
});
test('a save invalidates an older read and queued refreshes request the new snapshot once',async()=>{
 const old=deferred(),seen=[];let reads=0;
 const loader=createCalendarLoader({read:()=>++reads===1?old.promise:Promise.resolve(['updated']),apply:value=>seen.push(value)});
 const initial=loader.refresh();await Promise.resolve();loader.invalidate();const first=loader.refresh(),second=loader.refresh();
 old.resolve(['old']);assert.equal(await initial,false);await Promise.all([first,second]);assert.equal(reads,2);assert.deepEqual(seen,[['updated']]);
});
test('a failed read preserves displayed appointments and the next refresh recovers',async()=>{
 const seen=[],errors=[];let reads=0;
 const loader=createCalendarLoader({read:async()=>{if(++reads===2)throw Error('offline');return reads;},apply:value=>seen.push(value),onError:error=>errors.push(error.message)});
 await loader.refresh();assert.equal(await loader.refresh({force:true}),false);assert.deepEqual(seen,[1]);assert.deepEqual(errors,['offline']);
 assert.equal(await loader.refresh(),true);assert.deepEqual(seen,[1,3]);
});
test('sign-out prevents late responses from restoring private calendar data',async()=>{
 const response=deferred(),seen=[];let unlocked=true;
 const loader=createCalendarLoader({read:()=>response.promise,apply:value=>seen.push(value),isActive:()=>unlocked});
 const pending=loader.refresh();unlocked=false;loader.clear();response.resolve(['private']);assert.equal(await pending,false);assert.deepEqual(seen,[]);
});
