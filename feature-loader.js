// Large portal and practice modules are fetched only when their page is opened.
export function initializeFeatureLoader(doc,win){
 const groups={
  'students-portal':['./learning-hub-entry.js?v=fast-open-1'],
  'assessment':['./placement-assessment.js?v=performance-1'],
  'reviews':['./reviews.js?v=honest-feedback-1'],
  'daily-quote':['./home-gallery.js?v=fast-open-1'],
  'learner-profile':['./learner-profile.js?v=two-line-footer-1'],
  'learner-results':['./learner-profile.js?v=two-line-footer-1'],
  'boldly-notes':['./boldly-notes.js?v=anonymous-1']
 };
 const pending=new Map();let adminReady=false,missionReady=false;
 async function optional(module,label){const root=doc.getElementById('students-portal');const notice=doc.createElement('p');notice.className='sb-loading';notice.setAttribute('role','status');notice.setAttribute('aria-label',label);root.prepend(notice);try{await import(module);notice.remove();return true;}catch{notice.className='';notice.textContent=label+' could not load. Please try again.';return false;}}
 let adminPending=null,missionPending=null;
 async function ensureAdmin(){if(adminReady)return true;if(!adminPending)adminPending=optional('./admin-portal.js?v=fast-open-1','Instructor dashboard').then(ok=>{adminReady=ok;adminPending=null;return ok;});return adminPending;}
 doc.addEventListener('click',async event=>{const button=event.target.closest?.('[data-portal-area="admin"]');if(!button||adminReady)return;event.preventDefault();event.stopImmediatePropagation();if(await ensureAdmin()&&win.location.hash.startsWith('#students-portal'))button.click();},true);
 doc.addEventListener('daily-mission-open',async event=>{if(missionReady)return;event.stopImmediatePropagation();if(!missionPending)missionPending=optional('./daily-mission.js?v=dictation-per-sentence-1','Daily Challenge').then(ok=>{missionReady=ok;missionPending=null;return ok;});if(await missionPending&&doc.querySelector('[data-portal-tab="mission"]')?.getAttribute('aria-selected')==='true')doc.dispatchEvent(new win.Event('daily-mission-open'));},true);
 async function assessment(){const root=doc.getElementById('assessment');if(!root)return;if(pending.has('assessment'))return;const note=doc.createElement('p');note.className='sb-loading';note.setAttribute('role','status');note.setAttribute('aria-label','Loading assessment');doc.getElementById('placement-form').prepend(note);const task=import('./placement-assessment.js?v=performance-1');pending.set('assessment',task);try{await task;note.remove();}catch{pending.delete('assessment');note.className='';note.textContent='The assessment could not load. ';const retry=doc.createElement('button');retry.type='button';retry.className='button light small';retry.textContent='Try again';retry.onclick=()=>{note.remove();assessment();};note.append(retry);}}
 doc.addEventListener('assessment-open',assessment);

 async function load(){const key=win.location.hash.slice(1).split('/')[0],modules=groups[key];if(key==='assessment'){void assessment();return;}if(key==='students-portal'&&win.location.hash.endsWith('/teacher'))void ensureAdmin();if(!modules||pending.has(key))return;const root=doc.getElementById(key);if(!root)return;const spinner=doc.createElement('p');spinner.className='sb-loading';spinner.dataset.loading='true';spinner.setAttribute('role','status');spinner.setAttribute('aria-label','Loading');root.prepend(spinner);const buttons=key==='students-portal'?[...root.querySelectorAll('[data-portal-area]')]:[];buttons.forEach(b=>b.disabled=true);
 const task=Promise.all(modules.map(module=>import(module)));pending.set(key,task);try{await task;buttons.forEach(b=>b.disabled=false);if(key==='students-portal'&&['#students-portal/student','#students-portal/calendar'].includes(win.location.hash)&&root.querySelector('#client-portal')?.hidden)root.querySelector('[data-portal-area=client]')?.click();if(key==='students-portal'&&win.location.hash.endsWith('/teacher')&&await ensureAdmin())root.querySelector('[data-portal-area=admin]')?.click();spinner.remove();}catch{pending.delete(key);spinner.className='';delete spinner.dataset.loading;spinner.textContent='This section could not load. ';const retry=doc.createElement('button');retry.type='button';retry.className='button light small';retry.textContent='Try again';retry.onclick=()=>{spinner.remove();void load();};spinner.append(retry);}finally{buttons.forEach(b=>b.disabled=false);}}
 win.addEventListener('hashchange',load);void load();if(doc.querySelector('#assessment-dialog')?.open)void assessment();
}
if(typeof document!=='undefined')initializeFeatureLoader(document,window);
