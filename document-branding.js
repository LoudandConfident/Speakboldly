// One identity and placement for every generated document.
export const DOCUMENT_BRAND={
 founder:'Mira Nasser Louis',
 credentials:"English Language Coaching\n© 2026 Founded by Mira Nasser Louis.",
 logo:'./document-templates/sb-policy-logo.png',
 left:44,top:42,logoSize:44,footerY:34,footerSize:7.5,footerLineHeight:10
};
export async function drawDocumentBranding(pdf,{font,logoBytes,logo,light=false}){
 const {rgb}=await import('./vendor/pdf-lib.esm.min.js');
 const mark=logo||await pdf.embedPng(logoBytes),ink=light?rgb(1,1,1):rgb(25/255,60/255,50/255);
 pdf.getPages().forEach((page,index)=>{
  const {width,height}=page.getSize();
  page.drawImage(mark,{x:DOCUMENT_BRAND.left,y:height-DOCUMENT_BRAND.top-DOCUMENT_BRAND.logoSize,width:DOCUMENT_BRAND.logoSize,height:DOCUMENT_BRAND.logoSize});
  page.drawText(DOCUMENT_BRAND.credentials,{x:DOCUMENT_BRAND.left,y:DOCUMENT_BRAND.footerY,font,size:DOCUMENT_BRAND.footerSize,lineHeight:DOCUMENT_BRAND.footerLineHeight,color:ink});
  const number=(index+1)+' / '+pdf.getPageCount();page.drawText(number,{x:width-DOCUMENT_BRAND.left-font.widthOfTextAtSize(number,DOCUMENT_BRAND.footerSize),y:DOCUMENT_BRAND.footerY,font,size:DOCUMENT_BRAND.footerSize,lineHeight:DOCUMENT_BRAND.footerLineHeight,color:ink});
 });
 pdf.setAuthor(DOCUMENT_BRAND.founder);pdf.setCreator('Speak Boldly');
}
