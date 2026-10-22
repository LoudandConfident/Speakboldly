import test from 'node:test';import assert from 'node:assert/strict';import {createSheetExamFixture} from './sheet-exam-fixture.mjs';
const key='private-test-key';
test('only instructor can save; public readers see published articles when due, with 1–5 pages',()=>{
 const f=createSheetExamFixture();f.advance(Date.parse('2026-10-25T12:00Z')-f.context.Date.now());
 const data={action:'saveBoldlyNote',title:'Learning through mistakes',topic:'Learning',date:'2026-10-25',pages:['Try a small task.','Review one mistake.'],published:false};
 assert.equal(f.request(data).ok,false);
 let saved=f.request({...data,key});assert.equal(saved.ok,true,saved.error);const id=saved.post.id;
 assert.equal(f.request({action:'boldlyNotes'}).posts.length,0);assert.equal(f.request({action:'boldlyNotes',id}).ok,false);
 saved=f.request({...data,key,id,published:true});assert.equal(saved.ok,true,saved.error);
 const list=f.request({action:'boldlyNotes'});assert.equal(list.posts.length,1);assert.equal(list.posts[0].pageCount,2);assert.equal(list.posts[0].pages,undefined);
 assert.equal(f.request({action:'boldlyNotes',id}).post.pages[1],data.pages[1]);
 assert.equal(f.request({...data,key,id,published:true,date:'2026-10-26'}).ok,true);assert.equal(f.request({action:'boldlyNotes'}).posts.length,0);
 assert.equal(f.request({...data,key,id,pages:[]}).ok,false);assert.equal(f.request({...data,key,id,pages:Array(6).fill('A page')}).ok,false);assert.equal(f.request({...data,key,id,pages:['x'.repeat(6001)]}).ok,false);assert.equal(f.request({...data,key,id,date:'2026-02-31'}).ok,false);
 assert.equal(f.request({...data,key,id,pages:Array(5).fill('A full page'),published:true}).ok,true);assert.equal(f.request({action:'boldlyNotes',id}).post.pages.length,5);
 assert.equal(f.request({...data,key,id,published:false}).ok,true);assert.equal(f.request({action:'boldlyNotes',id}).ok,false);
});
