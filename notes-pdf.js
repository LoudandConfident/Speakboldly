import {appendTaskPages} from './notes-task-pdf.js?v=white-notes-2';
import {DOCUMENT_BRAND,drawDocumentBranding} from './document-branding.js?v=two-line-footer-1';
import {documentDate} from './student-document-filenames.js';
export async function buildClientNotesPdf(client,notes,{fontBytes,logoBytes,date=documentDate(),title='Notes',taskAttachments=[],answerPages=true,welcomeText='',welcomeImages=[]}={}){
 const {PDFDocument,rgb}=await import('./vendor/pdf-lib.esm.min.js');const {default:fontkit}=await import('./vendor/fontkit.es.min.js');
 const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);const font=await pdf.embedFont(fontBytes,{subset:true}),logo=await pdf.embedPng(logoBytes);pdf.setAuthor(DOCUMENT_BRAND.founder);pdf.setTitle(client.name+' — '+title+(client.sessionNumber?' — Session '+client.sessionNumber:''));pdf.setCreator('Speak Boldly');
 const width=595.28,height=841.89,left=DOCUMENT_BRAND.left,maxWidth=width-88,ink=rgb(.098,.235,.196);let page,y;
 const backgroundImages=await Promise.all(welcomeImages.map(async illustration=>{if(!['image/png','image/jpeg'].includes(illustration.type))throw Error('Use JPG or PNG background illustrations.');return illustration.type==='image/png'?pdf.embedPng(illustration.bytes):pdf.embedJpg(illustration.bytes);}));
 const drawBackground=()=>{
  if(title==='Action plan')return;
  if(backgroundImages.length){const image=backgroundImages[(pdf.getPageCount()-1)%backgroundImages.length],scale=Math.min(210/image.width,250/image.height);page.drawImage(image,{x:width-210,y:height-470,width:image.width*scale,height:image.height*scale,opacity:.08});return;}
  const pale=rgb(.88,.915,.875),art=(path,x,y)=>page.drawSvgPath(path,{x,y:height-y,borderColor:pale,borderWidth:2});
  art('M0 12Q22 1 44 12Q66 1 88 12V76Q66 65 44 76Q22 65 0 76ZM44 12V76M9 27Q21 22 34 27M54 27Q67 22 79 27M9 42Q21 37 34 42M54 42Q67 37 79 42',488,120);
  art('M5 16H96V43H5Q-7 30 5 16ZM5 43H96M15 24H77M15 34H65M17 51H110V77H17Q5 64 17 51ZM17 77H110M27 60H94M27 69H76M2 86H91V109H2Q-9 97 2 86ZM2 109H91',-35,544);
  art('M10 0H28V96L19 115L10 96ZM10 14H28M10 87H28M19 16V84M15 104H23',544,665);
  art('M0 0H86Q100 0 100 14V55Q100 69 86 69H52L31 88V69H0Q-13 69-13 55V14Q-13 0 0 0ZM12 22H74M12 39H60',-48,291);
 };
 const newPage=()=>{page=pdf.addPage([width,height]);page.drawRectangle({x:0,y:0,width,height,color:rgb(1,1,1)});drawBackground();y=height-124;};newPage();
 function line(text,size=11){if(y<106)newPage();page.drawText(text,{x:left,y,font,size,color:ink});y-=size*1.6;}
 function paragraph(value,size=11){
 const text=String(value||'').replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').replace(/\t/g,'    ');
 for(const raw of text.split(/\r?\n/)){if(raw.trim().endsWith(':')&&raw.trim().length<90){if(y<150)newPage();y-=10;page.drawLine({start:{x:left,y:y+17},end:{x:width-left,y:y+17},thickness:.6,color:rgb(.78,.82,.77)});line(raw.trim().replace(/:$/,''),13);y-=4;continue;}if(!raw){line('',size);continue;}let current='';
 for(const word of raw.split(/\s+/)){const proposed=current?current+' '+word:word;if(font.widthOfTextAtSize(proposed,size)<=maxWidth){current=proposed;continue;}if(current){line(current,size);current='';}for(const char of word){if(current&&font.widthOfTextAtSize(current+char,size)>maxWidth){line(current,size);current='';}current+=char;}}
 if(current)line(current,size);
 }
 }
 paragraph('Speak Boldly — '+title,19);y-=8;paragraph(client.name,13);if(client.program)paragraph('Program: '+client.program);if(client.level)paragraph('Level: '+client.level);if(client.sessionNumber)paragraph('Session: '+client.sessionNumber);paragraph('Date: '+date);y-=18;
 if(welcomeText){paragraph('Welcome to the session',16);y-=6;paragraph(welcomeText);y-=14;if(y<160)newPage();paragraph('Session notes',16);y-=6;}paragraph(notes);
 await appendTaskPages(pdf,taskAttachments,{font,rgb,client,newPage:()=>{newPage();return page;},answerPages});
 await drawDocumentBranding(pdf,{font,logo,light:false});
 return pdf.save();
}
