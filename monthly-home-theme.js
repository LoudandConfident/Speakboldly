import {renderSeasonalFlourish} from './seasonal-flourish.js?v=1';
import {themeForDate} from './seasonal-theme-data.js';
import {seasonalThemeSettings,refreshSeasonalThemes} from './seasonal-theme-settings.js';
export function createSeasonalSign(doc,theme){
 const decoration=doc.createElement('aside');decoration.className='monthly-home-theme';decoration.dataset.theme=theme.art;decoration.dataset.copyLength=theme.message.length>60?'long':theme.message.length>28?'medium':'short';decoration.setAttribute('aria-label',theme.label);
 decoration.innerHTML='<svg class="monthly-theme-art" viewBox="0 0 270 200" fill="none" aria-hidden="true"><path d="M58 0q-2 22 0 48M212 0q2 22 0 48" stroke="#a59470" stroke-width="1.4"/><path d="M24 40q111-9 222 0v135q-111 24-222 0Z" fill="#f8f4e7" stroke="#c0b18f" stroke-width=".8"/><path d="M33 48q103-7 204 0v121q-102 20-204 0Z" stroke="#d6c9ab" stroke-width=".65"/><circle cx="58" cy="48" r="3.7" fill="#b39a64"/><circle cx="212" cy="48" r="3.7" fill="#b39a64"/><circle cx="58" cy="48" r="1.8" fill="#6c7054"/><circle cx="212" cy="48" r="1.8" fill="#6c7054"/></svg><div class="monthly-theme-copy"><span class="monthly-theme-note"></span><span class="monthly-theme-message"></span></div>';
 const label=decoration.querySelector('.monthly-theme-note');label.textContent=theme.label;
 const thanksgiving=theme.art==='thanksgiving'&&/^happy thanksgiving$/i.test(theme.label.trim());
 if(thanksgiving)decoration.classList.add('seasonal-thanksgiving');
 const message=decoration.querySelector('.monthly-theme-message');message.textContent=thanksgiving?'':theme.message;message.hidden=thanksgiving;
 if(theme.art!=='thanksgiving'){
 const art=decoration.querySelector('svg');
 const icons={
 christmas:'<path d="m134 137-24 27h13l-23 25h68l-23-25h13Z" fill="#59754a"/><path d="M134 185v17" stroke="#88663e" stroke-width="5"/><path d="m134 128 3 6 7 1-5 4 1 7-6-3-6 3 1-7-5-4 7-1Z" fill="#c49b4b"/><circle cx="126" cy="173" r="3" fill="#c88664"/><circle cx="143" cy="182" r="3" fill="#e6cf8c"/>',
 winter:'<g stroke="#769c9f" stroke-width="3" stroke-linecap="round"><path d="M134 153v49m-21-37 42 25m0-25-42 25M128 157l6 6 6-6M128 198l6-6 6 6m-24-27 8-2v-8m28 24-8 2v8m-28-9 8 2v8m28-25-8-2v-8"/></g>',
 valentine:'<path d="M134 199c-47-28-28-58 0-35 28-23 47 7 0 35Z" fill="#b87371"/>',
 mothers:'<g fill="#c08a98"><ellipse cx="134" cy="168" rx="9" ry="16"/><ellipse cx="134" cy="168" rx="9" ry="16" transform="rotate(60 134 168)"/><ellipse cx="134" cy="168" rx="9" ry="16" transform="rotate(120 134 168)"/></g><circle cx="134" cy="168" r="7" fill="#f1d99b"/><path d="M134 181v24m0-6q-22 0-21-16 19 1 21 16" stroke="#7b935d" fill="#7b935d"/>',
 summer:'<circle cx="134" cy="177" r="17" fill="#d3a452"/><path d="M134 148v-7m0 65v7m-29-36h-7m65 0h7m-56-20-5-5m45 45 5 5m-45-5-5 5m45-45 5-5" stroke="#c69a4e" stroke-width="3"/>',
 'new-year':'<path d="m134 152 7 15 17 2-12 12 3 17-15-8-15 8 3-17-12-12 17-2Z" fill="#c9a451"/><path d="m104 145-5-7m65 7 5-7m-67 64-6 5m70-5 6 5" stroke="#9ba96b" stroke-width="3"/>',
 'april-fools':'<path d="M110 192q24-12 48 0l-4-28-18 10-12-20-8 27-10-15Z" fill="#b78c64"/><circle cx="124" cy="154" r="4" fill="#879c60"/><circle cx="154" cy="164" r="4" fill="#879c60"/>',
 spring:'<path d="M134 204v-35m0 23q-25-4-21-23 21 2 21 23m0-12q24 0 22-19-20-1-22 19" stroke="#809762" fill="#99ae75"/>',
 autumn:'<path d="M134 202q-38-32-13-47l13 13 13-13q25 15-13 47Z" fill="#c08b56"/><path d="M134 170v36" stroke="#7b7747" stroke-width="2"/>'};
 art.insertAdjacentHTML('beforeend','<g transform="translate(67 90) scale(.5)">'+(icons[theme.art]||icons.spring)+'</g>');
 }
 return decoration;
}
export function initializeMonthlyHomeTheme(doc,now=new Date()){
 const hero=doc.querySelector('#home>.hero');if(!hero)return;hero.querySelector('.monthly-home-theme')?.remove();hero.querySelector('.home-seasonal-flourish')?.remove();
 const theme=themeForDate(now,seasonalThemeSettings());if(!theme)return;
 const sign=createSeasonalSign(doc,theme);sign.classList.add('home-seasonal-tag');
 const art=sign.querySelector('.monthly-theme-art'),accent=art.querySelector(':scope>g')?.cloneNode(true);art.setAttribute('viewBox','0 0 270 180');
 const greenPanel=theme.art==='thanksgiving';
 art.innerHTML='<defs><linearGradient id="home-sign-wood" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#b79a70"/><stop offset=".45" stop-color="#9d8057"/><stop offset="1" stop-color="#806441"/></linearGradient><linearGradient id="home-sign-panel" x1="0" y1="0" x2="1" y2="1"><stop stop-color="'+(greenPanel?'#496052':'#e6dfcb')+'"/><stop offset="1" stop-color="'+(greenPanel?'#2e493d':'#d7ceb7')+'"/></linearGradient></defs><path d="M66 0v39M204 0v39" stroke="#baaa8b" stroke-width="1.3"/><rect x="19" y="30" width="232" height="130" rx="3" fill="url(#home-sign-wood)" stroke="#725b3f" stroke-opacity=".65" stroke-width=".8"/><path d="M23 34h224M23 34v122" stroke="#d0b38a" stroke-opacity=".65" stroke-width=".8"/><rect x="28" y="39" width="214" height="112" rx="1" fill="url(#home-sign-panel)" stroke="#5e5f46" stroke-width=".8"/><path d="M28 151h214M242 39v112" stroke="#d1b68e" stroke-opacity=".45" stroke-width=".7"/><circle cx="66" cy="35" r="2.2" fill="#7f694c"/><circle cx="204" cy="35" r="2.2" fill="#7f694c"/>';
 if(accent){accent.setAttribute('transform','translate(73 55) scale(.46)');art.append(accent);}
 hero.append(sign);
 const actions=hero.querySelector('.home-action-stack');if(actions){const flourish=doc.createElement('span');flourish.className='home-seasonal-flourish';flourish.dataset.theme=theme.art;flourish.setAttribute('aria-hidden','true');flourish.innerHTML=renderSeasonalFlourish(theme.art);actions.append(flourish);}
}
if(typeof document!=='undefined'){
 const doc=document,home=doc.querySelector('#home');let loaded=false;
 const refresh=()=>{if(home&&!home.hidden){initializeMonthlyHomeTheme(doc);if(!loaded){loaded=true;void refreshSeasonalThemes(doc);}}};
 doc.addEventListener('seasonal-themes-changed',()=>initializeMonthlyHomeTheme(doc));
 if(home)new MutationObserver(refresh).observe(home,{attributes:true,attributeFilter:['hidden']});
 doc.defaultView.addEventListener('pageshow',()=>initializeMonthlyHomeTheme(doc));
 doc.defaultView.setInterval(()=>{if(home&&!home.hidden)initializeMonthlyHomeTheme(doc);},60000);refresh();
}
