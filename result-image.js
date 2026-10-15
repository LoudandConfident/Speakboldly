const copyrightText=()=> '© Prepared by Mira Nasser Louis';
export function addResultBranding(doc,result) {
 const brand=doc.createElement('div');brand.className='result-brand';
 const logo=doc.createElement('img');logo.className='result-logo';logo.src=new URL('./app-icons/icon-192.png',doc.baseURI).href;logo.alt='Speak Boldly logo';logo.width=64;logo.height=64;
 const name=doc.createElement('span');name.textContent='Speak Boldly';brand.append(logo,name);result.prepend(brand);
 const contact=doc.createElement('p');contact.className='result-contact';contact.append(doc.createTextNode('If you need any guidance, contact us through: '));
 const email=doc.createElement('a');email.href='mailto:speakboldly16@gmail.com';email.textContent='speakboldly16@gmail.com';contact.append(email);result.append(contact);const footer=doc.createElement('div');footer.className='result-copyright';footer.style.cssText='display:flex;align-items:center;gap:12px;margin-top:24px;font-size:13px';const mark=logo.cloneNode();mark.className='result-footer-logo';mark.width=40;mark.height=40;footer.append(mark,doc.createTextNode(copyrightText()));result.append(footer);
}
export function resultImageBlocks(result) {
 return [...result.querySelectorAll('h2,h3,h4,p,li,tr')]
  .filter(node=>!node.closest('.result-image-actions,.result-copyright'))
  .map(node=>({heading:/^H[234]$/.test(node.tagName),text:node.tagName==='TR'?[...node.children].map(cell=>cell.textContent.trim()).join(' — '):(node.tagName==='LI'?'• ':'')+node.textContent.trim()}))
  .filter(block=>block.text);
}
export function learnerResultImageBlocks(result) {
 const cards=[...result.querySelectorAll(':scope > section')];
 return [...cards.flatMap(card=>resultImageBlocks(card)),...result.querySelectorAll(':scope > .result-contact')].map(block=>block.text!==undefined?block:{heading:false,text:block.textContent.trim()});
}
async function createImage(doc,result,title,options={}) {
 const logo=result.querySelector?.('.result-logo');
 if(logo){try{await logo.decode();}catch{throw new Error('The logo could not load. Connect to the internet and try saving again.');}}
 const canvas=doc.createElement('canvas'),ctx=canvas.getContext('2d');
 if(!ctx)throw new Error('Please use your phone’s screenshot controls to save this result.');
 const width=options.learnerCard?1600:1080,padding=options.learnerCard?80:64;
 const blocks=[{heading:true,text:title},...(options.learnerCard?learnerResultImageBlocks(result):resultImageBlocks(result)),{heading:false,text:'English Language Coaching · Speak Boldly'}];
 let lines=[],scale=options.learnerCard?1.25:1,contentHeight=0;
 function layout(){
  lines=[];
  for(const block of blocks){
   ctx.font=(block.heading?'600 '+34*scale+'px':28*scale+'px')+' system-ui, sans-serif';let line='';
   for(const word of block.text.split(/\s+/)){
    const candidate=line?line+' '+word:word;
    if(line&&ctx.measureText(candidate).width>width-padding*2){lines.push({text:line,heading:block.heading});line=word;}else line=candidate;
   }
   if(line)lines.push({text:line,heading:block.heading});lines.push({space:true});
  }
  contentHeight=padding*2+112+(logo?128:0)+lines.reduce((height,line)=>height+(line.space?20:line.heading?48:42)*scale,0);
 }
 layout();
 if(options.learnerCard)while(contentHeight>width){scale*=.95;layout();}
 canvas.width=width;canvas.height=options.learnerCard?width:Math.ceil(contentHeight);
 ctx.fillStyle=options.learnerCard?'#edf0e6':'#faf9f4';ctx.fillRect(0,0,canvas.width,canvas.height);
 ctx.fillStyle='#193c32';ctx.textBaseline='top';
 if(logo)ctx.drawImage(logo,padding,padding,96,96);
 let y=padding+(logo?128:0);
 for(const line of lines){if(line.space){y+=20*scale;continue;}ctx.font=(line.heading?'600 '+34*scale+'px':28*scale+'px')+' system-ui, sans-serif';ctx.fillText(line.text,padding,y);y+=(line.heading?48:42)*scale;}
 const footerY=canvas.height-padding-64;ctx.fillStyle='#193c32';if(logo)ctx.drawImage(logo,padding,footerY,64,64);ctx.font='500 24px system-ui, sans-serif';ctx.fillText(copyrightText(),padding+(logo?84:0),footerY+20);
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The picture could not be created. Please try again.')),'image/png'));
}
export function addResultImageButton(doc,win,result,title,options={}) {
 const actions=doc.createElement('div');actions.className='result-image-actions';
 const button=doc.createElement('button');button.type='button';button.className='button light small';button.textContent='Save result image';
 const status=doc.createElement('p');status.setAttribute('role','status');actions.append(button,status);result.append(actions);
 button.onclick=async()=>{
  button.disabled=true;status.textContent='';let objectUrl;
  try{
   const blob=await createImage(doc,result,title,options);
   const filename=(options.learnerCard||title.includes('Learner'))?'Speak-Boldly-learner-result.png':'Speak-Boldly-English-result.png';
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
