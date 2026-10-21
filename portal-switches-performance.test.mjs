import test from 'node:test';
import assert from 'node:assert/strict';
import {initializePortalSwitches} from './portal-switches.js';
import {initializeClientSheet,clearClientSheet} from './client-sheet.js?v=level-history';
class Node{constructor(){this.children=[];this.classList={toggle(){}};}append(...items){this.children.push(...items);}replaceChildren(...items){this.children=items;}setAttribute(){}addEventListener(){}}
test('access lists start independently and keep working if one source fails',async()=>{
 const endpoint='https://script.google.com/macros/s/test/exec',list=new Node(),status=new Node(),refresh=new Node(),root=new Node();root.querySelector=s=>s==='.portal-switch-list'?list:s==='[role=status]'?status:refresh;
 const connection={elements:{endpoint:{defaultValue:endpoint},key:{}},addEventListener(){}};
 const doc={querySelector:s=>s==='#portal-switches'?root:s==='#client-sheet-connect'?connection:s==='#client-sheet-status'?new Node():null,createElement:()=>new Node(),addEventListener(){},defaultView:{localStorage:{getItem:()=>JSON.stringify({endpoint,key:'test-private-key'})}}};
 initializeClientSheet(doc).restore();const previous=globalThis.fetch,started=[],pending=[];
 globalThis.fetch=async(url,options)=>{const body=JSON.parse(options.body);if(body.action==='listPortalAccess')return{ok:true,json:async()=>({ok:true,items:[]})};started.push('drive:'+body.section);return new Promise(resolve=>pending.push(()=>resolve({ok:true,json:async()=>body.section==='exams'?{ok:false,error:'Unavailable'}:{ok:true,items:[]}})));};
 const loader=section=>{started.push('website:'+section);return new Promise((resolve,reject)=>pending.push(()=>section==='exercises'?reject(new Error('Offline')):resolve([])));};
 try{const switches=initializePortalSwitches(doc,()=>true,loader),running=switches.refresh();await new Promise(setImmediate);assert.equal(started.length,8,'all eight requests start without waiting for earlier ones');pending.forEach(resolve=>resolve());await running;assert.match(status.textContent,/Website exercises files could not load/);assert.match(status.textContent,/Drive exams folder is not connected/);assert(list.children.length>0);}finally{globalThis.fetch=previous;clearClientSheet();}
});
