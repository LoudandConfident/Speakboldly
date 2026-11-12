import {themeForDate} from './seasonal-theme-data.js';
import {seasonalThemeSettings,refreshSeasonalThemes} from './seasonal-theme-settings.js';
export function initializeMonthlyHomeTheme(doc,now=new Date()){
 const hero=doc.querySelector('#home>.hero');if(!hero)return;hero.querySelector('.monthly-home-theme')?.remove();
 const theme=themeForDate(now,seasonalThemeSettings());if(!theme)return;
 const decoration=doc.createElement('aside');decoration.className='monthly-home-theme';decoration.dataset.theme=theme.art;decoration.dataset.copyLength=theme.message.length>60?'long':theme.message.length>28?'medium':'short';decoration.setAttribute('aria-label',theme.label);
 decoration.innerHTML='<svg class="monthly-theme-art" viewBox="0 0 270 215" fill="none" aria-hidden="true"><path d="M52 0v55M218 0v55" stroke="#bca779" stroke-width="2"/><path d="M21 48q114-15 228 0l-5 132q-109 29-218 0Z" fill="#f4dfbb" stroke="#d0ae78" stroke-width="1.5"/><path d="M30 57q106-12 210 0" stroke="#fff8e6" stroke-width="2"/><circle cx="52" cy="55" r="4" fill="#193c32"/><circle cx="218" cy="55" r="4" fill="#193c32"/><path d="M33 170q-18-14-15-33 22 3 26 21-1-29 17-39 11 23-4 42 20-11 34 1-15 18-37 12" fill="#96a76c"/><path d="m30 147 28 36M55 139l-1 37" stroke="#657744"/><path d="M201 168q-12-22 3-36 14 11 10 28 7-25 25-23 2 24-19 35" fill="#c59157"/><path d="m206 145 12 35M231 150l-13 25" stroke="#8c693c"/><path d="M123 178q-8-15 9-19 17 2 11 19" fill="#71844b"/><ellipse cx="132" cy="187" rx="26" ry="22" fill="#cc783c"/><ellipse cx="121" cy="187" rx="12" ry="21" fill="#dc914e"/><ellipse cx="142" cy="187" rx="11" ry="21" fill="#b86131"/><path d="M132 166q-4-10 4-14" stroke="#526341" stroke-width="4" stroke-linecap="round"/><path d="m84 76 3 7 7 1-5 5 1 7-6-4-6 4 1-7-5-5 7-1Z" fill="#c59755"/><path d="m188 85 2 5 5 1-4 3 1 5-4-3-5 3 1-5-4-3 5-1Z" fill="#c59755"/></svg><div class="monthly-theme-copy"><p class="monthly-theme-note"></p><p class="monthly-theme-message"></p></div>';
 decoration.querySelector('.monthly-theme-note').textContent=theme.label;
 decoration.querySelector('.monthly-theme-message').textContent=theme.message;
 if(theme.art!=='thanksgiving'){
 const art=decoration.querySelector('svg'),base=art.innerHTML.split('<path d="M33')[0];
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
 art.innerHTML=base+'<g transform="translate(67 98) scale(.5)">'+(icons[theme.art]||icons.spring)+'</g>';
 }
 hero.append(decoration);
}
if(typeof document!=='undefined'){
 const doc=document,home=doc.querySelector('#home');let loaded=false;
 const refresh=()=>{if(home&&!home.hidden){initializeMonthlyHomeTheme(doc);if(!loaded){loaded=true;void refreshSeasonalThemes(doc);}}};
 doc.addEventListener('seasonal-themes-changed',()=>initializeMonthlyHomeTheme(doc));
 if(home)new MutationObserver(refresh).observe(home,{attributes:true,attributeFilter:['hidden']});
 doc.defaultView.addEventListener('pageshow',()=>initializeMonthlyHomeTheme(doc));
 doc.defaultView.setInterval(()=>{if(home&&!home.hidden)initializeMonthlyHomeTheme(doc);},60000);refresh();
}
