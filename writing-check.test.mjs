import test from 'node:test';
import assert from 'node:assert/strict';
import {checkWriting} from './writing-check.js';
test('flags both missed screenshot mistakes with explanations',()=>{
 const result=checkWriting('Do you like fishes?\nI am writing to my tasks!');
 assert.equal(result.issues.length,2);
 assert.equal(result.suggestedText,'Do you like fish?\nI am doing my tasks!');
 assert(result.issues.every(i=>i.category==='Vocabulary'&&i.explanation));
});
test('checks grammar, vocabulary and punctuation together',()=>{
 const result=checkWriting('She are happy. I did a mistake. Do you like fish.');
 assert.deepEqual(new Set(result.issues.map(i=>i.category)),new Set(['Grammar','Vocabulary','Punctuation']));
 assert.equal(result.suggestedText,'She is happy. I made a mistake. Do you like fish?');
});
test('preserves legitimate fish plurals and writing recipients',()=>{
 for(const sentence of ['The fishes of the Atlantic are diverse.','I am writing to my teacher.','She likes fish.','He said that I made a mistake.'])assert.deepEqual(checkWriting(sentence).issues,[],sentence);
});
test('suggestions retain exact source offsets and can be checked again',()=>{
 const text='I enjoy to write. She has informations';const result=checkWriting(text);
 for(const issue of result.issues)assert.equal(text.slice(issue.start,issue.end),issue.original);
 assert.equal(result.suggestedText,'I enjoy writing. She has information.');
 assert.deepEqual(checkWriting(result.suggestedText).issues,[]);
});
