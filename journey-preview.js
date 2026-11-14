const doc=document;
// The promotion column may grow independently of the contact details.
const placeContactExtras=()=>{
 const contact=doc.querySelector('#contact'),rail=contact?.querySelector('.contact-promotion-rail'),footer=contact?.querySelector('.contact-faq-footer'),social=contact?.querySelector('.contact-connect-content'),email=contact?.querySelector('.contact-email-faq-row');
 if(!contact||!rail||!footer||!social||!email)return false;
 if(footer.parentNode!==rail)rail.append(footer);
 let column=contact.querySelector('.contact-main-column');if(!column){column=doc.createElement('div');column.className='contact-main-column';social.before(column);column.append(social);}
 if(email.parentNode!==column)column.append(email);
 return true;
};
if(!placeContactExtras()){const observer=new MutationObserver(()=>{if(placeContactExtras())observer.disconnect();});observer.observe(doc.body,{childList:true,subtree:true});}
