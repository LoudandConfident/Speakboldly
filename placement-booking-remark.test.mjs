import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {createPlacementBookingRemark,PLACEMENT_BOOKING_NOTE} from './placement-booking-remark.js';
import {createBookingNotice} from './booking-notice.js';
const el=tag=>({tag,children:[],dataset:{},textContent:'',append(...nodes){this.children.push(...nodes)},addEventListener(type,handler){this[type]=handler},closest(){return null}});
const calendar=el('section'),doc={createElement:el,createDocumentFragment:()=>el('fragment'),createTextNode:text=>({textContent:text,children:[]}),querySelector:()=>calendar};
const text=node=>node.textContent+node.children.map(text).join('');
test('both test results provide a placement booking remark and preselect the calendar appointment',()=>{
 const saved=new Map(),win={sessionStorage:{setItem:(key,value)=>saved.set(key,value)}};
 const section=createPlacementBookingRemark(doc,win),button=section.children[1];assert.equal(section.children[0].textContent,PLACEMENT_BOOKING_NOTE);assert.equal(button.href,'#students-portal/calendar');button.click();assert.equal(calendar.dataset.requestedBookingType,'placement');assert.equal(saved.get('speak-boldly-booking-type'),'placement');
 for(const path of ['placement-assessment.js','learner-profile.js'])assert(readFileSync(path,'utf8').includes('result.append(createPlacementBookingRemark('));
});
test('placement booking shows payment, approval and confirmation details without the removed assessment prerequisite',()=>{
 const notice=createBookingNotice(doc,'placement'),body=text(notice);assert(body.includes('placement test fees'));assert(body.includes('requested date and time'));assert(body.includes('accept or decline'));assert(body.includes('confirmation e-mail within 24 hours'));assert(!body.includes('both assessments'));assert(!body.includes('before enrolling'));assert(notice.children[0].children.some(n=>n.href==='mailto:billing@speakboldly.space'));
});
test('session and workshop bookings require placement first; trial remains free of payment instructions',()=>{
 for(const kind of ['session','workshop']){const body=text(createBookingNotice(doc,kind));assert(body.includes('complete an SB placement test before enrolling'));assert(body.includes('course fees'));assert(body.includes('24 hours'));}
 assert(!text(createBookingNotice(doc,'trial')).includes('payment'));
});
