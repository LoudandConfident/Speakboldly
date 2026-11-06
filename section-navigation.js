const views=new Set(['home','vision','how','courses','programs','placement','assessment','learner-profile','learner-results','reviews','students-portal','boldly-notes','contact','quote','speak-hub','join-team','daily-quote']);
const panels=new Set(['contact','monthly','mission','studio','calendar','material','exercises','exams','listening','accent']);
export function sectionUrl(win,destination){const url=new URL('/',win.location.href);url.hash=destination.startsWith('#')?destination.slice(1):destination;return url.href;}
export function openSection(doc,destination){const win=doc.defaultView;const tab=win.open(sectionUrl(win,destination),'_blank');if(!tab)return false;try{tab.opener=null;}catch{}doc.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());return true;}
export function initializeSectionLinks(doc,win){
 try{if(!win.location.hash&&win.location.pathname==='/'&&!win.location.search){const saved=win.localStorage.getItem('sb-last-section');if(/^#(?:home|vision|how|courses|placement|reviews|students-portal|boldly-notes|contact|quote|speak-hub|join-team|daily-quote)(?:\/[a-zA-Z0-9_-]+)*$/.test(saved||'')){win.history.replaceState(null,'',saved);win.queueMicrotask(()=>win.dispatchEvent(new win.Event('hashchange')));}}}catch{}
 const current=()=>win.location.hash.replace(/^#/,'').split('/')[0]||'home';
 doc.addEventListener('click',event=>{const node=event.target.closest?.('[data-open-view],[data-portal-tab],[data-learning-open],[data-learning-back],a[href]');if(!node||!event.isTrusted||event.defaultPrevented||event.button>0)return;let destination;
 if(node.hasAttribute('data-learning-back'))destination='students-portal/student';
 else if(node.dataset.learningOpen)destination='students-portal/student/'+node.dataset.learningOpen;
 else if(node.dataset.portalTab&&panels.has(node.dataset.portalTab))destination='students-portal/student/'+node.dataset.portalTab;
 else if(node.dataset.openView)destination=node.dataset.openView==='programs'?'courses':node.dataset.openView;
 else if(node.tagName==='A'){const url=new URL(node.href,win.location.href);if(url.origin!==win.location.origin)return;if(url.hash)destination=url.hash.slice(1);else{const routes={'/':'home','/vision/':'vision','/how-it-works/':'how','/programs/':'courses','/assessments/':'placement','/reviews/':'reviews','/student-portal/':'students-portal','/blog/':'boldly-notes','/learn/daily-quotes/':'daily-quote','/contact/':'contact','/get-a-quote/':'quote','/join-us/':'join-team','/speak-hub/':'speak-hub'};destination=routes[url.pathname];}}
 if(!destination||!views.has(destination.split('/')[0])||destination==='home'&&current()==='home')return;
 const activePanel=doc.querySelector('[data-portal-tab][aria-selected=true]')?.dataset.portalTab;
 if((destination===current()&&!(destination==='students-portal'&&activePanel))||(node.dataset.portalTab&&node.dataset.portalTab===activePanel))return;
 if((event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)&&node.tagName==='A'){doc.querySelectorAll('dialog[open]').forEach(dialog=>dialog.close());return;}
 event.preventDefault();event.stopImmediatePropagation();if(!openSection(doc,destination)){let notice=doc.querySelector('#section-navigation-status');if(!notice){notice=doc.createElement('p');notice.id='section-navigation-status';notice.setAttribute('role','alert');doc.body.append(notice);}notice.textContent='Allow new tabs for Speak Boldly, then try again. Your current page is unchanged.';}
 },true);
 const remember=()=>{try{win.localStorage.setItem('sb-last-section',win.location.hash||'#home');}catch{}};
 win.addEventListener('hashchange',remember);win.addEventListener('pagehide',remember);remember();
}
