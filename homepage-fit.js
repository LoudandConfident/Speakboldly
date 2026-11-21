// Fit the desktop cover to the layout viewport, never the pinch-zoom viewport.
export function initializeHomepageFit(doc,win=doc.defaultView){
 const home=doc.querySelector('#home'),header=doc.querySelector('body>header'),main=doc.querySelector('main');
 if(!home||!main||!win)return;
 let frame;
 const fit=()=>{
  win.cancelAnimationFrame(frame);
  frame=win.requestAnimationFrame(()=>{
   if(home.hidden)return;
   if(win.matchMedia('(max-width:680px) and (pointer:coarse)').matches){
    doc.documentElement.style.removeProperty('--home-viewport-space');
    return;
   }
   const top=main.getBoundingClientRect().top+win.scrollY;
   const space=Math.max(390,Math.floor(win.innerHeight-top));
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
