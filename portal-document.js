import {fileBytes} from './exam-api.js';
export async function renderPdf(doc,viewer,url){
 const status=doc.createElement('p');status.textContent='Loading document…';viewer.append(status);
 try{
  const pdfjs=await import('./vendor/pdf.mjs');pdfjs.GlobalWorkerOptions.workerSrc=new URL('./vendor/pdf.worker.mjs',import.meta.url).href;
  const bytes=await fileBytes(url),pdf=await pdfjs.getDocument({data:bytes,isEvalSupported:false}).promise;
  if(!viewer.isConnected){await pdf.destroy();return;}
  const bar=doc.createElement('div'),prev=doc.createElement('button'),next=doc.createElement('button'),label=doc.createElement('span'),canvas=doc.createElement('canvas');
  for(const b of [prev,next]){b.type='button';b.className='button light small';}
  prev.textContent='Previous page';next.textContent='Next page';bar.append(prev,label,next);viewer.append(bar,canvas);canvas.style.maxWidth='100%';canvas.style.height='auto';let page=1,busy=false;
  async function render(){if(busy)return;busy=true;prev.disabled=next.disabled=true;try{const item=await pdf.getPage(page),viewport=item.getViewport({scale:1.4});canvas.width=viewport.width;canvas.height=viewport.height;await item.render({canvasContext:canvas.getContext('2d'),viewport}).promise;label.textContent=' Page '+page+' of '+pdf.numPages+' ';status.textContent='';}catch{status.textContent='This page could not load.';}finally{busy=false;prev.disabled=page===1;next.disabled=page===pdf.numPages;}}
  prev.onclick=()=>{if(page>1&&!busy){page--;render();}};next.onclick=()=>{if(page<pdf.numPages&&!busy){page++;render();}};await render();
  const observer=new MutationObserver(()=>{if(!viewer.isConnected){observer.disconnect();pdf.destroy();}});observer.observe(doc.body,{childList:true,subtree:true});
 }catch{status.textContent='Document could not load. Please reopen it to try again.';}
}
