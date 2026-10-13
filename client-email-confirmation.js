export function confirmClientEmail(doc,message,options={}){
 return new Promise(resolve=>{
  const dialog=doc.createElement('dialog');dialog.className='action-popup '+(options.className||'client-email-confirmation');dialog.setAttribute('aria-label',options.ariaLabel||'Confirm email sending');
  const heading=doc.createElement('h2');heading.textContent=options.title||'Send email';const question=doc.createElement('p');question.textContent=message;
  const actions=doc.createElement('div');actions.className='detail-actions';
  const cancel=doc.createElement('button'),ok=doc.createElement('button');cancel.type=ok.type='button';cancel.className='button light';ok.className='button';cancel.textContent='Cancel';ok.textContent='OK';actions.append(cancel,ok);dialog.append(heading,question,actions);doc.body.append(dialog);
  let done=false;function finish(value){if(done)return;done=true;doc.removeEventListener('portal-sign-out',onExit);doc.defaultView.removeEventListener('hashchange',onHash);if(dialog.open)dialog.close();dialog.remove();resolve(value);}
  const onExit=()=>finish(false),onHash=()=>{if(doc.querySelector('#students-portal')&&!doc.defaultView.location.hash.startsWith('#students-portal'))finish(false);};
  cancel.onclick=()=>finish(false);ok.onclick=()=>finish(true);dialog.addEventListener('cancel',()=>finish(false));dialog.addEventListener('close',()=>finish(false));doc.addEventListener('portal-sign-out',onExit);doc.defaultView.addEventListener('hashchange',onHash);dialog.showModal();cancel.focus();
 });
}
