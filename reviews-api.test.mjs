import test from 'node:test';
import assert from 'node:assert/strict';
import {reviewRequest,REVIEWS_ENDPOINT} from './reviews-api.js';

test('Google reviews list and submission use public endpoint without credentials or preflight', async()=>{
 const calls = [];
 const fetcher = async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>options.method === 'GET' ? {ok:true,reviews:[]} : {ok:true,review:{id:'review-1',message:'A useful course.'}}};};
 assert.deepEqual(await reviewRequest('reviews',{},fetcher),{ok:true,reviews:[]});
 const data = {submissionId:'same-id-on-retry',message:'A useful course.'};
 await reviewRequest('reviews',{method:'POST',data},fetcher);
 assert.equal(calls[0].url,REVIEWS_ENDPOINT);
 assert.equal(calls[1].options.credentials,'omit');
 assert.equal(calls[1].options.headers['Content-Type'],'text/plain;charset=UTF-8');
 assert.deepEqual(JSON.parse(calls[1].options.body),data);
 assert.equal(calls[1].options.redirect,'follow');
});

test('Google application errors and HTML authorization pages never count as published', async()=>{
 await assert.rejects(reviewRequest('reviews',{method:'POST',data:{}},async()=>({ok:true,json:async()=>({ok:false,error:'Please check your review details.'})})),/check your review/);
 await assert.rejects(reviewRequest('reviews',{},async()=>({ok:true,json:async()=>{throw new SyntaxError();}})),/unavailable/);
 await assert.rejects(reviewRequest('reviews',{method:'POST',data:{}},async()=>({ok:true,json:async()=>({ok:true})})),/confirmed/);
});
