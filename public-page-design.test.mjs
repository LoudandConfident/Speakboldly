import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=path=>readFileSync(path,'utf8');
test('Programs and Motivation use the original website screens, not a separate layout',()=>{
 for(const [file,view,course]of [['programs/index.html','courses',''],['programs/general-english/index.html','courses','general-8'],['learn/daily-quotes/index.html','daily-quote',''],['assessments/index.html','placement',''],['learn/daily-idioms/index.html','students-portal',''],['learn/daily-challenges/index.html','students-portal','']]){
 const html=read(file);assert(html.includes('data-public-site-view="'+view+'"'));assert(html.includes('data-public-course="'+course+'"'));assert(html.includes('<base href="/">'));assert(html.includes('class="logo speak-logo"'));assert(html.includes('id="main-navigation"'));assert(html.includes('/assets/public-site-route.js'));assert(html.includes('app.js?v='));assert(!html.includes('class="public-page"'));assert(html.includes('<noscript>'));assert(html.includes('class="page-signature"'));
 }
 assert(!read('index.html').includes('class="seo-resource-directory"'));
});
