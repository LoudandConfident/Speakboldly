import {openPopup} from './popups.js';
import {courses} from './courses.js';
import {reviewsConnected,reviewRequest} from './reviews-api.js?v=separate-review-sheet';
export function initializeReviews(doc, api = reviewRequest, connected = reviewsConnected) {
 const opener = doc.querySelector('#review-open'), form = doc.querySelector('#review-form');
 if (!opener || !form) return;
 const album = doc.querySelector('#review-album'), cards = doc.querySelector('#review-cards');
 const listStatus = doc.querySelector('#review-list-status'), position = doc.querySelector('#review-position');
 const previous = doc.querySelector('#review-previous'), next = doc.querySelector('#review-next');
 let reviews = [], selected = 0, submissionId = null, awaitingRefresh = false;
 let hovering = false, focused = false, rotationTimer;
 const view = doc.querySelector('#reviews');
 function restartRotation() {
  doc.defaultView.clearInterval(rotationTimer);
  rotationTimer = doc.defaultView.setInterval(()=>{
   if (reviews.length < 2 || doc.hidden || view?.hidden || hovering || focused || doc.querySelector('dialog[open]')) return;
   selected = (selected+1)%reviews.length;render();
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
  const indices = [...new Set([selected-1,selected+1,selected].map(i => (i+reviews.length)%reviews.length))];
  for (const index of indices) {
   const review = reviews[index], card = doc.createElement('article');
   const side = index === selected ? 'selected' : index === (selected-1+reviews.length)%reviews.length ? 'previous' : 'next';
   card.className = 'review-card is-'+side;
   if (side !== 'selected') card.setAttribute('aria-hidden','true');
   const quote = doc.createElement('blockquote');quote.textContent = review.message;
   const name = doc.createElement('h3');name.textContent = review.name || 'Anonymous';
   const detail = doc.createElement('p');detail.className = 'review-card-details';detail.textContent = [review.age ? 'Age: '+review.age : '',review.level ? 'Level: '+review.level : '',review.program ? 'Program: '+review.program : ''].filter(Boolean).join(' · ');
   const content = doc.createElement('div');content.className = 'review-card-content';
   content.append(name,detail,quote);card.append(content);cards.append(card);
  }
  previous.disabled = next.disabled = reviews.length < 2;
  position.textContent = 'Review '+(selected+1)+' of '+reviews.length;
 }
 async function load() {
  if (awaitingRefresh) return;
  if (!connected()) {listStatus.textContent = '';album.hidden = true;return;}
  listStatus.textContent = 'Loading reviews…';
  try {reviews = (await api('reviews')).reviews;render();listStatus.textContent = reviews.length ? '' : 'Be the first to share your experience.';}
  catch {listStatus.textContent = 'Reviews could not be loaded. Please try again later.';}
 }
 previous?.addEventListener('click',()=>{if (!reviews.length) return;selected = (selected-1+reviews.length)%reviews.length;render();restartRotation();});
 next?.addEventListener('click',()=>{if (!reviews.length) return;selected = (selected+1)%reviews.length;render();restartRotation();});
 cards?.addEventListener('keydown',event=>{if (event.key === 'ArrowLeft') previous.click();if (event.key === 'ArrowRight') next.click();});
 opener.addEventListener('click', () => {
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
   awaitingRefresh = true;
   status.textContent = 'Thank you for submitting your review!';form.reset();submissionId = null;
  } catch (error) {status.textContent = error.message || 'Your review could not be shared. Please try again.';}
  finally {button.disabled = false;}
 });
 doc.addEventListener('reviews-changed',load);
 doc.defaultView.addEventListener('hashchange',()=>{if(doc.defaultView.location.hash === '#reviews')load();});
 load();
 return {load};
}
if (typeof document !== 'undefined') initializeReviews(document);
