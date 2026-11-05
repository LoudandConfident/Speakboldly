import {publicDocumentUrl} from './public-document-url.js?v=custom-domain';
import {renderPdf} from './portal-document.js?v=page-arrows-2';
export function learningDocumentEmbed(value,base){
 const url=publicDocumentUrl(value,base);if(url.protocol!=='https:'&&!(url.origin===new URL(base).origin&&['localhost','127.0.0.1'].includes(url.hostname)))throw new Error('This document cannot be displayed.');
 if(url.hostname==='drive.google.com'){
  const id=url.pathname.match(/\/d\/([a-zA-Z0-9_-]+)/)?.[1]||url.searchParams.get('id');if(!id||!/^[a-zA-Z0-9_-]+$/.test(id))throw new Error('This document link is not supported.');
  const preview=new URL('https://drive.google.com/file/d/'+id+'/preview');if(url.searchParams.has('resourcekey'))preview.searchParams.set('resourcekey',url.searchParams.get('resourcekey'));return {kind:'frame',url:preview.href};
 }
 if(url.hostname==='docs.google.com'){
  const match=url.pathname.match(/^\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);if(!match)throw new Error('This document link is not supported.');
  return {kind:'frame',url:'https://docs.google.com/'+match[1]+'/d/'+match[2]+(match[1]==='presentation'?'/embed':'/preview')};
 }
 if(/\.(png|jpe?g|webp|gif)$/i.test(url.pathname))return {kind:'image',url:url.href};
 if(/\.(mp3|m4a|ogg|wav)$/i.test(url.pathname))return {kind:'audio',url:url.href};
 if(/\.(mp4|webm)$/i.test(url.pathname))return {kind:'video',url:url.href};
 if(/\.pdf$/i.test(url.pathname)&&url.origin===new URL(base).origin)return {kind:'pdf',url:url.href};
 return {kind:'frame',url:url.href};
}
const readingTabs=new Set();
export function closeLearningDocument(doc){for(const entry of [...readingTabs])if(entry.owner===doc)entry.close();doc.querySelector('#learning-document-viewer')?.close();}
export function updateLearningDocumentAccess(doc,items){for(const entry of [...readingTabs])if(entry.owner===doc&&!items.some(item=>item.id===entry.id&&item.enabled))entry.close();const viewer=doc.querySelector('#learning-document-viewer');if(viewer&&!items.some(item=>item.id===viewer.dataset.documentId&&item.enabled))viewer.close();}
export function openLearningDocument(doc,item){
 let objectUrl=null,source;
 if(item.inline){const mime=String(item.inline.mimeType||'');if(!/^(application\/pdf|image\/(png|jpeg|webp|gif)|audio\/[\w.+-]+|video\/(mp4|webm))$/.test(mime)||(!(item.inline.blob instanceof Blob)&&typeof item.inline.base64!=='string'))throw Error('This file type cannot be displayed.');const blob=item.inline.blob instanceof Blob?item.inline.blob:new Blob([Uint8Array.from(doc.defaultView.atob(item.inline.base64),c=>c.charCodeAt(0))],{type:mime});if(blob.type!==mime)throw Error('This file type cannot be displayed.');objectUrl=doc.defaultView.URL.createObjectURL(blob);source={kind:mime==='application/pdf'?'pdf':mime.startsWith('image/')?'image':mime.startsWith('audio/')?'audio':'video',url:objectUrl};}else source=learningDocumentEmbed(item.url,doc.baseURI);if(item.bookWindow&&!item.bookWindow.closed){openBookTab(doc,item,source,objectUrl);return;}closeLearningDocument(doc);
 const dialog=doc.createElement('dialog');dialog.id='learning-document-viewer';dialog.className='action-popup learning-document-viewer';dialog.dataset.documentId=item.id;dialog.setAttribute('aria-labelledby','learning-document-viewer-title');
 const bar=doc.createElement('div');bar.className='learning-document-viewer-bar';const title=doc.createElement('h2');title.id='learning-document-viewer-title';title.textContent=item.title;
 const close=doc.createElement('button');close.type='button';close.className='button light small';close.textContent='Back to files';close.onclick=()=>dialog.close();bar.append(title,close);
 const body=doc.createElement('div');body.className='learning-document-viewer-body';
 const tag={frame:'iframe',image:'img',audio:'audio',video:'video',pdf:'div'}[source.kind],media=doc.createElement(tag);if(source.kind!=='pdf')media.src=source.url;
 if(tag==='iframe'){media.title=item.title;media.setAttribute('allow','fullscreen');media.setAttribute('allowfullscreen','');media.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');media.referrerPolicy='strict-origin-when-cross-origin';}
 else if(tag==='img'){media.alt=item.title;}
 else if(source.kind!=='pdf'){media.controls=true;media.preload='metadata';media.setAttribute('controlsList','nodownload');}
 body.append(media);dialog.append(bar,body);
 const onExit=()=>dialog.close(),onHash=()=>{if(!doc.defaultView.location.hash.startsWith('#students-portal'))dialog.close();};
 dialog.addEventListener('close',()=>{doc.removeEventListener('student-portal-locking',onExit);doc.removeEventListener('portal-sign-out',onExit);doc.defaultView.removeEventListener('hashchange',onHash);media.removeAttribute('src');if(objectUrl)doc.defaultView.URL.revokeObjectURL(objectUrl);dialog.remove();},{once:true});
 doc.addEventListener('student-portal-locking',onExit);doc.addEventListener('portal-sign-out',onExit);doc.defaultView.addEventListener('hashchange',onHash);
 doc.body.append(dialog);dialog.showModal();close.focus();if(source.kind==='pdf')renderPdf(doc,media,source.url);
}

function openBookTab(owner,item,source,objectUrl){
 const win=item.bookWindow,doc=win.document;doc.documentElement.lang='en';doc.title=item.title+' | Speak Boldly';doc.head.replaceChildren();doc.body.replaceChildren();
 const meta=doc.createElement('meta');meta.name='viewport';meta.content='width=device-width, initial-scale=1';const style=doc.createElement('style');style.textContent='*{box-sizing:border-box}body{margin:0;background:#eef2e9;color:#174b3c;font:16px system-ui,sans-serif}header{position:sticky;top:0;background:#fff;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;border-bottom:1px solid #cbd5c6;z-index:2}h1{font-size:17px;margin:0}button{border:1px solid #b7c7b2;border-radius:24px;background:white;color:#174b3c;padding:10px 16px;cursor:pointer}button:hover{background:#dce9cf}button:disabled{opacity:.4;cursor:default}main{max-width:1000px;margin:16px auto;padding:0 12px 24px}canvas{display:block;margin:auto;background:white;box-shadow:0 3px 16px #183a2720}.document-page-controls{display:flex;align-items:center;justify-content:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}iframe{width:100%;height:85vh;border:0;background:white}img{max-width:100%}';doc.head.append(meta,style);
 const header=doc.createElement('header'),title=doc.createElement('h1'),back=doc.createElement('button'),main=doc.createElement('main');title.textContent=item.title;back.textContent='Back to library';back.onclick=()=>{owner.defaultView.focus();win.close();};header.append(title,back);doc.body.append(header,main);
 if(source.kind==='pdf')renderPdf(doc,main,source.url);else{const media=doc.createElement(source.kind==='image'?'img':'iframe');media.src=source.url;media.title=item.title;if(media.tagName==='IFRAME'){media.setAttribute('sandbox','allow-scripts allow-same-origin allow-forms allow-presentation');}main.append(media);}
 let cleaned=false;const cleanup=()=>{if(cleaned)return;cleaned=true;readingTabs.delete(entry);owner.removeEventListener('student-portal-locking',entry.close);owner.removeEventListener('portal-sign-out',entry.close);owner.defaultView.removeEventListener('pagehide',entry.close);if(objectUrl)owner.defaultView.URL.revokeObjectURL(objectUrl);};const entry={owner,id:item.id,close:()=>{win.close();cleanup();}};readingTabs.add(entry);win.addEventListener('pagehide',cleanup,{once:true});owner.addEventListener('student-portal-locking',entry.close);owner.addEventListener('portal-sign-out',entry.close);owner.defaultView.addEventListener('pagehide',entry.close);
}
