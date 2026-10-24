import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeClientNotes} from './client-notes.js';
import {PDFDocument} from './vendor/pdf-lib.esm.min.js';
function editorFixture(){
 const node=()=>({setAttribute(){},focus(){},addEventListener(){},textContent:''});
 const area=node(),label={firstChild:{textContent:''}};area.closest=()=>label;
 const send=node(),download=node(),downloadPdf=node(),status=node(),heading=node(),close=node(),recipient=node();
 const form={elements:{notes:area},reportValidity:()=>true,reset(){area.value='';},querySelector:selector=>selector==='[type=submit]'?send:selector==='[data-download-notes]'?download:downloadPdf};
 const dialog={...node(),querySelector:selector=>({'form':form,'h2':heading,'textarea':area,'.popup-close':close,'button[type=submit]':send,'[role=status]':status,'[data-notes-recipient]':recipient}[selector])};
 const blobs=[],links=[],requests=[];
 const doc={baseURI:import.meta.url,body:{append(){}},addEventListener(){},createElement(tag){if(tag==='section')return dialog;const link={click(){},remove(){}};links.push(link);return link;},defaultView:{location:{},URL:{createObjectURL(blob){blobs.push(blob);return 'blob:test';},revokeObjectURL(){}},setTimeout(){},addEventListener(){},fetch:async url=>{requests.push(url);const bytes=await readFile(new URL(url,import.meta.url));return{ok:true,arrayBuffer:async()=>bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength)};}}};
 return{doc,area,heading,recipient,status,download,downloadPdf,blobs,links,requests};
}
test('Action plan editor selects the right client and reuses PDF assets until content changes',async()=>{
 const f=editorFixture(),editor=initializeClientNotes(f.doc,()=>true,{pageMode:true,documentKind:'actionplan'});
 editor.open({id:'client-1',name:'Sara',email:'sara@example.com',level:'3'});
 assert.equal(f.heading.textContent,'Action plan');assert.match(f.recipient.textContent,/Sara · sara@example.com/);assert.match(f.area.value,/Goals/);
 f.area.value='Practise speaking for ten minutes every day.';
 await f.downloadPdf.onclick();assert.equal(f.requests.length,2);assert.match(f.links.at(-1).download,/Action plan/);
 const first=Buffer.from(await f.blobs.at(-1).arrayBuffer());assert.equal((await PDFDocument.load(first)).getTitle(),'Sara — Action plan');
 await f.downloadPdf.onclick();assert.equal(f.requests.length,2);assert.deepEqual(Buffer.from(await f.blobs.at(-1).arrayBuffer()),first);
 f.area.value='New goal: practise listening.';await f.downloadPdf.onclick();assert.equal(f.requests.length,2);assert.notDeepEqual(Buffer.from(await f.blobs.at(-1).arrayBuffer()),first);
 await f.download.onclick();assert.match(f.links.at(-1).download,/Action plan.*\.docx$/);
 editor.lock();assert.equal(f.area.value,'');
});
