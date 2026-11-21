// CSS owns the photo's aspect ratio. Pinch-zoom must not resize its layout frame.
export function initializeHomepageFit(doc){const home=doc.querySelector('#home');if(!home)return;
 doc.documentElement.style.removeProperty('--home-viewport-space');home.classList.remove('home-short-screen');
}
if(typeof document!=='undefined')initializeHomepageFit(document);
