import {openPopup} from './popups.js?v=mobile-assessment-page';
import {courses} from './courses.js';
import {reviewsConnected,reviewRequest} from './reviews-api.js?v=separate-review-sheet';
export function initializeReviews(doc, api = reviewRequest, connected = reviewsConnected) {
 const opener = doc.querySelector('#review-open'), form = doc.querySelector('#review-form');
 if (!opener || !form) return;
 const album = doc.querySelector('#review-album'), cards = doc.querySelector('#review-cards');
 const listStatus = doc.querySelector('#review-list-status'), position = doc.querySelector('#review-position');
 const previous = doc.querySelector('#review-previous'), next = doc.querySelector('#review-next');
 let reviews = [], selected = 0, submissionId = null, successTimer = null, loadVersion = 0;
 const cacheKey='speak-boldly-public-reviews-v1';let loading=false,pendingReload=false,lastLoaded=0;
 function cacheReviews(){try{doc.defaultView.localStorage.setItem(cacheKey,JSON.stringify({savedAt:Date.now(),reviews}));}catch{}}
 let hovering = false, focused = false, rotationTimer, drag = null;
 const view = doc.querySelector('#reviews');
 const mobileReviews=()=>Boolean(doc.defaultView.matchMedia?.('(max-width: 680px)').matches);
 function restartRotation() {
  doc.defaultView.clearInterval(rotationTimer);
  rotationTimer = doc.defaultView.setInterval(()=>{
   if (reviews.length < 2 || doc.hidden || view?.hidden || hovering || focused || drag || doc.querySelector('dialog[open]')) return;
   moveReview(1);
  },15000);
 }
 album?.addEventListener('mouseenter',()=>{hovering = true;});
 album?.addEventListener('mouseleave',()=>{hovering = false;restartRotation();});
 album?.addEventListener('focusin',()=>{focused = true;});
 album?.addEventListener('focusout',event=>{if (!album.contains(event.relatedTarget)) {focused = false;restartRotation();}});
 doc.defaultView.addEventListener('pagehide',()=>doc.defaultView.clearInterval(rotationTimer));
 doc.defaultView.addEventListener('pageshow',restartRotation);
 restartRotation();
 for (const course of courses) {const option = doc.createElement('option');option.value = option.textContent = course.title;form.elements.program.append(option);}
 function render() {
  if (!album) return;
  album.hidden = !reviews.length;
  cards.replaceChildren();
  if (!reviews.length) return;
  selected = Math.min(selected,reviews.length-1);
  const indices = mobileReviews()?reviews.map((_,index)=>index):[...new Set([selected-1,selected+1,selected].map(i => (i+reviews.length)%reviews.length))];
  for (const index of indices) {
   const review = reviews[index], card = doc.createElement('article');
   const side = index === selected ? 'selected' : index === (selected-1+reviews.length)%reviews.length ? 'previous' : 'next';
   card.className = 'review-card is-'+side;
   if (side !== 'selected'&&!mobileReviews()) card.setAttribute('aria-hidden','true');
   const quote = doc.createElement('blockquote');quote.textContent = review.message;
   const name = doc.createElement('h3');name.textContent = review.name || 'Anonymous';
   const detail = doc.createElement('p');detail.className = 'review-card-details';detail.textContent = [review.age ? 'Age: '+review.age : '',review.level ? 'Level: '+review.level : '',review.program ? 'Program: '+review.program : ''].filter(Boolean).join(' · ');
   const content = doc.createElement('div');content.className = 'review-card-content';
   content.append(name,detail,quote);card.append(content);cards.append(card);
  }
  previous.disabled = next.disabled = reviews.length < 2;
  position.textContent = 'Review '+(selected+1)+' of '+reviews.length;
  if(mobileReviews()){const target=cards.children[selected];if(target)cards.scrollLeft=target.offsetLeft-cards.children[0].offsetLeft;}
 }
 async function load({force=false}={}) {
  if (!connected()) {listStatus.textContent='';album.hidden=true;return;}
  if(loading){if(force)pendingReload=true;return;}
  if(!force&&lastLoaded&&Date.now()-lastLoaded<300000)return;
  loading=true;const version=++loadVersion,selectedId=reviews[selected]?.id;
  listStatus.textContent=reviews.length?'':'Loading reviews…';
  try{const result=await api('reviews');if(version!==loadVersion)return;if(!Array.isArray(result.reviews))throw new Error('Invalid reviews.');reviews=result.reviews;lastLoaded=Date.now();cacheReviews();const index=reviews.findIndex(review=>review.id===selectedId);selected=index<0?0:index;render();listStatus.textContent=reviews.length?'':'Be the first to share your experience.';}
  catch{if(version===loadVersion)listStatus.textContent=reviews.length?'Showing previously loaded reviews. Updates could not load yet.':'Reviews could not be loaded. Please try again later.';}
  finally{loading=false;if(pendingReload){pendingReload=false;load({force:true});}}
 }
 function moveReview(direction){
  if(reviews.length<2)return;
  selected=(selected+direction+reviews.length)%reviews.length;render();
  cards.querySelector('.is-selected')?.classList.add(direction>0?'review-enter-next':'review-enter-previous');
  restartRotation();
 }
 const reviewViewport=doc.defaultView.matchMedia?.('(max-width: 680px)');
 reviewViewport?.addEventListener?.('change',()=>{render();restartRotation();});
 previous?.addEventListener('click',()=>moveReview(-1));
 next?.addEventListener('click',()=>moveReview(1));
 cards?.addEventListener('scroll',()=>{if(!mobileReviews()||!cards.children.length)return;const first=cards.children[0].offsetLeft;let closest=0,distance=Infinity;for(let i=0;i<cards.children.length;i++){const delta=Math.abs(cards.children[i].offsetLeft-first-cards.scrollLeft);if(delta<distance){distance=delta;closest=i;}}selected=closest;position.textContent='Review '+(selected+1)+' of '+reviews.length;restartRotation();},{passive:true});
 cards?.setAttribute('tabindex','0');
 cards?.setAttribute('aria-label','Reviews. Swipe left or right, or use the arrow keys.');
 cards?.addEventListener('pointerdown',event=>{
  if(mobileReviews()||reviews.length<2||event.isPrimary===false||event.button>0)return;
  drag={id:event.pointerId,x:event.clientX,y:event.clientY,dx:0,horizontal:false};
 });
 cards?.addEventListener('pointermove',event=>{
  if(!drag||event.pointerId!==drag.id)return;
  const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
  if(!drag.horizontal){
   if(Math.abs(dy)>12&&Math.abs(dy)>Math.abs(dx)){drag=null;return;}
   if(Math.abs(dx)<12||Math.abs(dx)<Math.abs(dy))return;
   drag.horizontal=true;cards.setPointerCapture?.(event.pointerId);cards.classList.add('is-dragging');
  }
  event.preventDefault();drag.dx=dx;
  const card=cards.querySelector('.is-selected');
  if(card){card.style.animation='none';card.style.transition='none';card.style.setProperty('--review-drag',Math.max(-150,Math.min(150,dx))+'px');}
 });
 function finishDrag(event,cancelled=false){
  if(!drag||event.pointerId!==drag.id)return;
  const gesture=drag;drag=null;cards.classList.remove('is-dragging');
  const card=cards.querySelector('.is-selected');if(card){card.style.animation='';card.style.transition='';card.style.transform='';card.style.removeProperty('--review-drag');}
  if(cards.hasPointerCapture?.(event.pointerId))cards.releasePointerCapture(event.pointerId);
  if(!cancelled&&gesture.horizontal&&Math.abs(gesture.dx)>=40)moveReview(gesture.dx<0?1:-1);
  else restartRotation();
 }
 const allowDepth=()=>!mobileReviews()&&doc.defaultView.matchMedia('(hover: hover) and (pointer: fine)').matches&&!doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)').matches;
 function resetDepth(){const card=cards.querySelector('.is-selected');card?.style.removeProperty('--review-tilt-x');card?.style.removeProperty('--review-tilt-y');}
 cards?.addEventListener('pointermove',event=>{if(drag||!allowDepth())return;const card=cards.querySelector('.is-selected');if(!card)return;const rect=card.getBoundingClientRect(),x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1)),y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));card.style.setProperty('--review-tilt-x',(-y*2)+'deg');card.style.setProperty('--review-tilt-y',(x*2)+'deg');});
 cards?.addEventListener('pointerleave',resetDepth);
 cards?.addEventListener('pointerup',event=>finishDrag(event));
 cards?.addEventListener('pointercancel',event=>finishDrag(event,true));
 cards?.addEventListener('lostpointercapture',event=>finishDrag(event,true));
 let wheelDistance=0,lastWheel=0,lastWheelMove=0;
 cards?.addEventListener('wheel',event=>{
  if(mobileReviews()||reviews.length<2)return;
  const horizontal=event.shiftKey?event.deltaY:event.deltaX;
  if(!horizontal||(!event.shiftKey&&Math.abs(event.deltaY)>Math.abs(horizontal)))return;
  event.preventDefault();const now=Date.now();if(now-lastWheel>180)wheelDistance=0;lastWheel=now;
  wheelDistance+=horizontal;
  if(Math.abs(wheelDistance)>=45&&now-lastWheelMove>450){moveReview(wheelDistance>0?1:-1);lastWheelMove=now;wheelDistance=0;}
 },{passive:false});
 cards?.addEventListener('keydown',event=>{if (event.key === 'ArrowLeft') previous.click();if (event.key === 'ArrowRight') next.click();});
 opener.addEventListener('click', () => {
  doc.defaultView.clearTimeout(successTimer);
  doc.querySelector('#review-status').textContent = '';
  openPopup(doc.querySelector('#review-dialog'));
  form.querySelector('button[type=submit]').disabled = !connected();
  if (!connected()) doc.querySelector('#review-status').textContent = 'Review sharing is not connected yet. Please come back once it is ready.';
 });
 form.addEventListener('input',()=>{submissionId = null;});
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type=submit]'), status = doc.querySelector('#review-status');
  if (!connected()) {status.textContent = 'Review sharing is not connected yet.';return;}
  button.disabled = true;status.textContent = 'Sharing your review…';
  submissionId ||= doc.defaultView.crypto.randomUUID();
  try {
   const data = {submissionId,name:form.elements.name.value.trim(),age:form.elements.age.value,program:form.elements.program.value,level:form.elements.level.value.trim(),message:form.elements.message.value.trim()};
   const result = await api('reviews',{method:'POST',data});
   ++loadVersion;
   reviews = [result.review,...reviews.filter(review=>review.id!==result.review.id)];lastLoaded=Date.now();cacheReviews();selected=0;render();listStatus.textContent='';
   status.textContent = 'Thank you for submitting your review!';form.reset();submissionId = null;
   doc.defaultView.clearTimeout(successTimer);
   successTimer=doc.defaultView.setTimeout(()=>{
    const dialog=doc.querySelector('#review-dialog');
    if(!dialog?.open)return;
    dialog.close();doc.defaultView.location.hash='reviews';
    listStatus.textContent='Thank you for submitting your review!';restartRotation();
   },1400);
  } catch (error) {status.textContent = error.message || 'Your review could not be shared. Please try again.';}
  finally {button.disabled = false;}
 });
 doc.addEventListener('reviews-changed',()=>load({force:true}));
 doc.defaultView.addEventListener('hashchange',()=>{if(doc.defaultView.location.hash === '#reviews')load();});
 try{const cached=JSON.parse(doc.defaultView.localStorage.getItem(cacheKey)||'null');if(connected()&&Array.isArray(cached?.reviews)&&cached.reviews.every(review=>review&&typeof review.id==='string'&&typeof review.message==='string')){reviews=cached.reviews;lastLoaded=Number(cached.savedAt)||0;if(lastLoaded>Date.now())lastLoaded=0;render();listStatus.textContent=reviews.length?'':'Be the first to share your experience.';}}catch{}
 if(doc.defaultView.location.hash==='#reviews')load();
 return {load};
}
if (typeof document !== 'undefined') initializeReviews(document);
