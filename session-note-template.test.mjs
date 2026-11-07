import test from 'node:test';
import assert from 'node:assert/strict';
import {SESSION_NOTES_TEMPLATE,sessionNotesHaveContent} from './client-notes.js';
test('prefilled headings do not count as written notes, while practice in any section does',()=>{
 assert.equal(sessionNotesHaveContent(SESSION_NOTES_TEMPLATE),false);
 assert.equal(sessionNotesHaveContent(' \n\t'),false);
 for(const heading of SESSION_NOTES_TEMPLATE.split('\n').filter(Boolean)){
  assert.equal(sessionNotesHaveContent(SESSION_NOTES_TEMPLATE.replace(heading,heading+'\nA useful example from class.')),true);
 }
});
