import {createSeasonalSign} from './monthly-home-theme.js?v=christmas-122';
import {renderSeasonalFlourish} from './seasonal-flourish.js?v=christmas-119';
import {themeForDate} from './seasonal-theme-data.js?v=christmas-122';
import {seasonalThemeSettings,refreshSeasonalThemes} from './seasonal-theme-settings.js?v=christmas-122';

const headings=['#courses .courses-heading','#placement .assessment-preview-heading','#portal-content .learning-space-heading'];
export function initializeSeasonalPages(doc,now=new Date()){
 const theme=themeForDate(now,seasonalThemeSettings());
 for(const selector of headings){
  const heading=doc.querySelector(selector);if(!heading)continue;
  heading.querySelector(':scope>.section-seasonal-decoration')?.remove();heading.classList.toggle('seasonal-page-heading',Boolean(theme));
  if(!theme)continue;
  const decoration=doc.createElement('aside');decoration.className='section-seasonal-decoration';decoration.dataset.theme=theme.art;decoration.setAttribute('aria-label',theme.label);
  const sign=createSeasonalSign(doc,theme);sign.removeAttribute('aria-label');
  const flourish=doc.createElement('span');flourish.className='section-seasonal-flourish';flourish.setAttribute('aria-hidden','true');flourish.innerHTML=renderSeasonalFlourish(theme.art);
  decoration.append(flourish,sign);heading.append(decoration);
 }
}
if(typeof document!=='undefined'){
 const doc=document,win=doc.defaultView;let loaded=false;
 const shown=selector=>{const root=doc.querySelector(selector);return Boolean(root&&!root.hidden);};
 const visible=()=>!doc.hidden&&(shown('#courses')||shown('#placement')||(shown('#students-portal')&&shown('#client-portal')&&shown('#portal-content')));
 const refresh=()=>{if(!visible())return;initializeSeasonalPages(doc);if(!loaded){loaded=true;void refreshSeasonalThemes(doc);}};
 initializeSeasonalPages(doc);doc.addEventListener('seasonal-themes-changed',()=>initializeSeasonalPages(doc));
 for(const id of ['courses','placement','students-portal','client-portal','portal-content']){const root=doc.getElementById(id);if(root)new win.MutationObserver(refresh).observe(root,{attributes:true,attributeFilter:['hidden','class']});}
 win.addEventListener('pageshow',refresh);win.setInterval(refresh,60000);refresh();
}
