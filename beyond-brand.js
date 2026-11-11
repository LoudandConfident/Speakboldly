// Shared editorial identity; the teaching favicon returns when leaving Bold Blog.
export function initializeBeyondBrand(doc){
 const root=doc.querySelector('#boldly-notes');if(!root)return;const win=doc.defaultView;
 const mark=doc.createElement('a');mark.className='beyond-blog-wordmark';mark.href='/literatespace/';mark.setAttribute('aria-label','Back to Beyond literary space');mark.innerHTML='<img src="/literatespace/beyond-mark.svg?v=1" alt="" width="24" height="24"><span>Beyond<span class="beyond-wordmark-dot" aria-hidden="true">.</span></span><small>Bold Blog</small>';
 root.querySelector('[data-blog-heading]')?.prepend(mark);
 const icon=doc.createElement('link');icon.rel='icon';icon.type='image/svg+xml';icon.href='/literatespace/beyond-mark.svg?v=1';
 function update(){if(!root.hidden){if(!icon.isConnected)doc.head.append(icon);}else icon.remove();}
 new win.MutationObserver(update).observe(root,{attributes:true,attributeFilter:['hidden']});win.addEventListener('hashchange',update);update();
}
if(typeof document!=='undefined')initializeBeyondBrand(document);
