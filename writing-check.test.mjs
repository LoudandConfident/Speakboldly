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
test('capitalizes names, sentence beginnings and I including contractions',()=>{
 for(const [source,expected] of [
 ['my name is zain. i live in cairo! do you speak english?','My name is Zain. I live in Cairo! Do you speak English?'],
 ['I met ahmed and sarah.','I met Ahmed and Sarah.'],
 ["i’m happy! i like fish?", "I’m happy! I like fish?"],
 ['  “hello there!”\nwe are ready.', '  “Hello there!”\nWe are ready.'],
 ['i has a book.', 'I have a book.']
 ]){
 const result=checkWriting(source);assert.equal(result.suggestedText,expected,source);
 assert(result.issues.every(i=>i.explanation.length>20));
 assert.deepEqual(checkWriting(expected).issues,[],expected);
 }
});
test('accepts full stops, exclamation marks and question marks',()=>{
 for(const text of ['I like fish.','I like fish!','Do you like fish?']){
 assert.equal(checkWriting(text).sentenceCount,1);assert.deepEqual(checkWriting(text).issues,[]);
 }
});

test('checks common paragraph agreement, missing auxiliaries and verb patterns',()=>{
 const input='I goes to school. She happy. They is ready. We are study English. I want improve. He can went home.';
 assert.equal(checkWriting(input).suggestedText,'I go to school. She is happy. They are ready. We are studying English. I want to improve. He can go home.');
 for(const sentence of ['If I were ready, I would go.','I wish she were here.','They study English.','She is ready.'])assert.deepEqual(checkWriting(sentence).issues,[],sentence);
});
