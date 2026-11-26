// Teaching-space branding follows Cairo dates; Beyond keeps its own identity.
const standard={season:'standard',logo:'/sb-logo-green.svg?v=dark-green',icon:'/favicon.svg?v=transparent-99',type:'image/svg+xml',sizes:'any'};
const christmas={season:'christmas',logo:'/images/sb-christmas-logo-119.png',icon:'/images/sb-christmas-favicon-119.png',type:'image/png',sizes:'64x64'};
export function speakBoldlyBrandForDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),part=type=>parts.find(x=>x.type===type).value;
 return Number(part('year'))>=2026&&part('month')+'-'+part('day')>='11-30'?christmas:standard;
}
export function applySpeakBoldlyBrand(doc,now=new Date()){
 const brand=speakBoldlyBrandForDate(now);
 for(const logo of doc.querySelectorAll('.header-sb-logo,[data-sb-seasonal-logo]')){
  if(logo.getAttribute('src')!==brand.logo)logo.setAttribute('src',brand.logo);
  logo.dataset.brandSeason=brand.season;
 }
 const blog=doc.getElementById('boldly-notes');
 if(doc.body.classList.contains('beyond-blog-active')||(blog&&!blog.hidden)||/^\/(?:literatespace|beyond-words)(?:\/|$)/.test(doc.defaultView.location.pathname))return brand;
 let icons=[...doc.head.querySelectorAll('link[rel~="icon"]')];
 if(!icons.length){const icon=doc.createElement('link');icon.rel='icon';doc.head.append(icon);icons=[icon];}
 for(const icon of icons){if(icon.getAttribute('href')!==brand.icon)icon.setAttribute('href',brand.icon);icon.type=brand.type;icon.sizes=brand.sizes;}
 return brand;
}
export function initializeSeasonalBrand(doc){
 const win=doc.defaultView;let lastDay='';
 const refresh=()=>{
  const now=new Date(),day=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(now);
  applySpeakBoldlyBrand(doc,now);
  if(lastDay&&day!==lastDay)doc.dispatchEvent(new win.Event('seasonal-themes-changed'));
  lastDay=day;
 };
 // Align to the next minute so an open page changes at Cairo midnight too.
 const tick=()=>{refresh();win.setTimeout(tick,60000-Date.now()%60000+20);};
 win.addEventListener('pageshow',refresh);win.addEventListener('hashchange',refresh);
 doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)refresh();});tick();
}
if(typeof document!=='undefined')initializeSeasonalBrand(document);
