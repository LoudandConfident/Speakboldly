import test from 'node:test';
import assert from 'node:assert/strict';
import {initializePullToRefresh} from './pull-to-refresh.js';
function fixture(installed=true,phone=false){
 const handlers={},pending=new Map();let reloads=0,id=0,blocked=false;
 const indicator={setAttribute(){},hidden:true},body={append(){},classList:{contains:()=>false}},root={classList:{toggle(){}}};
 const target={closest:()=>null,parentElement:body,scrollHeight:100,clientHeight:100};
 const doc={body,documentElement:root,createElement:()=>indicator,querySelector:()=>blocked,addEventListener:(name,fn)=>handlers[name]=fn};
 const win={matchMedia:query=>({matches:query.includes('max-width')?phone:installed,addEventListener(){}}),navigator:{onLine:true},scrollY:0,getComputedStyle:()=>({overflowY:'visible'}),addEventListener(){},clearTimeout:key=>pending.delete(key),setTimeout:fn=>{pending.set(++id,fn);return id;},location:{reload:()=>reloads++}};
 initializePullToRefresh(doc,win);
 function touch(name,x,y,count=1){let prevented=false;handlers[name]({target,touches:Array.from({length:count},()=>({clientX:x,clientY:y})),cancelable:true,preventDefault:()=>prevented=true});return prevented;}
 return {win,target,indicator,touch,end:()=>handlers.touchend(),cancel:()=>handlers.touchcancel(),block:()=>blocked=true,flush(){for(const fn of pending.values())fn();pending.clear();},get reloads(){return reloads;}};
}
test('a deliberate pull at the top refreshes the installed app once on release',()=>{const f=fixture();f.touch('touchstart',100,100);assert.equal(f.touch('touchmove',105,200),true);assert.equal(f.indicator.textContent,'Release to refresh');assert.equal(f.reloads,0);f.end();f.end();f.flush();assert.equal(f.reloads,1);});
test('ordinary scrolling, short pulls, horizontal swipes and cancelled gestures do not refresh',()=>{
 for(const kind of ['scrolled','short','horizontal','upward','cancel','multitouch','blocked','browser']){const f=fixture(kind!=='browser');if(kind==='scrolled')f.win.scrollY=200;if(kind==='blocked')f.block();f.touch('touchstart',100,100);f.touch('touchmove',kind==='horizontal'?250:100,kind==='short'?130:kind==='upward'?0:210,kind==='multitouch'?2:1);if(kind==='cancel')f.cancel();f.end();f.flush();assert.equal(f.reloads,0,kind);}
});
test('offline refresh keeps the page and gives connection feedback',()=>{const f=fixture();f.win.navigator.onLine=false;f.touch('touchstart',100,100);f.touch('touchmove',100,220);f.end();assert.equal(f.indicator.textContent,'Reconnect to refresh');f.flush();assert.equal(f.reloads,0);});

test('phone website has the same pull-to-refresh gesture as the installed app',()=>{const f=fixture(false,true);f.touch('touchstart',100,100);f.touch('touchmove',100,210);assert.equal(f.indicator.textContent,'Release to refresh');f.end();f.flush();assert.equal(f.reloads,1);});
