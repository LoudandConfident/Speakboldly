export function initializeStudentInstall(doc,win=doc.defaultView){
 if('serviceWorker' in win.navigator&&win.isSecureContext)win.navigator.serviceWorker.register(new URL('./service-worker.js',doc.baseURI),{updateViaCache:'none'}).catch(()=>{});
 const buttons=[...doc.querySelectorAll('#student-install-button,#desktop-install-button')];if(!buttons.length)return;
 let pending=null;const mode=win.matchMedia('(display-mode: standalone)'),installed=()=>mode.matches||win.navigator.standalone===true;
 const update=()=>{buttons.forEach(button=>button.hidden=installed());};update();mode.addEventListener?.('change',update);
 win.addEventListener('beforeinstallprompt',event=>{event.preventDefault();pending=event;update();});win.addEventListener('appinstalled',()=>{pending=null;buttons.forEach(button=>button.hidden=true);});
 for(const button of buttons)button.onclick=async()=>{
  if(button.id==='student-install-button'){const url=new URL(win.location.href);url.searchParams.set('app','learner');url.hash='students-portal/student';win.history.replaceState(null,'',url);}

  if(pending){const prompt=pending;pending=null;try{await prompt.prompt();await prompt.userChoice;}catch{showHelp();}return;}
  showHelp();
 };
 function showHelp(){let dialog=doc.querySelector('#student-install-help');if(!dialog){dialog=doc.createElement('dialog');dialog.id='student-install-help';dialog.className='action-popup';dialog.setAttribute('aria-labelledby','student-install-title');const close=doc.createElement('button');close.type='button';close.className='popup-close';close.setAttribute('aria-label','Close installation steps');close.textContent='×';close.onclick=()=>dialog.close();const title=doc.createElement('h2');title.id='student-install-title';title.textContent='Install Speak Boldly';dialog.append(close,title);for(const text of ['PC: In Chrome, use the Install icon in the address bar or the browser menu → Cast, save and share → Install page as app. In Edge, open the menu → Apps → Install this site as an app.','Mac Safari: Open File → Add to Dock, if available.','iPhone: Open this page in Safari. Tap Share, then Add to Home Screen. Turn on Open as Web App if shown, then tap Add.','Android: Open this page in Chrome. Tap the ⋮ menu, then Install app or Add to Home screen.']){const p=doc.createElement('p');p.textContent=text;dialog.append(p);}doc.body.append(dialog);}dialog.showModal();}
}
if(typeof document!=='undefined')initializeStudentInstall(document);
