export function resultImageBlocks(result) {
 return [...result.querySelectorAll('h2,h3,h4,p,li,tr')]
  .filter(node=>!node.closest('.result-image-actions'))
  .map(node=>({heading:/^H[234]$/.test(node.tagName),text:node.tagName==='TR'?[...node.children].map(cell=>cell.textContent.trim()).join(' — '):(node.tagName==='LI'?'• ':'')+node.textContent.trim()}))
  .filter(block=>block.text);
}
function createImage(doc,result,title) {
 const canvas=doc.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Please use your phone’s screenshot controls to save this result.');
 const width=1080,padding=64,lines=[];
 const blocks=[{heading:true,text:title},...resultImageBlocks(result),{heading:false,text:'English Language Coaching · Speak Boldly'}];
 for(const block of blocks){
  ctx.font=(block.heading?'600 34px':'28px')+' system-ui, sans-serif';
  let line='';
  for(const word of block.text.split(/\s+/)){
   const candidate=line?line+' '+word:word;
   if(line&&ctx.measureText(candidate).width>width-padding*2){lines.push({text:line,heading:block.heading});line=word;}else line=candidate;
  }
  if(line)lines.push({text:line,heading:block.heading});
  lines.push({space:true});
 }
 canvas.width=width;canvas.height=padding*2+lines.reduce((height,line)=>height+(line.space?20:line.heading?48:42),0);
 ctx.fillStyle='#faf9f4';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#193c32';ctx.textBaseline='top';
 let y=padding;
 for(const line of lines){if(line.space){y+=20;continue;}ctx.font=(line.heading?'600 34px':'28px')+' system-ui, sans-serif';ctx.fillText(line.text,padding,y);y+=line.heading?48:42;}
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The picture could not be created. Please try again.')),'image/png'));
}
export function addResultImageButton(doc,win,result,title) {
 const actions=doc.createElement('div');actions.className='result-image-actions';
 const button=doc.createElement('button');button.type='button';button.className='button light small';button.textContent='Save result image';
 const status=doc.createElement('p');status.setAttribute('role','status');actions.append(button,status);result.append(actions);
 button.onclick=async()=>{
  button.disabled=true;status.textContent='';let objectUrl;
  try{
   const blob=await createImage(doc,result,title);
   const filename=title.includes('Learner')?'Speak-Boldly-learner-result.png':'Speak-Boldly-English-result.png';
   const file=win.File?new win.File([blob],filename,{type:'image/png'}):null;
   if(file&&win.navigator.share&&win.navigator.canShare?.({files:[file]})){
    status.textContent='Choose Save Image or Save to Files in your phone’s menu.';
    await win.navigator.share({files:[file],title});
   }else{
    objectUrl=win.URL.createObjectURL(blob);const link=doc.createElement('a');link.href=objectUrl;link.download=filename;doc.body.append(link);link.click();link.remove();
    status.textContent='Your result picture is ready in your downloads.';
   }
  }catch(error){status.textContent=error.name==='AbortError'?'':error.message;}
  finally{button.disabled=false;if(objectUrl)win.setTimeout(()=>win.URL.revokeObjectURL(objectUrl),60000);}
 };
}
