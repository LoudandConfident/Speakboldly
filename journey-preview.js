// A reversible local proposal: no publication, analytics or account changes.
const doc=document;
doc.querySelector('[data-home-guide]')?.addEventListener('click',()=>doc.querySelector('#home-path')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'nearest'}));
// Keep the collapsed FAQ beside the contact promotions, without narrowing the email line.
const placeContactFaq=()=>{const rail=doc.querySelector('#contact .contact-promotion-rail'),footer=doc.querySelector('#contact .contact-faq-footer');if(!rail||!footer)return false;if(footer.parentNode!==rail)rail.append(footer);return true;};
if(!placeContactFaq()){const observer=new MutationObserver(()=>{if(placeContactFaq())observer.disconnect();});observer.observe(doc.body,{childList:true,subtree:true});}
