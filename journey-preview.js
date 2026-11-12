// A reversible local proposal: no publication, analytics or account changes.
const doc=document;
// Keep the FAQ immediately under Share & Earn in the promotion column.
const placeContactFaq=()=>{const links=doc.querySelector('#contact .contact-promotion-rail'),footer=doc.querySelector('#contact .contact-faq-footer');if(!links||!footer)return false;if(footer.parentNode!==links)links.append(footer);return true;};
if(!placeContactFaq()){const observer=new MutationObserver(()=>{if(placeContactFaq())observer.disconnect();});observer.observe(doc.body,{childList:true,subtree:true});}
