import {test} from 'node:test';import assert from 'node:assert/strict';import {learningDocumentEmbed} from './learning-document-viewer.js';
test('Drive documents use an embedded preview and preserve resource keys',()=>{
 assert.deepEqual(learningDocumentEmbed('https://drive.google.com/file/d/abc_123/view?resourcekey=secret-key','https://example.test/'),{kind:'frame',url:'https://drive.google.com/file/d/abc_123/preview?resourcekey=secret-key'});
 assert.equal(learningDocumentEmbed('https://drive.google.com/open?id=abc_123','https://example.test/').url,'https://drive.google.com/file/d/abc_123/preview');
});
test('Google documents embed without edit links, media use native viewers and unsafe URLs fail',()=>{
 assert.equal(learningDocumentEmbed('https://docs.google.com/document/d/abc/edit','https://example.test/').url,'https://docs.google.com/document/d/abc/preview');
 assert.equal(learningDocumentEmbed('https://docs.google.com/presentation/d/abc/edit','https://example.test/').url,'https://docs.google.com/presentation/d/abc/embed');
 assert.equal(learningDocumentEmbed('/material/page.webp','https://example.test/').kind,'image');
 assert.equal(learningDocumentEmbed('/material/listening.mp3','https://example.test/').kind,'audio');
 assert.throws(()=>learningDocumentEmbed('javascript:alert(1)','https://example.test/'));
 assert.throws(()=>learningDocumentEmbed('https://drive.google.com/drive/folders/abc','https://example.test/'));
});
