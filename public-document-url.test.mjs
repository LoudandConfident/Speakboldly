import test from 'node:test';import assert from 'node:assert/strict';import {publicDocumentUrl} from './public-document-url.js';import {filePermission,canOpenFile} from './portal-access.js';
test('old public document URLs display on custom domain without changing the saved grant',()=>{
 const old='https://loudandconfident.github.io/Speakboldly/student-files/material/B-Level-2-Book.pdf?v=1#page=3';
 assert.equal(publicDocumentUrl(old,'https://speakboldly.space/').href,'https://speakboldly.space/student-files/material/B-Level-2-Book.pdf?v=1#page=3');
 assert.equal(publicDocumentUrl(old,'https://loudandconfident.github.io/Speakboldly/').href,old);
 const access={permissions:['section:material',filePermission('material',old)]};assert(canOpenFile(access,'material',old));
});
test('private and third-party document URLs remain untouched',()=>{
 for(const url of ['https://drive.google.com/file/d/example/preview','https://example.com/api/files/private','https://docs.google.com/document/d/example/preview'])assert.equal(publicDocumentUrl(url,'https://speakboldly.space/').href,url);
 assert.equal(publicDocumentUrl('./brochures/SB-Policy.pdf','https://speakboldly.space/').href,'https://speakboldly.space/brochures/SB-Policy.pdf');
});
