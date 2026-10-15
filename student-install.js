export function initializeStudentInstall(doc,win=doc.defaultView){
 const button=doc.querySelector('#student-install-button');if(!button)return;
 let pending=null;const mode=win.matchMedia('(display-mode: standalone)'),installed=()=>mode.matches||win.navigator.standalone===true;
 const update=()=>{button.hidden=installed();};update();mode.addEventListener?.('change',update);
 win.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;update();});win.addEventListener('appinstalled',()=>{pending=null;button.hidden=true;});
 button.onclick=async()=>{
  const url=new URL(win.location.href);url.searchParams.set('app','learner');url.hash='students-portal/student';win.history.replaceState(null,'',url);

  if(pending){const prompt=pending;pending=null;try{await prompt.prompt();await prompt.userChoice;}catch{showHelp();}return;}
  showHelp();
 };
 function showHelp(){let dialog=doc.querySelector('#student-install-help');if(!dialog){dialog=doc.createElement('dialog');dialog.id='student-install-help';dialog.className='action-popup';dialog.setAttribute('aria-labelledby','student-install-title');const close=doc.createElement('button');close.type='button';close.className='popup-close';close.setAttribute('aria-label','Close installation steps');close.textContent='×';close.onclick=()=>dialog.close();const title=doc.createElement('h2');title.id='student-install-title';title.textContent='Install Learning Hub';dialog.append(close,title);for(const text of ['iPhone: Open this page in Safari. Tap Share, then Add to Home Screen. Turn on Open as Web App if shown, then tap Add.','Android: Open this page in Chrome. Tap the ⋮ menu, then Install app or Add to Home screen.']){const p=doc.createElement('p');p.textContent=text;dialog.append(p);}doc.body.append(dialog);}dialog.showModal();}
 if('serviceWorker' in win.navigator&&win.isSecureContext)win.navigator.serviceWorker.register(new URL('./service-worker.js',doc.baseURI),{updateViaCache:'none'}).catch(()=>{});
}
if(typeof document!=='undefined')initializeStudentInstall(document);
