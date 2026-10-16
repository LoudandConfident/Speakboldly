import {renderPdf} from './portal-document.js?v=embedded-books';
export function learningDocumentEmbed(value,base){
 const url=new URL(value,base);if(url.protocol!=='https:'&&!(url.origin===new URL(base).origin&&['localhost','127.0.0.1'].includes(url.hostname)))throw new Error('This document cannot be displayed.');
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
export function closeLearningDocument(doc){doc.querySelector('#learning-document-viewer')?.close();}
export function updateLearningDocumentAccess(doc,items){const viewer=doc.querySelector('#learning-document-viewer');if(viewer&&!items.some(item=>item.id===viewer.dataset.documentId&&item.enabled))viewer.close();}
export function openLearningDocument(doc,item){
 const source=learningDocumentEmbed(item.url,doc.baseURI);closeLearningDocument(doc);
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
 dialog.addEventListener('close',()=>{doc.removeEventListener('student-portal-locking',onExit);doc.removeEventListener('portal-sign-out',onExit);doc.defaultView.removeEventListener('hashchange',onHash);media.removeAttribute('src');dialog.remove();},{once:true});
 doc.addEventListener('student-portal-locking',onExit);doc.addEventListener('portal-sign-out',onExit);doc.defaultView.addEventListener('hashchange',onHash);
 doc.body.append(dialog);dialog.showModal();close.focus();if(source.kind==='pdf')renderPdf(doc,media,source.url);
}
