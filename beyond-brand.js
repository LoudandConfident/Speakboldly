// The blog lives inside Beyond; teaching navigation remains in the teaching space.
export function initializeBeyondBrand(doc){
 const root=doc.querySelector('#boldly-notes');if(!root||doc.querySelector('#beyond-blog-header'))return;const win=doc.defaultView;
 const arrow='<svg viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10H3m7-7-7 7 7 7"/></svg>';
 const header=doc.createElement('header');header.id='beyond-blog-header';header.className='beyond-blog-header';header.hidden=true;
 header.innerHTML='<a class="beyond-blog-back" href="/literatespace/" aria-label="Back to Beyond">'+arrow+'</a><a class="beyond-blog-wordmark" href="/literatespace/"><img src="/literatespace/beyond-mark.svg?v=1" alt="" width="30" height="30"><span>Beyond.</span></a><span class="beyond-blog-section-name">Bold Blog</span><a class="beyond-teaching-return" href="/#home">Back to Speak Boldly</a>';
 doc.body.insertBefore(header,doc.querySelector('main'));root.querySelector('.beyond-blog-wordmark')?.remove();
 // Change every browser-tab icon together: competing PNG/SVG declarations can
 // otherwise leave the previous space's logo cached after navigation.
 const icons=[...doc.head.querySelectorAll('link[rel~="icon"]')];
 if(!icons.length){const icon=doc.createElement('link');icon.rel='icon';doc.head.append(icon);icons.push(icon);}
 let activeBrand=null;
 function update(){const active=!root.hidden;header.hidden=!active;doc.body.classList.toggle('beyond-blog-active',active);if(activeBrand===active)return;activeBrand=active;for(const icon of icons){icon.href=active?'/literatespace/beyond-mark.svg?v=1':'/app-icons/icon-192.png';icon.type=active?'image/svg+xml':'image/png';icon.sizes=active?'any':'192x192';}}
 new win.MutationObserver(update).observe(root,{attributes:true,attributeFilter:['hidden']});win.addEventListener('hashchange',update);update();
}
if(typeof document!=='undefined')initializeBeyondBrand(document);
