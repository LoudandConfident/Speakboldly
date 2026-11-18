import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {LEARNING_HUB_ROUTES,learningHubRoute,learningHubPanel,learningCardFromHash} from './learning-hub-routes.js';
import {publicTabTarget} from './public-tab-addresses.js';

test('every learning card has a distinct real page that opens the intended section',()=>{
 const paths=Object.values(LEARNING_HUB_ROUTES).map(route=>route.path);
 assert.equal(paths.length,10);assert.equal(new Set(paths).size,10);
 for(const [id,route]of Object.entries(LEARNING_HUB_ROUTES)){
  assert.equal(learningHubPanel(route.path),id);
  const hash='#students-portal/student/'+id;
  assert.equal(learningCardFromHash(hash),id);
  assert.equal(publicTabTarget(hash),route.path);
  const html=readFileSync(new URL('.'+route.path+'index.html',import.meta.url),'utf8');
  assert(html.includes('<link rel="canonical" href="https://speakboldly.space'+route.path+'">'));
  assert(html.includes('data-public-panel="'+id+'"'));
  assert(html.includes('location.pathname+location.search+"'+hash+'"'));
 }
});

test('existing student bookmarks remain valid without creating instructor routes',()=>{
 assert.equal(publicTabTarget('#students-portal/student'),'/student-portal/');
 assert.equal(publicTabTarget('#students-portal/student/mission',{pathname:'/learn/daily-idioms/'}),'/learn/daily-idioms/');
 for(const id of ['teacher','admin','constructor','__proto__',null])assert.equal(learningHubRoute(id),null);
 for(const hash of ['#students-portal/teacher/monthly','#students-portal/student/admin','#home'])assert.equal(learningCardFromHash(hash),null);
});

test('student entry URLs preserve access checks and the current dashboard design',()=>{
 const shell=readFileSync(new URL('./index.html',import.meta.url),'utf8');
 assert(!shell.includes('learning-card-links.css'));
 const groups=readFileSync(new URL('./learning-card-groups.js',import.meta.url),'utf8');
 assert(!groups.includes('createLearningCopyButton'));
 for(const [id,route]of Object.entries(LEARNING_HUB_ROUTES)){
  if(!route.noindex)continue;
  const html=readFileSync(new URL('.'+route.path+'index.html',import.meta.url),'utf8');
  assert(html.includes('name="robots" content="noindex,follow"'),id);
 }
});
