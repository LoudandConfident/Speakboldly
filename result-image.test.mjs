import test from 'node:test';
import assert from 'node:assert/strict';
import {resultImageBlocks,addResultImageButton} from './result-image.js';
function setup(nativeShare=false){
 const painted=[],downloads=[],shares=[];
 const node=tag=>({tagName:tag.toUpperCase(),children:[],textContent:'',disabled:false,append(...children){this.children.push(...children);},setAttribute(){},closest(){return null;},remove(){},click(){downloads.push(this.download);}});
 const title=node('h3');title.textContent='Estimated level range: A2–B1';
 const advice=node('p');advice.textContent='Practise sentence structure and connected speech.';
 const status=node('p');status.textContent='This status must not appear in the image.';status.closest=()=>({});
 const row=node('tr');const label=node('th'),value=node('td');label.textContent='The Visual Organizer';value.textContent='60%';row.append(label,value);
 const result=node('section');result.querySelectorAll=()=>[title,advice,row,status];
 const ctx={font:'',measureText:text=>({width:text.length*16}),fillRect(){},fillText:text=>painted.push(text)};
 const doc={body:node('body'),createElement:tag=>tag==='canvas'?{getContext:()=>ctx,toBlob:callback=>callback(new Blob(['image'],{type:'image/png'}))}:node(tag)};
 const win={File,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},navigator:nativeShare?{canShare:()=>true,share:async data=>shares.push(data)}:{},setTimeout:fn=>fn()};
 return {result,doc,win,painted,downloads,shares};
}
test('result pictures include result, advice and preference rows but omit save controls',()=>{
 const {result}=setup();const blocks=resultImageBlocks(result);
 assert.equal(blocks.length,3);assert(blocks[0].heading);assert.equal(blocks[2].text,'The Visual Organizer — 60%');
});
test('English result saves a PNG without an external upload',async()=>{
 const s=setup();addResultImageButton(s.doc,s.win,s.result,'Speak Boldly — English assessment');
 const button=s.result.children[0].children[0];await button.onclick();
 assert.deepEqual(s.downloads,['Speak-Boldly-English-result.png']);assert.equal(button.disabled,false);
 assert(s.painted.join(' ').includes('A2–B1'));assert(!s.painted.join(' ').includes('must not appear'));
});
test('supported phones receive a PNG file through their save menu',async()=>{
 const s=setup(true);addResultImageButton(s.doc,s.win,s.result,'Speak Boldly — Learner assessment');await s.result.children[0].children[0].onclick();
 assert.equal(s.shares[0].files[0].name,'Speak-Boldly-learner-result.png');assert.equal(s.shares[0].files[0].type,'image/png');assert.equal(s.downloads.length,0);
});
