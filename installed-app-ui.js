export function initializeInstalledAppUi(doc,win){
 const displayMode=win.matchMedia('(display-mode: standalone)');
 const installed=()=>displayMode.matches||win.navigator.standalone===true;
 function update(){doc.querySelector('#installed-dashboard-link')?.remove();doc.querySelectorAll('#phone-install-button,.phone-install-row,#app-install,[data-instructor-app-link]').forEach(element=>element.hidden=installed());}
 update();displayMode.addEventListener?.('change',update);
 let timer=null,background=false,lastRefresh=0;
 const enabled=()=>installed()||doc.body.classList.contains('instructor-app')||new URL(win.location.href).searchParams.get('app')==='owner';
 function refresh(){if(doc.hidden||!enabled())return;win.clearTimeout(timer);timer=win.setTimeout(()=>{if(doc.hidden||Date.now()-lastRefresh<1000)return;lastRefresh=Date.now();doc.dispatchEvent(new win.Event('speak-boldly-app-resume'));},200);}
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden){background=true;win.clearTimeout(timer);}else if(background){background=false;refresh();}});
 win.addEventListener('pageshow',event=>{if(event.persisted)refresh();});
 win.addEventListener('focus',refresh);
 return {refresh};
}
if(typeof document!=='undefined')initializeInstalledAppUi(document,window);
