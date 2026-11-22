// Fit the desktop cover to the layout viewport, never the pinch-zoom viewport.
export function initializeHomepageFit(doc,win=doc.defaultView){
 const home=doc.querySelector('#home'),header=doc.querySelector('body>header'),main=doc.querySelector('main');
 if(!home||!main||!win)return;
 const updateDeviceMode=()=>{
  const touch=win.matchMedia('(any-pointer:coarse)').matches||win.navigator?.maxTouchPoints>0;
  const screenWidth=win.screen?.width||win.innerWidth,screenHeight=win.screen?.height||win.innerHeight;
  const phoneDesktop=touch&&win.innerWidth>680&&(screenWidth<681||(screenHeight<681&&win.innerWidth>screenWidth*1.1)||win.innerHeight>win.innerWidth*1.6);
  const mode=phoneDesktop?(win.innerHeight>win.innerWidth?'portrait':'landscape'):'';
  if(mode)doc.documentElement.setAttribute('data-phone-desktop',mode);
  else doc.documentElement.removeAttribute('data-phone-desktop');
  return mode;
 };
 updateDeviceMode();
 let frame;
 const fit=()=>{
  win.cancelAnimationFrame(frame);
  frame=win.requestAnimationFrame(()=>{
   const phoneDesktop=updateDeviceMode();
   if(home.hidden)return;
   if(phoneDesktop==='portrait'||win.matchMedia('(max-width:680px) and (pointer:coarse)').matches){
    doc.documentElement.style.removeProperty('--home-viewport-space');
    return;
   }
   const top=main.getBoundingClientRect().top+win.scrollY;
   const space=Math.max(phoneDesktop==='landscape'?360:390,Math.floor(win.innerHeight-top));
   doc.documentElement.style.setProperty('--home-viewport-space',space+'px');
  });
 };
 if(header&&win.ResizeObserver)new win.ResizeObserver(fit).observe(header);
 win.addEventListener('resize',fit);
 win.addEventListener('hashchange',fit);
 win.addEventListener('pageshow',fit);
 doc.fonts?.ready.then(fit);
 fit();
}
if(typeof document!=='undefined')initializeHomepageFit(document);
