// Reads private Drive bytes through the existing password-checked Apps Script endpoint.
export async function readDriveFolderFile(call,item,{valid=()=>true,progress=()=>{}}={}){
 const parts=[];let offset=0,revision='',size=null,mime='';
 while(true){
  if(!valid())return null;
  const part=await call('driveFolderRead',{itemId:item.id,offset,...(revision?{revision}:{})});
  if(!valid())return null;
  if(!Number.isSafeInteger(part.size)||part.size<1||part.size>100000000||part.offset!==offset||!Number.isSafeInteger(part.nextOffset)||part.nextOffset<=offset||part.nextOffset>part.size||typeof part.base64!=='string'||!part.revision||typeof part.done!=='boolean')throw Error('The file response was incomplete. Please reopen it.');
  if(size!==null&&(size!==part.size||revision!==part.revision||mime!==part.mimeType))throw Error('The file changed while loading. Please reopen it.');
  size=part.size;revision=part.revision;mime=part.mimeType;
  if(!/^(application\/pdf|image\/(png|jpeg|webp|gif)|audio\/[\w.+-]+|video\/(mp4|webm))$/.test(mime))throw Error('This file type cannot be displayed.');
  const bytes=Uint8Array.from(atob(part.base64),c=>c.charCodeAt(0));
  if(bytes.length!==part.nextOffset-offset||part.done!==(part.nextOffset===size))throw Error('The file response was incomplete. Please reopen it.');
  parts.push(bytes);offset=part.nextOffset;progress(Math.round(offset/size*100));
  if(part.done)return {blob:new Blob(parts,{type:mime}),mimeType:mime};
 }
}
