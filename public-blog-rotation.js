import {contentRotation,refreshContentRotation} from './shared-content-rotation.js';
const grid=document.querySelector('[data-public-blog-list]');
function paint(){if(!grid)return;const state=contentRotation('blog');grid.querySelectorAll('[data-featured-label]').forEach(n=>n.remove());for(const card of grid.querySelectorAll('[data-blog-post-id]')){const active=state?.active&&card.dataset.blogPostId===state.selectedId;card.classList.toggle('blog-featured',Boolean(active));if(active){const label=document.createElement('p');label.dataset.featuredLabel='true';label.className='eyebrow';label.textContent='Featured article';card.prepend(label);grid.prepend(card);}}}
document.addEventListener('sb-content-rotation-changed',paint);void refreshContentRotation(document).then(paint);
