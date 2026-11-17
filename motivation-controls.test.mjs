import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
import {setMotivationSettings,refreshMotivationSettings,INITIAL_MOTIVATION_FREEZE,motivationSettings} from './motivation-settings.js';
import {quoteForDate,clientDailyMotivation,cairoDayNumber} from './home-gallery.js';
import {initializePublicTabAddresses} from './public-tab-addresses.js';

const now=new Date('2026-11-17T12:00:00Z'),today=cairoDayNumber(now),selection='daily-motivation-keep-going-clean';
const fixture=()=>{const f=createSheetExamFixture();f.advance(now.getTime()-f.context.Date.now());return f;};
const save=(f,payload)=>f.request({action:'saveDailyMotivationSettings',key:'private-test-key',day:today,revision:'0',...payload});
afterEach(()=>setMotivationSettings(INITIAL_MOTIVATION_FREEZE));

test('address synchronisation preserves an explicit share destination before the gallery loads',()=>{
 for(const query of ['motivation-entry='+selection,'motivation=2026-11-16']){
  const win={location:new URL('https://speakboldly.space/?'+query+'#daily-quote'),queueMicrotask:fn=>fn(),addEventListener(){},history:{replaceState:(_,__,url)=>{win.location=new URL(url,win.location.origin);}}};
  const page={dataset:{}},listeners={},doc={querySelector:()=>page,addEventListener:(type,fn)=>{listeners[type]=fn;}};
  initializePublicTabAddresses(doc,win);assert.equal(win.location.search,'?'+query);
  page.dataset.publicShareUrl='https://speakboldly.space/motivation/share/'+selection+'.html';listeners['sb-public-share-url']();assert.equal(win.location.search,'?'+query);
 }
});

test('selecting a message is private, revision protected, and persists across public reads',()=>{
 const f=fixture();assert.equal(f.request({action:'saveDailyMotivationSettings',day:today,revision:'0',mode:'hold',selection}).ok,false);
 const held=save(f,{mode:'hold',selection});assert.equal(held.ok,true,held.error);assert.equal(held.capabilities.motivationSelection,1);
 assert.equal(held.settings.selection,selection);assert.equal(held.settings.message,null);
 assert.equal(save(f,{mode:'resume'}).ok,false);
 f.advance(40*86400000);const publicSettings=f.request({action:'dailyMotivationSettings'}).settings;
 setMotivationSettings(publicSettings);assert.match(quoteForDate(new Date('2026-12-27T12:00:00Z')).image,/keep-going/);
 assert.match(clientDailyMotivation(new Date('2026-12-27T12:00:00Z')).image,/keep-going/);assert.equal(f.emails.length,0);
});

test('freezing the current weekly message does not jump to a different daily item',()=>{
 const f=fixture(),before=quoteForDate(now),held=save(f,{mode:'hold'});assert.equal(held.ok,true,held.error);
 setMotivationSettings(held.settings);assert.equal(quoteForDate(new Date('2027-01-12T12:00:00Z')),before);
});

test('this-week selection expires at Monday midnight in Cairo and resume releases a permanent freeze',()=>{
 const f=fixture(),held=save(f,{mode:'week',selection:'daily-motivation-1'});assert.equal(held.settings.until,'2026-11-23');
 setMotivationSettings(held.settings);assert.match(quoteForDate(new Date('2026-11-22T21:59:59Z')).image,/motivation-1\.png$/);
 const monday=new Date('2026-11-22T22:00:00Z'),expired=quoteForDate(monday);
 setMotivationSettings(INITIAL_MOTIVATION_FREEZE);assert.equal(quoteForDate(monday),expired);
 const resumed=save(f,{mode:'resume',revision:held.settings.revision});assert.equal(resumed.ok,true,resumed.error);
 setMotivationSettings(resumed.settings);assert.equal(motivationSettings().frozen,false);assert.equal(quoteForDate(now).quote,'Keep going. You’re getting there.');
});

test('public refresh honours an instructor freeze, even for a message authored in an older week',async()=>{
 class FixedDate extends Date{constructor(...args){super(...(args.length?args:[now]));}}
 const settings={frozen:true,day:today,selection:'',until:'',revision:'new-instructor-choice',message:{date:'2026-10-24',quote:'My own message',reflection:'A reflection.',image:'https://example.test/picture.png'}};
 const doc={querySelector:()=>({elements:{endpoint:{defaultValue:'https://example.test/script'}}}),defaultView:{Date:FixedDate,location:{href:'https://speakboldly.space/#daily-quote'},AbortController,setTimeout,clearTimeout,fetch:async()=>({ok:true,json:async()=>({ok:true,settings})})}};
 await refreshMotivationSettings(doc,{force:true});assert.equal(motivationSettings().frozen,true);assert.equal(clientDailyMotivation(now).quote,'My own message');
 // The retired October date can be deliberately selected again with a new revision.
 setMotivationSettings({frozen:true,day:20750,until:'',revision:'deliberate-new-choice'});assert.equal(motivationSettings().frozen,true);
});

test('authored messages last through the week, freeze correctly, and explicit share dates survive another selection',()=>{
 const f=fixture();f.sheets.set('Motivation messages',{getLastRow:()=>3,getRange:()=>({getValues:()=>[
  ["'2026-11-16",'Monday message','Longer reflection.','https://example.test/monday.png',''],
  ["'2026-11-19",'Not published yet','Future reflection.','https://example.test/future.png','']
 ]})});
 assert.equal(f.request({action:'dailyMotivationSettings'}).settings.message.quote,'Monday message');
 const held=save(f,{mode:'hold'});assert.equal(held.settings.message.quote,'Monday message');
 f.advance(14*86400000);assert.equal(f.request({action:'dailyMotivationSettings'}).settings.message.quote,'Monday message');
 const changed=save(f,{day:today+14,revision:held.settings.revision,mode:'hold',selection});assert.equal(changed.ok,true,changed.error);assert.equal(changed.settings.message,null);
 const shared=f.request({action:'dailyMotivationSettings',date:'2026-11-16'}).settings;
 assert.equal(shared.message.quote,'Monday message');assert.equal(shared.selection,'');
 assert.equal(f.request({action:'dailyMotivationSettings',date:'2027-01-01'}).settings.message,null);
 const resumed=save(f,{day:today+14,revision:changed.settings.revision,mode:'resume'});assert.equal(resumed.settings.message,null);
});
