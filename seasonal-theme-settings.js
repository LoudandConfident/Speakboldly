import {DEFAULT_THEME_SETTINGS,validateThemeSchedule} from './seasonal-theme-data.js';
let current=DEFAULT_THEME_SETTINGS,pending;
export const seasonalThemeSettings=()=>current;
export function setSeasonalThemeSettings(settings,doc){if(!settings||!['automatic','off'].includes(settings.mode))throw Error('Invalid theme settings.');const schedule=settings.schedule?.length?validateThemeSchedule(settings.schedule):DEFAULT_THEME_SETTINGS.schedule;current={revision:String(settings.revision||'0'),mode:settings.mode,schedule};doc?.dispatchEvent(new doc.defaultView.Event('seasonal-themes-changed'));return current;}
export async function refreshSeasonalThemes(doc){
 if(pending)return pending;const endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue;if(!endpoint)return current;
 const win=doc.defaultView,controller=new win.AbortController(),timer=win.setTimeout(()=>controller.abort(),6000);
 pending=(async()=>{try{const response=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'homepageThemes'}),signal:controller.signal});const data=await response.json();if(response.ok&&data.ok&&data.settings)setSeasonalThemeSettings(data.settings,doc);}catch{}finally{win.clearTimeout(timer);pending=null;}return current;})();return pending;
}
