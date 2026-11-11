import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {getDocument,OPS} from 'pdfjs-dist/legacy/build/pdf.mjs';
import {buildClientNotesPdf} from './notes-pdf.js';

test('session-note PDF preserves bold, underlined headings and selected highlights across page breaks',async()=>{
 const runs=[{text:'◇ Grammar:\n',bold:true,underline:true},{text:'Keep this expression',bold:true,highlight:true},{text:' and this ordinary text.\n\n'},...Array.from({length:80},(_,i)=>({text:'More practice '+i+'\n',highlight:i===79}))];
 const bytes=await buildClientNotesPdf({name:'Monica Example',sessionNumber:3},'Hi Monica!\n\n'+runs.map(r=>r.text).join(''),{title:'Session notes',richRuns:runs,fontBytes:readFileSync('document-templates/DejaVuSans.ttf'),boldFontBytes:readFileSync('document-templates/DejaVuSans-Bold.ttf'),logoBytes:readFileSync('document-templates/sb-policy-logo.png')});
 const pdf=await getDocument({data:bytes}).promise;assert(pdf.numPages>1);
 const first=await pdf.getPage(1),text=await first.getTextContent(),items=text.items.filter(x=>x.str);
 assert(items.some(x=>x.str==='Hi Monica!'));
 const heading=items.find(x=>x.str.includes('Grammar:')),ordinary=items.find(x=>x.str.includes('ordinary text.'));
 assert(heading&&ordinary);assert.notEqual(heading.fontName,ordinary.fontName);
 const operations=await first.getOperatorList();assert(operations.fnArray.some((op,index)=>op===OPS.constructPath&&operations.argsArray[index][0]===OPS.stroke),'heading underline must be drawn');
 assert(operations.fnArray.some((op,index)=>op===OPS.setFillRGBColor&&operations.argsArray[index][0]==='#e5ef9d'),'selected text must receive the green highlight');
 const last=await(await pdf.getPage(pdf.numPages)).getTextContent();assert(last.items.some(x=>x.str.includes('79')));
});
