import {readFileSync,writeFileSync} from 'node:fs';
import {PDFDocument,rgb,PDFName,PDFString,StandardFonts} from '../vendor/pdf-lib.esm.min.js';
import fontkit from '../vendor/fontkit.es.min.js';
const root=new URL('../',import.meta.url),policy=JSON.parse(readFileSync(new URL('content/sb-policy.json',root)));
const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
const regular=await pdf.embedFont(readFileSync(new URL('document-templates/DejaVuSans.ttf',root)),{subset:true});
const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
const logo=await pdf.embedPng(readFileSync(new URL('document-templates/sb-policy-logo.png',root)));
const green=rgb(25/255,60/255,50/255),cream=rgb(250/255,249/255,244/255),lime=rgb(213/255,237/255,152/255),muted=rgb(.77,.83,.78);
const page=pdf.addPage([595.28,841.89]),width=595.28,left=44,right=551.28;
page.drawRectangle({x:0,y:0,width,height:841.89,color:green});
page.drawRectangle({x:left,y:748,width:52,height:52,color:cream});page.drawImage(logo,{x:left+3,y:751,width:46,height:46});
page.drawText('SPEAK BOLDLY',{x:112,y:785,size:9,font:bold,color:lime});page.drawText(policy.title,{x:112,y:752,size:29,font:bold,color:cream});
page.drawText(policy.subtitle,{x:left,y:717,size:11,font:regular,color:muted});page.drawLine({start:{x:left,y:698},end:{x:right,y:698},color:muted,thickness:.5});
let y=672;
function wrap(text,font,size,maxWidth){let lines=[],line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
for(const [index,section] of policy.sections.entries()){
 page.drawText(String(index+1).padStart(2,'0'),{x:left,y,size:10,font:bold,color:lime});page.drawText(section.title,{x:left+28,y,size:12,font:bold,color:cream});y-=22;
 for(const line of wrap(section.text,regular,10,right-left-28)){page.drawText(line,{x:left+28,y,size:10,font:regular,color:cream});y-=15;}
 y-=18;
}
if(y<122)throw Error('Policy content exceeds one-page layout; shorten the copy.');
for(const line of wrap(policy.closing,regular,9,right-left)){page.drawText(line,{x:left,y,size:9,font:regular,color:muted});y-=14;}
page.drawLine({start:{x:left,y:79},end:{x:right,y:79},color:muted,thickness:.5});
page.drawText(policy.email,{x:left,y:59,size:9,font:regular,color:cream});page.drawText(policy.phone,{x:right-90,y:59,size:9,font:regular,color:cream});
page.drawText('Speak Boldly · English Language Coaching',{x:left,y:36,size:8,font:regular,color:muted});
page.drawText('1 / 1',{x:right-22,y:36,size:8,font:regular,color:muted});
function link(rect,uri){const ref=pdf.context.register(pdf.context.obj({Type:PDFName.of('Annot'),Subtype:PDFName.of('Link'),Rect:rect,Border:[0,0,0],A:{Type:PDFName.of('Action'),S:PDFName.of('URI'),URI:PDFString.of(uri)}}));page.node.addAnnot(ref);}
link([left,56,left+215,70],'mailto:'+policy.email);link([right-94,56,right,70],'tel:+201283786904');
pdf.setTitle('SB Policy — Speak Boldly');pdf.setAuthor('Mira Nasser Louis');pdf.setCreator('Speak Boldly');pdf.setSubject('Registration, payment, cancellations, rescheduling and attendance');
writeFileSync(new URL('brochures/SB-Policy.pdf',root),await pdf.save());console.log('Created one-page SB Policy PDF.');
