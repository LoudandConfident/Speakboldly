import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {questions} from './placement-questions.js';
import {answerKey} from './placement-scoring.js';
import {placementExplanations} from './placement-explanations.js';
test('all 50 questions have a specific explanation including the correct word or construction',()=>{
 assert.equal(placementExplanations.length,questions.length);
 for(const q of questions){const text=placementExplanations[q.number-1];assert(text.length>70);assert(text.toLowerCase().includes(q.options[answerKey[q.number-1]].toLowerCase()),'Explanation must cover correct answer for '+q.number);}
});
test('results expose only mistakes with explanations and handle unanswered and perfect results',()=>{
 const source=readFileSync(new URL('./placement-assessment.js',import.meta.url),'utf8');
 const block=source.slice(source.indexOf(' const corrections=placementCorrections(record.answers)'),source.indexOf(' result.append(createPlacementBookingRemark('));
 const el=tag=>({tag,children:[],style:{},append(...children){this.children.push(...children)},setAttribute(){}});
 for(const corrections of [[],[{number:10,selected:0,correct:1},{number:48,selected:null,correct:0}]]){
  const result=el('section');const context={record:{answers:{}},placementCorrections:()=>corrections,questions,placementExplanations,result,document:{createElement:el}};
  vm.runInNewContext(block,context);
  const nodes=[];function visit(node){nodes.push(node);node.children.forEach(visit)}visit(result);
  assert.equal(nodes.filter(n=>n.tag==='summary'&&n.textContent==='Check your mistakes and why').length,1);
  const rows=nodes.filter(n=>n.tag==='li');assert.equal(rows.length,corrections.length);
  rows.forEach((row,i)=>{assert.equal(row.value,corrections[i].number);assert(row.children.some(n=>n.textContent==='Why: '+placementExplanations[corrections[i].number-1]));});
  if(corrections.length)assert(nodes.some(n=>n.textContent==='Your answer: Not answered'));
 }
});
