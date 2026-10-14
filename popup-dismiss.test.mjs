import test from 'node:test';
import assert from 'node:assert/strict';
import {initializeOutsideDismiss} from './popup-dismiss.js';
function setup(){
 const handlers={};initializeOutsideDismiss({addEventListener:(name,fn)=>handlers[name]=fn});
 let closed=0;const dialog={open:true,closest(){return this;},getBoundingClientRect:()=>({left:100,right:300,top:100,bottom:300}),close(){closed++;}};
 const event=(target,x,y)=>({target,clientX:x,clientY:y,preventDefault(){},stopPropagation(){}});
 return {handlers,dialog,event,closed:()=>closed};
}
test('outside taps dismiss but clicks inside the dialog do not',()=>{
 const s=setup();s.handlers.pointerdown(s.event(s.dialog,150,150));s.handlers.click(s.event(s.dialog,150,150));assert.equal(s.closed(),0);
 s.handlers.pointerdown(s.event(s.dialog,50,50));s.handlers.click(s.event(s.dialog,50,50));assert.equal(s.closed(),1);
});
test('dragging from inside to the backdrop does not dismiss',()=>{
 const s=setup(),input={closest:()=>s.dialog};s.handlers.pointerdown(s.event(input,150,150));s.handlers.click(s.event(s.dialog,50,50));assert.equal(s.closed(),0);
});
test('dialogs created after initialization also dismiss',()=>{
 const s=setup(),later={...s.dialog,closest(){return this;}};s.handlers.click(s.event(later,20,20));assert.equal(s.closed(),1);
});
