import './seasonal-brand.js?v=christmas-122';
import './home-header-doodles.js?v=christmas-122';
import './monthly-home-theme.js?v=christmas-122';
import './seasonal-pages.js?v=christmas-122';
import './program-offer.js?v=christmas-122';
import './beyond-brand.js?v=monthly-edit-122';
import './learning-card-groups.js?v=balanced-60';
import './teaching-refinements.js?v=same-tab-112';
import {initializeFixedPageHelp} from './fixed-page-help.js?v=70';
import {helpIcon} from './ui-help.js';
const doc=document;
// Reuse established artwork, retaining the original SVG speech bubbles.
const rail=doc.querySelector('.contact-promotion-rail');if(rail&&!rail.querySelector('.sb-help'))rail.append(helpIcon(doc,'About Share & Earn','Share a public Speak Boldly link, spin for a discount or a practice pack, and send your result and proof to your coach on WhatsApp. One approved reward per person each month.'));
const how=doc.querySelector('#how'),copy=how?.querySelector('.how-hero-copy');if(how&&copy){const title=how.querySelector('.sb-page-title')||copy.querySelector('h2');if(title)title.remove();how.querySelectorAll('.how-hero-note').forEach(note=>note.remove());if(!how.querySelector('.how-journey-intro')){const intro=doc.createElement('div');intro.className='how-journey-intro';const heading=doc.createElement('h3');heading.textContent='Your Journey, Step by Step';intro.append(heading);how.querySelector('.how-hero')?.before(intro);}}
// Corner help positions are fixed by CSS, independent of scrolling.

for(const node of doc.querySelectorAll('[data-get-code],.get-code'))node.querySelector('.step-number,.how-step-number')?.remove();
const banner=doc.querySelector('#courses .courses-subtitle');if(banner)banner.classList.add('program-two-part-banner');
const reviews=doc.querySelector('#reviews');if(reviews&&!reviews.querySelector('.reviews-divider-art')){const art=reviews.querySelector('.reviews-spark-art')?.cloneNode(true);if(art){art.classList.add('reviews-divider-art');reviews.querySelector('.page-signature')?.before(art);}}

initializeFixedPageHelp(document);
