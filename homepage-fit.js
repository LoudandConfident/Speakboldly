// Size the home composition to the visible viewport; other pages keep normal scrolling.
export function initializeHomepageFit(doc,win=doc.defaultView){const home=doc.querySelector('#home'),header=doc.querySelector('body>header'),main=doc.querySelector('main');if(!home||!main)return;let frame;
 const fit=()=>{win.cancelAnimationFrame(frame);frame=win.requestAnimationFrame(()=>{if(home.hidden)return;const height=win.visualViewport?.height||win.innerHeight,top=main.getBoundingClientRect().top+win.scrollY,space=Math.max(240,Math.floor(height-top-2));doc.documentElement.style.setProperty('--home-viewport-space',space+'px');home.classList.toggle('home-short-screen',height<690);});};
 const observer=win.ResizeObserver?new win.ResizeObserver(fit):null;if(header)observer?.observe(header);observer?.observe(main);win.addEventListener('resize',fit);win.visualViewport?.addEventListener('resize',fit);win.addEventListener('hashchange',fit);win.addEventListener('pageshow',fit);doc.fonts?.ready.then(fit);fit();
}
if(typeof document!=='undefined')initializeHomepageFit(document);
