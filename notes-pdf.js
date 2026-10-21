import {documentDate} from './student-document-filenames.js';
export async function buildClientNotesPdf(client,notes,{fontBytes,logoBytes,date=documentDate(),title='Notes'}={}){
 const {PDFDocument,rgb}=await import('./vendor/pdf-lib.esm.min.js');const {default:fontkit}=await import('./vendor/fontkit.es.min.js');
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(fontBytes,{subset:true}),logo=await pdf.embedPng(logoBytes);pdf.setAuthor('Mira Nasser Louis');pdf.setTitle(client.name+' — '+title);pdf.setCreator('Speak Boldly');
 const width=595.28,height=841.89,left=48,maxWidth=width-96,ink=rgb(.98,.976,.957);let page,y;
 const newPage=()=>{page=pdf.addPage([width,height]);page.drawRectangle({x:0,y:0,width,height,color:rgb(.098,.235,.196)});y=height-52;};newPage();
 function line(text,size=11){if(y<106)newPage();page.drawText(text,{x:left,y,font,size,color:ink});y-=size*1.6;}
 function paragraph(value,size=11){
 const text=String(value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').replace(/\t/g,'    ');
 for(const raw of text.split(/\r?\n/)){if(!raw){line('',size);continue;}let current='';
 for(const word of raw.split(/\s+/)){const proposed=current?current+' '+word:word;if(font.widthOfTextAtSize(proposed,size)<=maxWidth){current=proposed;continue;}if(current){line(current,size);current='';}for(const char of word){if(current&&font.widthOfTextAtSize(current+char,size)>maxWidth){line(current,size);current='';}current+=char;}}
 if(current)line(current,size);
 }
 }
 paragraph('Speak Boldly — '+title,19);y-=8;paragraph(client.name,13);if(client.program)paragraph('Program: '+client.program);if(client.level)paragraph('Level: '+client.level);paragraph('Date: '+date);y-=18;paragraph(notes);
 const pages=pdf.getPages();pages.forEach((p,index)=>{p.drawLine({start:{x:left,y:84},end:{x:width-left,y:84},thickness:.5,color:rgb(.8,.83,.78)});p.drawRectangle({x:width/2-24,y:27,width:48,height:48,color:rgb(.98,.976,.957)});p.drawImage(logo,{x:width/2-22,y:29,width:44,height:44});p.drawText('Prepared by Mira Nasser Louis',{x:left,y:52,size:8,font,color:ink});p.drawText((index+1)+' / '+pages.length,{x:width-left-32,y:52,size:8,font,color:ink});});
 return pdf.save();
}
