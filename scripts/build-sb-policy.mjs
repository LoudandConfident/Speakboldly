import {DOCUMENT_BRAND,drawDocumentBranding} from '../document-branding.js';
import {readFileSync,writeFileSync} from 'node:fs';
import {PDFDocument,rgb,PDFName,PDFString,StandardFonts} from '../vendor/pdf-lib.esm.min.js';
import fontkit from '../vendor/fontkit.es.min.js';
const root=new URL('../',import.meta.url),policy=JSON.parse(readFileSync(new URL('content/sb-policy.json',root)));
const pdf=await PDFDocument.create();pdf.registerFontkit(fontkit);
const regular=await pdf.embedFont(readFileSync(new URL('document-templates/DejaVuSans.ttf',root)),{subset:true});
const bold=await pdf.embedFont(StandardFonts.HelveticaBold);
const logo=await pdf.embedPng(readFileSync(new URL('document-templates/sb-policy-logo.png',root)));
const green=rgb(25/255,60/255,50/255),cream=rgb(1,1,1),lime=rgb(213/255,237/255,152/255),muted=rgb(.36,.43,.39);
const page=pdf.addPage([595.28,841.89]),width=595.28,left=44,right=551.28;
page.drawRectangle({x:0,y:0,width,height:841.89,color:cream});
// Editorial header: website typography, restrained lime accent and a light clock drawing.

page.drawText('Speak Boldly',{x:106,y:774,size:27,font:bold,color:green});
page.drawText(policy.title,{x:106,y:743,size:23,font:regular,color:green});
page.drawText(policy.subtitle,{x:left,y:713,size:11,font:regular,color:muted});
page.drawCircle({x:493,y:756,size:29,borderColor:green,borderWidth:.8});
page.drawLine({start:{x:493,y:756},end:{x:493,y:774},color:green,thickness:1.3});
page.drawLine({start:{x:493,y:756},end:{x:507,y:748},color:green,thickness:1.3});
page.drawCircle({x:493,y:756,size:2,color:green});
page.drawLine({start:{x:left,y:689},end:{x:right,y:689},color:rgb(.79,.83,.78),thickness:.5});
let y=661;
function wrap(text,font,size,maxWidth){let lines=[],line='';for(const word of text.split(/\s+/)){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)>maxWidth&&line){lines.push(line);line=word;}else line=next;}if(line)lines.push(line);return lines;}
for(const [index,section] of policy.sections.entries()){
 page.drawEllipse({x:left+10,y:y+3,xScale:13,yScale:9,color:lime});
 page.drawText(String(index+1).padStart(2,'0'),{x:left+4,y:y-.3,size:8,font:bold,color:green});
 page.drawText(section.title,{x:left+28,y,size:12,font:bold,color:green});y-=22;
 for(const line of wrap(section.text,regular,10.5,right-left-28)){page.drawText(line,{x:left+28,y,size:10.5,font:regular,color:green});y-=16.5;}
 y-=12;
 if(index<policy.sections.length-1){page.drawLine({start:{x:left+28,y:y+1},end:{x:right,y:y+1},color:rgb(.87,.89,.86),thickness:.4});y-=18;}
}
if(y<153)throw Error('Policy content exceeds one-page layout; shorten the copy.');
const closingLines=wrap(policy.closing,regular,9.5,right-left-30),bandHeight=closingLines.length*15+22;
page.drawRectangle({x:left,y:y-bandHeight+10,width:right-left,height:bandHeight,color:rgb(.95,.97,.92)});
let closingY=y-6;for(const line of closingLines){page.drawText(line,{x:left+15,y:closingY,size:9.5,font:regular,color:green});closingY-=15;}
page.drawLine({start:{x:left,y:79},end:{x:right,y:79},color:muted,thickness:.5});
page.drawText(policy.email,{x:left,y:59,size:9,font:regular,color:green});page.drawText(policy.phone,{x:right-90,y:59,size:9,font:regular,color:green});


function link(rect,uri){const ref=pdf.context.register(pdf.context.obj({Type:PDFName.of('Annot'),Subtype:PDFName.of('Link'),Rect:rect,Border:[0,0,0],A:{Type:PDFName.of('Action'),S:PDFName.of('URI'),URI:PDFString.of(uri)}}));page.node.addAnnot(ref);}
link([left,56,left+215,70],'mailto:'+policy.email);link([right-94,56,right,70],'tel:+201283786904');
pdf.setTitle('SB Policy — Speak Boldly');pdf.setAuthor(DOCUMENT_BRAND.founder);pdf.setCreator('Speak Boldly');pdf.setSubject('Registration, payment, cancellations, rescheduling and attendance');
await drawDocumentBranding(pdf,{font:regular,logo});
writeFileSync(new URL('brochures/SB-Policy.pdf',root),await pdf.save());console.log('Created one-page SB Policy PDF.');
