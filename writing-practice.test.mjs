import test from 'node:test';
import assert from 'node:assert/strict';
import {createWritingPractice} from './writing-practice.js';
class Node {
 constructor(tag,text=''){this.tag=tag;this.textContent=text;this.children=[];}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(){}
 focus(){this.focused=true;}
}
const find=(node,tag)=>node.tag===tag?node:node.children.filter(n=>n instanceof Node).map(n=>find(n,tag)).find(Boolean);
const text=node=>node.textContent+node.children.map(n=>n instanceof Node?text(n):String(n)).join(' ');
test('writing UI highlights both mistakes and labels vocabulary feedback',()=>{
 const doc={createElement:tag=>new Node(tag),createTextNode:t=>new Node('#text',t),addEventListener(){},removeEventListener(){},defaultView:{addEventListener(){},removeEventListener(){},clearTimeout(){}}};
 const practice=createWritingPractice(doc,{minimum:2});
 practice.input.value='Do you like fishes?\nI am writing to my tasks!';practice.review();
 assert(find(practice.root,'mark'));assert.match(text(practice.root),/Vocabulary/);assert.match(text(practice.root),/Usually use/);
 practice.input.value='She are happy';practice.input.oninput();practice.review();
 const output=text(practice.root);assert.match(output,/Write at least 2/);assert.match(output,/Grammar/);assert.match(output,/Punctuation/);assert.match(output,/Finish the last sentence/);
 const feedback=practice.root.children[0].children.at(-1);const apply=feedback.children.at(-1);apply.onclick();assert.equal(practice.input.value,'She is happy.');
});
