import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {renderBeyondFooter} from './beyond-shell.js';
const personal=/Mira|Nasser|Louis|Founded by|English Language Coaching/i;
test('every standalone Beyond footer has no personal teaching credentials',()=>{
 assert(!personal.test(renderBeyondFooter()));
 for(const file of ['literatespace/index.html','literatespace/interpret-boldly/index.html','literatespace/sign-language/index.html','literatespace/monthly-edit/index.html','beyond-words/index.html']){
  const html=readFileSync(file,'utf8'),footers=html.match(/<footer\b[\s\S]*?<\/footer>/g)||[];assert.equal(footers.length,1,file);assert(!personal.test(footers[0]),file);assert(footers[0].includes('© 2026 Beyond.'),file);
 }
});
test('blog listing footers are neutral while Speak Boldly keeps its teaching credentials',()=>{
 for(const file of ['index.html','blog/index.html','blog/the-quiet-power-of-consistency/index.html','blog/your-english-is-not-your-worth/index.html']){const html=readFileSync(file,'utf8'),footer=html.match(/<div\b[^>]*data-blog-footer[^>]*>[\s\S]*?<\/div>/)?.[0];assert(footer,file);assert(!personal.test(footer),file);}
 const home=readFileSync('index.html','utf8').match(/<div class="home-bottom-row">[\s\S]*?(?=<section id="speak-hub")/)?.[0];assert(home.includes('Founded by Mira Nasser Louis.'));
});
