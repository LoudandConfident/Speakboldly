import {helpIcon} from './ui-help.js';
const doc=document;
// Reuse established artwork, retaining the original SVG speech bubbles.
const rail=doc.querySelector('.contact-promotion-rail');if(rail&&!rail.querySelector('.sb-help'))rail.append(helpIcon(doc,'About Share & Earn','Share & Earn is being prepared. Open the preview to explore rewards; promotions are not open yet.'));
const how=doc.querySelector('#how'),copy=how?.querySelector('.how-hero-copy');if(copy){const title=copy.querySelector('h2');if(title){title.textContent='How It Works';const intro=doc.createElement('div');intro.className='how-journey-intro';const heading=doc.createElement('h3');heading.textContent='Your Journey, Step by Step';const note=copy.querySelector('.how-hero-note');intro.append(heading);if(note)intro.append(note);how.querySelector('.how-hero')?.before(intro);}}
for(const node of doc.querySelectorAll('[data-get-code],.get-code'))node.querySelector('.step-number,.how-step-number')?.remove();
const banner=doc.querySelector('#courses .courses-subtitle');if(banner)banner.classList.add('program-two-part-banner');
const reviews=doc.querySelector('#reviews');if(reviews&&!reviews.querySelector('.reviews-divider-art')){const art=reviews.querySelector('.reviews-spark-art')?.cloneNode(true);if(art){art.classList.add('reviews-divider-art');reviews.querySelector('.page-signature')?.before(art);}}
