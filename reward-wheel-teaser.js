import {helpIcon} from './ui-help.js';
import {openPopup} from './popups.js?v=mobile-assessment-page';
export const WHEEL_PRIZES=['10% off your next round','One month of Daily Challenge access','One month of Culture Corner access','One month of Speak Hub access','One month of Bold Blog access'];
// Visible teaser only: no eligibility calls, spin endpoint, forms or voucher emails.
export function initializeRewards(doc){
 const contact=doc.querySelector('#contact');if(!contact||doc.documentElement.dataset.rewardsInitialized)return;doc.documentElement.dataset.rewardsInitialized='true';
 const el=(tag,text,cls)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 const social=contact.querySelector('.contact-whatsapp-actions'),orbit=contact.querySelector('.contact-orbit'),row=el('div','','contact-social-row'),rail=el('aside','','contact-promotion-rail'),launcher=el('button','Share & earn','reward-circle');launcher.type='button';launcher.setAttribute('aria-haspopup','dialog');launcher.setAttribute('aria-label','Share and earn · Stay Tuned');
 if(social){social.before(row);row.append(social,rail);if(orbit)rail.append(orbit);rail.append(launcher,helpIcon(doc,'About Share & Earn','Share & Earn is being prepared. Open the preview to explore rewards; promotions are not open yet.'));const faq=contact.querySelector('.contact-faq');if(faq&&!faq.closest('.contact-faq-footer'))rail.append(faq);}
 const dialog=el('dialog','','reward-dialog action-popup reward-wheel-dialog');dialog.setAttribute('aria-labelledby','reward-wheel-title');const close=el('button','×','popup-close');close.type='button';close.setAttribute('aria-label','Close promotions');close.onclick=()=>dialog.close();
 const title=el('h2','A little boldness. A lovely surprise.');title.id='reward-wheel-title';const note=el('p','A reward wheel is on its way. Take a peek at the prizes—spinning and promotions are not open yet.');
 const covered=el('div','','reward-preview-covered'),content=el('div','','reward-preview-content');content.inert=true;content.setAttribute('aria-hidden','true');const layout=el('div','','reward-preview-layout'),wheel=el('div','','reward-preview-wheel');wheel.setAttribute('aria-hidden','true');for(let i=0;i<5;i++){const number=el('span',String(i+1));number.style.setProperty('--sector',i);wheel.append(number);}wheel.append(el('strong','Speak\nBoldly'));
 const list=el('ol','','reward-preview-prizes');for(const prize of WHEEL_PRIZES)list.append(el('li',prize));layout.append(wheel,list);const spin=el('button','Spin the wheel','button');spin.type='button';spin.disabled=true;content.append(layout,spin,el('p','One earned spin per person each month. Your result stays fixed, and your voucher is sent personally by your coach.'));
 const cover=el('div','','reward-preview-cover'),badge=el('p','Stay Tuned','reward-coming-soon');cover.append(badge,el('p','Promotions are covered for now. Come back when the wheel opens.'));covered.append(content,cover);dialog.append(close,title,note,covered);doc.body.append(dialog);launcher.onclick=()=>openPopup(dialog);
 return{dialog};
}
