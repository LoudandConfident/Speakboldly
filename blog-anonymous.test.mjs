import test from 'node:test';
import assert from 'node:assert/strict';
import {webcrypto,createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {nextAnonymousIdentity,nicknameFromHash} from './blog-anonymous.js';
const values=new Map(),win={crypto:webcrypto,btoa:value=>Buffer.from(value,'binary').toString('base64'),localStorage:{getItem:key=>values.get(key)||null,setItem:(key,value)=>values.set(key,value)}};
test('article visits rotate through unused aliases and use server-compatible tokens',async()=>{const context=vm.createContext({});vm.runInContext(readFileSync(new URL('./google-sheets/clients/BlogComments.gs',import.meta.url),'utf8'),context);const names=new Set();for(let i=0;i<100;i++){const identity=await nextAnonymousIdentity(win);assert(!names.has(identity.name));names.add(identity.name);assert.match(identity.token,/^[a-zA-Z0-9-]{64,160}$/);const hash=createHash('sha256').update(identity.token).digest('base64url');assert.equal(identity.name,context.sbBlogCommentNickname(hash));assert.equal(identity.name,nicknameFromHash(hash));}assert.equal(names.size,100);});
test('anonymous history persists across a fresh visit',async()=>{const prior=JSON.parse(values.get('sb-blog-nickname-history-v2'));const identity=await nextAnonymousIdentity({...win});assert(!prior.includes(identity.name));});
