import test from 'node:test';import assert from 'node:assert/strict';import {isLoadingMessage} from './loading-ui.js';
test('loading states use spinners while errors and content remain readable',()=>{
 for(const text of ['Loading…','Loading page 2…','Connecting your calendar…','Opening report…'])assert.equal(isLoadingMessage(text),true,text);
 for(const text of ['Loading took too long. Please try again.','Could not load files.','Loading takes time. Each conversation gives you more practice.','Saved.','Your message has been sent.'])assert.equal(isLoadingMessage(text),false,text);
});
