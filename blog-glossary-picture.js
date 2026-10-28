import {DOCUMENT_BRAND} from './document-branding.js?v=two-line-footer-1';
let rendererPromise;
async function renderer(win){if(typeof win.html2canvas==='function')return win.html2canvas;rendererPromise||=import('./vendor/html2canvas.min.js').catch(error=>{rendererPromise=null;throw error;});await rendererPromise;if(typeof win.html2canvas!=='function')throw Error('The picture tool could not load. Please try again.');return win.html2canvas;}
export async function createGlossaryPicture(doc,win,root,sheet,{number,total}){
 const render=await renderer(win);await doc.fonts?.ready;
 const host=doc.createElement('div');host.className='blog-export-card';host.setAttribute('aria-hidden','true');host.style.cssText='position:fixed;left:-10000px;top:0;width:540px;box-sizing:border-box;padding:24px;background:#edf0e6;color:#193c32;z-index:-1;text-align:left;';
 const heading=doc.createElement('div');heading.className='blog-export-heading';const logo=doc.createElement('img');logo.src=new URL('./images/bold-blog-lion.webp',doc.baseURI).href;logo.alt='';logo.width=70;logo.height=70;const title=doc.createElement('h3');title.textContent='Bold blog · Words to keep';const position=doc.createElement('p');position.textContent='Glossary card '+number+' of '+total;heading.append(logo,title,position);
 const section=doc.createElement('section');section.className='blog-glossary';section.style.cssText='margin:0!important;padding:0!important;border:0!important;max-width:none!important;';const clone=sheet.cloneNode(true);clone.hidden=false;clone.style.cssText='display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:14px!important;';
 // Export the word headings as text; no interactive buttons belong in the picture.
 for(const button of clone.querySelectorAll('button')){const label=doc.createElement('strong');label.className=button.className;label.textContent=button.textContent;button.replaceWith(label);}section.append(clone);
 const footer=doc.createElement('div');footer.className='page-signature';for(const [i,line]of DOCUMENT_BRAND.credentials.split('\n').entries()){const e=doc.createElement(i?'small':'span');e.textContent=line;footer.append(e);}host.append(heading,section,footer);root.append(host);
 try{await logo.decode();if(root.hidden)throw Error('Return to the blog and try saving again.');const canvas=await render(host,{backgroundColor:'#edf0e6',scale:2,useCORS:true,logging:false,windowWidth:win.innerWidth,windowHeight:win.innerHeight});return await new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(Error('The picture could not be created. Please try again.')),'image/jpeg',.95));}finally{host.remove();}
}
export async function saveGlossaryPicture(doc,win,blob,{number,total}){
 const name='bold-blog-glossary-'+number+'-of-'+total+'.jpg',file=win.File?new win.File([blob],name,{type:'image/jpeg'}):null;
 const download=()=>{const url=win.URL.createObjectURL(blob),a=doc.createElement('a');a.href=url;a.download=name;doc.body.append(a);a.click();a.remove();win.setTimeout(()=>win.URL.revokeObjectURL(url),60000);return 'downloaded';};
 if(file&&win.navigator.share&&win.navigator.canShare?.({files:[file]})&&win.matchMedia('(pointer: coarse)').matches){try{await win.navigator.share({files:[file],title:'Bold blog · Words to keep'});return 'shared';}catch(error){if(error.name==='AbortError')return 'cancelled';}}
 return download();
}
