import test from 'node:test';
import assert from 'node:assert/strict';
import {resultImageBlocks,learnerResultImageBlocks,addResultImageButton} from './result-image.js';
function setup(nativeShare=false){
 const painted=[],downloads=[],shares=[];
 const node=tag=>({tagName:tag.toUpperCase(),children:[],textContent:'',disabled:false,append(...children){this.children.push(...children);},setAttribute(){},closest(){return null;},remove(){},click(){downloads.push(this.download);}});
 const title=node('h3');title.textContent='Estimated level range: A2–B1';
 const advice=node('p');advice.textContent='Practise sentence structure and connected speech.';
 const status=node('p');status.textContent='This status must not appear in the image.';status.closest=()=>({});
 const row=node('tr');const label=node('th'),value=node('td');label.textContent='The Visual Organizer';value.textContent='60%';row.append(label,value);
 const result=node('section');result.querySelectorAll=()=>[title,advice,row,status];
 const backgrounds=[];const ctx={font:'',measureText:text=>({width:text.length*16}),fillRect(){backgrounds.push(this.fillStyle);},fillText:text=>painted.push(text)};
 const canvas={getContext:()=>ctx,toBlob:callback=>callback(new Blob(['image'],{type:'image/png'}))};
 const doc={body:node('body'),createElement:tag=>tag==='canvas'?canvas:node(tag)};
 const win={File,URL:{createObjectURL:()=> 'blob:test',revokeObjectURL(){}},navigator:nativeShare?{canShare:()=>true,share:async data=>shares.push(data)}:{},setTimeout:fn=>fn()};
 return {result,doc,win,painted,downloads,shares,canvas,backgrounds};
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

test('learner image is a square green PNG containing only the result card and contact',async()=>{
 const s=setup(),heading={tagName:'H3',textContent:'The Visual Organizer',closest:()=>null},advice={tagName:'P',textContent:'Use word maps and practise speaking.',closest:()=>null},contact={textContent:'Contact speakboldly16@gmail.com'};
 const card={querySelectorAll:()=>[heading,advice]};s.result.querySelectorAll=selector=>selector===':scope > section'?[card]:selector===':scope > .result-contact'?[contact]:[];
 assert.equal(learnerResultImageBlocks(s.result).length,3);
 addResultImageButton(s.doc,s.win,s.result,'Your English learner profile',{learnerCard:true});await s.result.children[0].children[0].onclick();
 assert.equal(s.canvas.width,1600);assert.equal(s.canvas.height,1600);assert.deepEqual(s.backgrounds,['#edf0e6']);assert.deepEqual(s.downloads,['Speak-Boldly-learner-result.png']);
 assert(s.painted.join(' ').includes('The Visual Organizer'));assert(s.painted.join(' ').includes('speakboldly16@gmail.com'));assert(!s.painted.join(' ').includes('A2–B1'));
});
