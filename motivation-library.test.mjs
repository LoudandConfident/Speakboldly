import test,{afterEach} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {additionalMotivations} from './motivation-library-additions.js';
import {dailyQuotes,quoteForDate,clientDailyMotivation,cairoDayNumber} from './home-gallery.js';
import {motivationPreviews} from './motivation-preview-images.js';
import {setMotivationSettings,INITIAL_MOTIVATION_FREEZE} from './motivation-settings.js';
import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
afterEach(()=>setMotivationSettings(INITIAL_MOTIVATION_FREEZE));
test('the new library contains exactly 41 complete messages and individual pictures',()=>{
 assert.deepEqual(additionalMotivations.map(e=>e.number),Array.from({length:41},(_,i)=>i+1));
 assert.equal(new Set(additionalMotivations.map(e=>e.id)).size,41);assert.equal(new Set(additionalMotivations.map(e=>e.image)).size,41);
 for(const entry of additionalMotivations){assert(entry.title&&entry.alt);assert(entry.paragraphs.length>=2);assert(entry.paragraphs.every(p=>typeof p==='string'&&p.trim()));assert(existsSync(new URL(entry.image,import.meta.url)));const picture=motivationPreviews[entry.image];assert(picture&&picture.bytes<=200000);assert(existsSync(new URL(picture.emailImage,import.meta.url)));}
 assert.equal(dailyQuotes.length,64);
});
test('the expanded weekly shuffle includes every new message once per complete cycle',()=>{
 setMotivationSettings(INITIAL_MOTIVATION_FREEZE);
 const available=dailyQuotes.filter(e=>!e.image.endsWith('small-steps-teacher.webp')&&!e.image.endsWith('math-teacher-board.webp'));
 const weeks=Array.from({length:available.length},(_,i)=>quoteForDate(new Date(Date.UTC(2026,10,23+7*i,12))));
 assert.equal(new Set(weeks).size,available.length);assert(weeks.every(e=>available.includes(e)));
 for(const entry of additionalMotivations)assert(weeks.some(e=>e.image===entry.image));
 assert(additionalMotivations.some(e=>e.image===weeks[0].image));assert.equal(quoteForDate(new Date('2026-11-17T12:00Z')).quote,'Keep going. You’re getting there.');
 assert.equal(quoteForDate(new Date('2026-11-23T12:00Z')),quoteForDate(new Date('2026-11-29T12:00Z')));
});
test('all new messages can be selected, frozen and passed to the existing email validator',()=>{
 const f=createSheetExamFixture();f.context.sbVerifiedFrom=()=> 'noreply@speakboldly.space';f.context.sbSendDomainEmail=message=>f.emails.push(message);
 for(const entry of additionalMotivations){setMotivationSettings({frozen:true,day:cairoDayNumber(new Date('2026-11-17T12:00Z')),selection:entry.id,revision:'new-choice',until:''});
  const message=clientDailyMotivation(new Date('2027-05-01T12:00Z'));assert.equal(message.quote,entry.title);assert.deepEqual(message.paragraphs,entry.paragraphs);
  assert.equal(readFileSync(new URL('.'+new URL(message.image).pathname,import.meta.url)).subarray(0,8).toString('hex'),'89504e470d0a1a0a');
  const result=f.request({action:'sendClientEmail',key:'private-test-key',clientId:'student-1',kind:'motivation',requestId:randomUUID(),motivation:message});assert.equal(result.ok,true,result.error);
 }
 assert.equal(f.emails.length,41);
});
