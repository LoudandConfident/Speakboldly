import {test} from 'node:test';
import assert from 'node:assert/strict';
import {resultImageColors} from './result-image.js';
import {CEFR_LEVELS} from './cefr-levels.js';
const doc={defaultView:{getComputedStyle:node=>node.style}};
test('saved English result uses the actual result card background and text colors',()=>{
 assert.deepEqual(resultImageColors(doc,{style:{backgroundColor:'rgb(231, 240, 230)',color:'rgb(25, 60, 50)'}}),{background:'rgb(231, 240, 230)',foreground:'rgb(25, 60, 50)'});
});
test('transparent results inherit their background and learner images retain their card color',()=>{
 const card={style:{backgroundColor:'rgb(237, 240, 230)',color:'rgb(25, 60, 50)'}},root={style:{backgroundColor:'rgba(0, 0, 0, 0)',color:'rgb(25, 60, 50)'},parentElement:card,querySelector:()=>card};
 assert.equal(resultImageColors(doc,root).background,card.style.backgroundColor);assert.equal(resultImageColors(doc,root,{learnerCard:true}).background,card.style.backgroundColor);
});
test('six CEFR descriptions cover A1 through C2 in order without treating C2 as native status',()=>{
 assert.deepEqual(CEFR_LEVELS.map(item=>item.level),['A1','A2','B1','B2','C1','C2']);for(const item of CEFR_LEVELS){assert(item.description.length>70);assert(item.label);assert(!/native/i.test(item.description));}
});
