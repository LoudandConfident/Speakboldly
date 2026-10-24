import {DOCUMENT_BRAND,drawDocumentBranding} from './document-branding.js?v=signature-mira-nasser';
import {documentDate} from './student-document-filenames.js';
export async function buildClientNotesPdf(client,notes,{fontBytes,logoBytes,date=documentDate(),title='Notes'}={}){
 const {PDFDocument,rgb}=await import('./vendor/pdf-lib.esm.min.js');const {default:fontkit}=await import('./vendor/fontkit.es.min.js');
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(fontBytes,{subset:true}),logo=await pdf.embedPng(logoBytes);pdf.setAuthor(DOCUMENT_BRAND.founder);pdf.setTitle(client.name+' — '+title);pdf.setCreator('Speak Boldly');
 const width=595.28,height=841.89,left=DOCUMENT_BRAND.left,maxWidth=width-88,ink=rgb(.98,.976,.957);let page,y;
 const newPage=()=>{page=pdf.addPage([width,height]);page.drawRectangle({x:0,y:0,width,height,color:rgb(.098,.235,.196)});y=height-124;};newPage();
 function line(text,size=11){if(y<106)newPage();page.drawText(text,{x:left,y,font,size,color:ink});y-=size*1.6;}
 function paragraph(value,size=11){
 const text=String(value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').replace(/\t/g,'    ');
 for(const raw of text.split(/\r?\n/)){if(!raw){line('',size);continue;}let current='';
 for(const word of raw.split(/\s+/)){const proposed=current?current+' '+word:word;if(font.widthOfTextAtSize(proposed,size)<=maxWidth){current=proposed;continue;}if(current){line(current,size);current='';}for(const char of word){if(current&&font.widthOfTextAtSize(current+char,size)>maxWidth){line(current,size);current='';}current+=char;}}
 if(current)line(current,size);
 }
 }
 paragraph('Speak Boldly — '+title,19);y-=8;paragraph(client.name,13);if(client.program)paragraph('Program: '+client.program);if(client.level)paragraph('Level: '+client.level);paragraph('Date: '+date);y-=18;paragraph(notes);
 await drawDocumentBranding(pdf,{font,logo,light:true});
 return pdf.save();
}
