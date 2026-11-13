export const PROGRAM_OFFER_DELAY_MS=30000;
export function initializeProgramOffer(doc){
 const programs=doc.querySelector('#courses');if(!programs||doc.getElementById('program-offer-dialog'))return;
 const win=doc.defaultView,dialog=doc.createElement('dialog');
 dialog.id='program-offer-dialog';dialog.className='program-offer-dialog action-popup';
 dialog.setAttribute('aria-labelledby','program-offer-title');
 dialog.setAttribute('aria-describedby','program-offer-description');
 dialog.innerHTML='<button type="button" class="popup-close" aria-label="Close Black Friday offer">×</button><p class="offer-eyebrow">SPEAK BOLDLY · BLACK FRIDAY</p><h2 id="program-offer-title">Black Friday offers are here!</h2><p id="program-offer-description">Get an <strong>extra 10% off</strong> our currently discounted program prices.</p><a class="button offer-whatsapp" href="https://wa.me/201283786904?text=Hi%20Speak%20Boldly!%20I%27d%20like%20to%20book%20a%20program%20with%20the%20Black%20Friday%20extra%2010%25%20discount." target="_blank" rel="noopener noreferrer">Book on WhatsApp ↗</a><button type="button" class="offer-browse">Explore programs first</button>';
 doc.body.append(dialog);let wasVisible=false,timer=null,eligible=false,shown=false;
 const close=()=>dialog.close();dialog.querySelector('.popup-close').onclick=close;dialog.querySelector('.offer-browse').onclick=close;dialog.querySelector('.offer-whatsapp').addEventListener('click',close);
 dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)close();}});
 const cancel=()=>{win.clearTimeout(timer);timer=null;eligible=false;};
 const showIfReady=()=>{if(!eligible||shown||programs.hidden||doc.hidden||doc.querySelector('dialog[open]'))return;shown=true;dialog.showModal();};
 const schedule=()=>{cancel();if(wasVisible&&!shown&&!doc.hidden)timer=win.setTimeout(()=>{timer=null;eligible=true;showIfReady();},PROGRAM_OFFER_DELAY_MS);};
 const update=()=>{const visible=!programs.hidden;if(visible&&!wasVisible){wasVisible=true;shown=false;schedule();}else if(!visible){wasVisible=false;shown=false;cancel();if(dialog.open)close();}};
 new win.MutationObserver(update).observe(programs,{attributes:true,attributeFilter:['hidden']});
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)cancel();else schedule();});
 doc.addEventListener('close',event=>{if(event.target!==dialog&&eligible&&!shown)win.requestAnimationFrame(showIfReady);},true);
 win.addEventListener('pagehide',cancel);win.addEventListener('pageshow',schedule);
 update();
}
if(typeof document!=='undefined')initializeProgramOffer(document);
