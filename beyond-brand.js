import {renderBeyondHeader,BEYOND_FOOTER_LINES} from './beyond-shell.js?v=2';
// The blog lives inside Beyond; teaching navigation remains in the teaching space.
export function initializeBeyondBrand(doc){
 const root=doc.querySelector('#boldly-notes');if(!root||doc.querySelector('#beyond-blog-header'))return;const win=doc.defaultView;
 const template=doc.createElement('template');template.innerHTML=renderBeyondHeader('Bold Blog');const header=template.content.firstElementChild;header.id='beyond-blog-header';header.classList.add('beyond-blog-header');header.hidden=true;
 doc.body.insertBefore(header,doc.querySelector('main'));root.querySelector('.beyond-blog-wordmark')?.remove();const footer=root.querySelector('[data-blog-footer]');if(footer){footer.classList.remove('page-signature');footer.classList.add('beyond-space-footer');footer.replaceChildren(...BEYOND_FOOTER_LINES.map((line,index)=>{const node=doc.createElement(index?'small':'span');node.textContent=line;return node;}));}
 // Change every browser-tab icon together: competing PNG/SVG declarations can
 // otherwise leave the previous space's logo cached after navigation.
 const icons=[...doc.head.querySelectorAll('link[rel~="icon"]')];
 if(!icons.length){const icon=doc.createElement('link');icon.rel='icon';doc.head.append(icon);icons.push(icon);}
 let activeBrand=null;
 function update(){const active=!root.hidden;header.hidden=!active;doc.body.classList.toggle('beyond-blog-active',active);if(activeBrand===active)return;activeBrand=active;for(const icon of icons){icon.href=active?'/literatespace/beyond-mark.svg?v=1':'/app-icons/icon-192.png';icon.type=active?'image/svg+xml':'image/png';icon.sizes=active?'any':'192x192';}}
 new win.MutationObserver(update).observe(root,{attributes:true,attributeFilter:['hidden']});win.addEventListener('hashchange',update);update();
}
if(typeof document!=='undefined')initializeBeyondBrand(document);
