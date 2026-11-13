import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeProgramOffer,PROGRAM_OFFER_DELAY_MS} from './program-offer.js';
function fixture(){
 let time=0,nextId=0;const timers=new Map(),listeners=new Map(),programs={hidden:true};
 const buttons=new Map();let observer;
 const win={setTimeout(fn,delay){const id=++nextId;timers.set(id,{at:time+delay,fn});return id;},clearTimeout(id){timers.delete(id);},requestAnimationFrame(fn){fn();},addEventListener(type,fn){listeners.set('window:'+type,fn);},MutationObserver:class{constructor(fn){observer=fn;}observe(){}}};
 const dialog={open:false,setAttribute(){},addEventListener(){},querySelector(selector){if(!buttons.has(selector))buttons.set(selector,{addEventListener(){}});return buttons.get(selector);},showModal(){this.open=true;},close(){this.open=false;doc.emit('close',{target:this});}};
 const doc={hidden:false,defaultView:win,body:{append(){}},getElementById(){return null;},createElement(){return dialog;},querySelector(selector){if(selector==='#courses')return programs;if(selector==='dialog[open]')return doc.otherDialog|| (dialog.open?dialog:null);return null;},addEventListener(type,fn){listeners.set(type,fn);},emit(type,event={}){listeners.get(type)?.(event);}};
 initializeProgramOffer(doc);
 return {doc,dialog,enter(){programs.hidden=false;observer();},leave(){programs.hidden=true;observer();},advance(ms){const end=time+ms;while(true){const due=[...timers].filter(([,x])=>x.at<=end).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;timers.delete(due[0]);time=due[1].at;due[1].fn();}time=end;}};
}
test('offer opens only after 30 seconds, once per Programs visit',()=>{assert.equal(PROGRAM_OFFER_DELAY_MS,30000);const f=fixture();f.enter();assert.equal(f.dialog.open,false);f.advance(29999);assert.equal(f.dialog.open,false);f.advance(1);assert.equal(f.dialog.open,true);f.dialog.close();f.advance(60000);assert.equal(f.dialog.open,false);f.leave();f.enter();f.advance(30000);assert.equal(f.dialog.open,true);});
test('leaving Programs cancels the offer, and background tabs restart the delay',()=>{const f=fixture();f.enter();f.advance(10000);f.leave();f.advance(40000);assert.equal(f.dialog.open,false);f.enter();f.advance(10000);f.doc.hidden=true;f.doc.emit('visibilitychange');f.advance(40000);assert.equal(f.dialog.open,false);f.doc.hidden=false;f.doc.emit('visibilitychange');f.advance(29999);assert.equal(f.dialog.open,false);f.advance(1);assert.equal(f.dialog.open,true);});
test('offer waits for an existing program dialog to close',()=>{const f=fixture();f.enter();const other={open:true};f.doc.otherDialog=other;f.advance(30000);assert.equal(f.dialog.open,false);f.doc.otherDialog=null;f.doc.emit('close',{target:other});assert.equal(f.dialog.open,true);});
