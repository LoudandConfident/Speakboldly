import {ownerConnected,request} from './exam-api.js';
export function initializeReviewManagement(doc,isUnlocked) {
 const panel = doc.querySelector('#review-management');
 if (!panel) return;
 const status = doc.querySelector('#review-management-status'), list = doc.querySelector('#review-management-list');
 async function refresh() {
  list.replaceChildren();
  if (!isUnlocked() || !ownerConnected()) {status.textContent = 'Connect private storage and sign in as the owner to manage public reviews.';return;}
  status.textContent = 'Loading reviews…';
  try {
   const {reviews} = await request('admin/reviews',{role:'admin'});
   if (!isUnlocked()) return;
   status.textContent = reviews.length+' published review'+(reviews.length === 1 ? '' : 's')+'. No approval is required.';
   for (const review of reviews) {
    const row = doc.createElement('article');row.className = 'review-management-row';
    const name = doc.createElement('strong');name.textContent = review.name || 'Anonymous';
    const message = doc.createElement('p');message.textContent = review.message;
    const remove = doc.createElement('button');remove.type = 'button';remove.className = 'button light small';remove.textContent = 'Delete review';
    remove.addEventListener('click', async()=>{
     if (!doc.defaultView.confirm('Delete this review from the website?')) return;
     remove.disabled = true;
     try {await request('admin/reviews/'+review.id,{role:'admin',method:'DELETE'});await refresh();doc.dispatchEvent(new doc.defaultView.CustomEvent('reviews-changed'));}
     catch(error) {status.textContent = error.message;remove.disabled = false;}
    });
    row.append(name,message,remove);list.append(row);
   }
  } catch(error) {status.textContent = error.message;}
 }
 doc.querySelector('#review-management-refresh').addEventListener('click',refresh);
 panel.addEventListener('toggle',()=>{if(panel.open)refresh();});
 return {refresh,lock(){list.replaceChildren();status.textContent = '';panel.open = false;}};
}
