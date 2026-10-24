import {DOCUMENT_BRAND} from './document-branding.js';
const copyrightText=()=> DOCUMENT_BRAND.credentials;
export function addResultBranding(doc,result) {
 const brand=doc.createElement('div');brand.className='result-brand';
 const logo=doc.createElement('img');logo.className='result-logo';logo.src=new URL(DOCUMENT_BRAND.logo,doc.baseURI).href;logo.alt='Speak Boldly logo';logo.width=64;logo.height=64;
 const name=doc.createElement('span');name.textContent='Speak Boldly';brand.append(logo,name);result.prepend(brand);
 const contact=doc.createElement('p');contact.className='result-contact';contact.append(doc.createTextNode('If you need any guidance, contact us through: '));
 const email=doc.createElement('a');email.href='mailto:Contactus@speakboldly.space';email.textContent='Contactus@speakboldly.space';contact.append(email);result.append(contact);const footer=doc.createElement('div');footer.className='result-copyright';footer.style.cssText='display:flex;align-items:center;gap:12px;margin-top:24px;font-size:13px';footer.append(doc.createTextNode(copyrightText()));result.append(footer);
}
export function resultImageBlocks(result) {
 return [...result.querySelectorAll('h2,h3,h4,p,li,tr,.cefr-level')]
  .filter(node=>!node.closest('.result-image-actions,.result-copyright'))
  .filter(node=>!node.closest('.cefr-level')||node.matches('.cefr-level'))
  .map(node=>({heading:/^H[234]$/.test(node.tagName),text:node.matches('.cefr-level')?[node.querySelector('strong')?.textContent.trim(),node.querySelector('.cefr-label')?.textContent.trim(),node.querySelector('.cefr-description')?.textContent.trim()].filter(Boolean).join(' — '):node.tagName==='TR'?[...node.children].map(cell=>cell.textContent.trim()).join(' — '):(node.tagName==='LI'?'• ':'')+node.textContent.trim()}))
  .filter(block=>block.text);
}
export function resultImageColors(doc,result,options={}){
 const card=options.learnerCard?(result.querySelector(':scope > section')||result):result;
 const style=node=>doc.defaultView.getComputedStyle(node);
 let background=options.learnerCard?'#edf0e6':'#e7f0e6';
 for(let node=card;node;node=node.parentElement){const color=style(node).backgroundColor;if(color&&color!=='transparent'&&!/^rgba\(.*[,/]\s*0(?:\.0+)?\s*\)$/.test(color)){background=color;break;}}
 return {background,foreground:style(card).color||'#193c32'};
}
export function learnerResultImageBlocks(result) {
 const cards=[...result.querySelectorAll(':scope > section')];
 return [...cards.flatMap(card=>resultImageBlocks(card)),...result.querySelectorAll(':scope > .result-contact')].map(block=>block.text!==undefined?block:{heading:false,text:block.textContent.trim()});
}
let rendererPromise;
async function resultRenderer(win){
 if(typeof win.html2canvas==='function')return win.html2canvas;
 rendererPromise ||= import('./vendor/html2canvas.min.js').catch(error=>{rendererPromise=null;throw error;});
 await rendererPromise;if(typeof win.html2canvas!=='function')throw new Error('The image tool could not load. Please try saving again.');return win.html2canvas;
}
export async function createResultImage(doc,result,options={}){
 const win=doc.defaultView,render=await resultRenderer(win);
 await doc.fonts?.ready;
 for(const img of result.querySelectorAll('img')){try{await img.decode();}catch{throw new Error('The logo could not load. Connect to the internet and try saving again.');}}
 const bounds=result.getBoundingClientRect(),width=Math.max(1,bounds.width),height=Math.max(1,result.scrollHeight,bounds.height);
 const scale=Math.min(2,12000/height,Math.sqrt(12000000/(width*height)));
 const canvas=await render(result,{backgroundColor:resultImageColors(doc,result).background,scale,useCORS:true,logging:false,windowWidth:win.innerWidth,windowHeight:win.innerHeight,ignoreElements:node=>node.classList?.contains('result-image-actions')||node.tagName==='BUTTON'});
 return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('The picture could not be created. Please try again.')),'image/png'));
}
export function addResultImageButton(doc,win,result,title,options={}) {
 const actions=doc.createElement('div');actions.className='result-image-actions';
 const button=doc.createElement('button');button.type='button';button.className='button light small';button.textContent='Save result image';
 const status=doc.createElement('p');status.setAttribute('role','status');actions.append(button,status);result.append(actions);
 button.onclick=async()=>{
  button.disabled=true;status.textContent='Preparing your result picture…';let objectUrl;
  try{
   const blob=await createResultImage(doc,result,options);
   const filename=(options.learnerCard||title.includes('Learner'))?'Speak-Boldly-learner-result.png':'Speak-Boldly-English-result.png';
   const file=win.File?new win.File([blob],filename,{type:'image/png'}):null;
   const download=()=>{objectUrl=win.URL.createObjectURL(blob);const link=doc.createElement('a');link.href=objectUrl;link.download=filename;doc.body.append(link);link.click();link.remove();status.textContent='Your result picture is ready in your downloads.';};
   if(file&&win.navigator.share&&win.navigator.canShare?.({files:[file]})){
    status.textContent='Choose Save Image or Save to Files in your phone’s menu.';
    try{await win.navigator.share({files:[file],title});}catch(error){if(error.name==='AbortError')throw error;download();}
   }else download();
  }catch(error){status.textContent=error.name==='AbortError'?'':error.message;}
  finally{button.disabled=false;if(objectUrl)win.setTimeout(()=>win.URL.revokeObjectURL(objectUrl),60000);}
 };
}

