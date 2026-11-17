export async function appendTaskPages(pdf,attachments,{font,rgb,client,newPage,answerPages=true}){
 if(!attachments.length)return;
 const {PDFDocument}=await import('./vendor/pdf-lib.esm.min.js');let totalPages=0;const ink=rgb(.098,.235,.196),width=595.28,height=841.89,left=44;
 const heading=(page,title,name)=>{page.drawText(title,{x:left,y:height-124,font,size:16,color:ink});let label=String(name).replace(/[\u0000-\u001f\u007f]/g,' ');while(label&&font.widthOfTextAtSize(label,10)>width-88)label=label.slice(0,-1);page.drawText(label,{x:left,y:height-149,font,size:10,color:ink});};
 for(const [index,file]of attachments.entries()){
  const answer=pdf.getForm().createTextField('task_'+(index+1)+'_answers');answer.enableMultiline();answer.setMaxLength(6000);answer.setText(String(file.comments||'').slice(0,6000));
  const addAnswerBox=(page,rect)=>answer.addToPage(page,{...rect,font,borderWidth:1,borderColor:rgb(.53,.65,.45),backgroundColor:rgb(.96,.98,.93),textColor:ink});
  const bytes=file.bytes instanceof Uint8Array?file.bytes:new Uint8Array(file.bytes);let embedded;
  try{if(file.type==='application/pdf'){const source=await PDFDocument.load(bytes);if(source.isEncrypted)throw new Error('Password-protected PDFs are not supported.');if(source.getPageCount()>30-totalPages)throw new Error('Keep attached tasks within 30 pages.');source.getForm().flatten();embedded=await pdf.embedPages(source.getPages());}else{embedded=[file.type==='image/png'?await pdf.embedPng(bytes):await pdf.embedJpg(bytes)];}}catch(error){throw new Error('Could not open '+file.name+'. '+(error.message.includes('30 pages')?error.message:'Use an unlocked PDF, JPG or PNG file.'));}
  totalPages+=embedded.length;if(totalPages>30)throw new Error('Keep attached tasks within 30 pages.');
  for(const [part,item]of embedded.entries()){const page=newPage();heading(page,'Task '+(index+1)+(embedded.length>1?' · Page '+(part+1):''),file.name);const scale=Math.min((width-88)/item.width,(height-320)/item.height),w=item.width*scale,h=item.height*scale,x=(width-w)/2,y=150+(height-320-h)/2;if(file.type==='application/pdf')page.drawPage(item,{x,y,width:w,height:h});else page.drawImage(item,{x,y,width:w,height:h});page.drawText('Answers / comments — click or tap the box to write',{x:left,y:132,font,size:9,color:ink});addAnswerBox(page,{x:left,y:72,width:width-88,height:52});}
  if(answerPages){const page=newPage();heading(page,'Your answers · Task '+(index+1),client.name+(client.sessionNumber?' · Session '+client.sessionNumber:'')+' · '+file.name);page.drawText('Click or tap the answer box to type. Save this PDF before sending it back.',{x:left,y:height-176,font,size:10,color:ink});page.drawText('If your preview is read-only, download it and open it in a PDF reader.',{x:left,y:height-193,font,size:9,color:ink});addAnswerBox(page,{x:left,y:90,width:width-88,height:height-302});}
  answer.setFontSize(11);
 }
 pdf.getForm().updateFieldAppearances(font);
}
