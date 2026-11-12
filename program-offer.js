export function initializeProgramOffer(doc){
 const programs=doc.querySelector('#courses');if(!programs||doc.getElementById('program-offer-dialog'))return;
 const win=doc.defaultView,dialog=doc.createElement('dialog');
 dialog.id='program-offer-dialog';dialog.className='program-offer-dialog action-popup';
 dialog.setAttribute('aria-labelledby','program-offer-title');
 dialog.setAttribute('aria-describedby','program-offer-description');
 dialog.innerHTML='<button type="button" class="popup-close" aria-label="Close Black Friday offer">×</button><div class="offer-art" aria-hidden="true">✳<span>−10%</span></div><p class="offer-eyebrow">SPEAK BOLDLY · BLACK FRIDAY</p><h2 id="program-offer-title">Black Friday offers are here!</h2><p id="program-offer-description">Get an <strong>extra 10% off</strong> our currently discounted program prices.</p><a class="button offer-whatsapp" href="https://wa.me/201283786904?text=Hi%20Speak%20Boldly!%20I%27d%20like%20to%20book%20a%20program%20with%20the%20Black%20Friday%20extra%2010%25%20discount." target="_blank" rel="noopener noreferrer">Book on WhatsApp ↗</a><button type="button" class="offer-browse">Explore programs first</button>';
 doc.body.append(dialog);let wasVisible=false;
 const close=()=>dialog.close();dialog.querySelector('.popup-close').onclick=close;dialog.querySelector('.offer-browse').onclick=close;dialog.querySelector('.offer-whatsapp').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
 const update=()=>{const visible=!programs.hidden;if(visible&&!wasVisible){wasVisible=true;dialog.showModal();}else if(!visible){wasVisible=false;if(dialog.open)close();}};
 new win.MutationObserver(update).observe(programs,{attributes:true,attributeFilter:['hidden']});
 update();
}
if(typeof document!=='undefined')initializeProgramOffer(document);
