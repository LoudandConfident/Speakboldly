// Large portal and practice modules are fetched only when their page is opened.
export function initializeFeatureLoader(doc,win){
 const groups={
  'students-portal':['./daily-mission.js?v=library-folders','./student-portal.js?v=documents-sessions-1','./admin-portal.js?v=domain-email-routing'],
  'reviews':['./reviews.js?v=library-folders'],
  'daily-quote':['./home-gallery.js?v=domain-email-routing'],
  'learner-profile':['./learner-profile.js?v=ordered-question-numbers-1'],
  'learner-results':['./learner-profile.js?v=ordered-question-numbers-1'],
  'boldly-notes':[]
 };
 const pending=new Map();
 async function load(){const key=win.location.hash.slice(1).split('/')[0],modules=groups[key];if(!modules||pending.has(key))return;const root=doc.getElementById(key);if(!root)return;const spinner=doc.createElement('p');spinner.className='sb-loading';spinner.dataset.loading='true';spinner.setAttribute('role','status');spinner.setAttribute('aria-label','Loading');root.prepend(spinner);const buttons=key==='students-portal'?[...root.querySelectorAll('[data-portal-area]')]:[];buttons.forEach(b=>b.disabled=true);
 const task=Promise.all(modules.map(module=>import(module)));pending.set(key,task);try{await task;buttons.forEach(b=>b.disabled=false);if(key==='students-portal'&&['#students-portal/student','#students-portal/calendar'].includes(win.location.hash)&&root.querySelector('#client-portal')?.hidden)root.querySelector('[data-portal-area=client]')?.click();spinner.remove();}catch{pending.delete(key);spinner.className='';delete spinner.dataset.loading;spinner.textContent='This section could not load. ';const retry=doc.createElement('button');retry.type='button';retry.className='button light small';retry.textContent='Try again';retry.onclick=()=>{spinner.remove();void load();};spinner.append(retry);}finally{buttons.forEach(b=>b.disabled=false);}}
 win.addEventListener('hashchange',load);void load();
}
if(typeof document!=='undefined')initializeFeatureLoader(document,window);
