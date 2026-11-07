import test from 'node:test';
import assert from 'node:assert/strict';
import {openSection,sectionUrl,initializeSectionLinks} from './section-navigation.js';
test('new section links use a same-site deep link and preserve the current document',()=>{const win={location:{href:'https://speakboldly.space/learn/#students-portal/student/mission'}};assert.equal(sectionUrl(win,'students-portal/student/contact'),'https://speakboldly.space/#students-portal/student/contact');let closed=0;const doc={defaultView:{...win,open:(url,target)=>{assert.equal(target,'_blank');assert.match(url,/#students-portal\/student\/contact$/);return{opener:{}};}},querySelectorAll:()=>[{close(){closed++;}}]};assert.equal(openSection(doc,'students-portal/student/contact'),true);assert.equal(closed,1);assert.equal(doc.defaultView.location.href,win.location.href);});
test('blocked new tabs leave the original popup and document intact',()=>{let closed=false;const doc={defaultView:{location:{href:'https://speakboldly.space/#courses'},open:()=>null},querySelectorAll:()=>[{close(){closed=true;}}]};assert.equal(openSection(doc,'students-portal/calendar'),false);assert.equal(closed,false);assert.match(doc.defaultView.location.href,/#courses$/);});
test('restoration respects an explicitly requested destination',()=>{const win={location:{href:'https://speakboldly.space/#courses',hash:'#courses',pathname:'/',search:''},history:{replaceState(){assert.fail('explicit destination must win');}},localStorage:{getItem:()=> '#students-portal/student/monthly'},addEventListener(){}};initializeSectionLinks({addEventListener(){}},win);});
test('primary navigation and dashboard cards leave same-tab routing to their existing handlers',()=>{
 let click;const win={location:{href:'https://speakboldly.space/#courses',hash:'#courses',pathname:'/',search:''},localStorage:{setItem(){}},addEventListener(){},open(){assert.fail('primary navigation must not open another tab');}};
 initializeSectionLinks({addEventListener:(name,handler)=>{if(name==='click')click=handler;}},win);
 for(const kind of ['header tab','dashboard card','learning back']){
  const node={closest:()=>true};click({target:{closest:()=>node},isTrusted:true,button:0,preventDefault(){assert.fail(kind+' must keep its normal handler');},stopImmediatePropagation(){assert.fail(kind+' must keep its normal handler');}});
 }
});
