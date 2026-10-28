export const PUBLIC_TAB_ROUTES={
 home:{path:'/',title:'Speak Boldly | English Language Coaching'},
 vision:{path:'/vision/',title:'Our Vision | Speak Boldly'},
 how:{path:'/how-it-works/',title:'The SB Method | Speak Boldly'},
 courses:{path:'/programs/',title:'English Programs | Speak Boldly'},
 placement:{path:'/assessments/',title:'English Assessments | Speak Boldly'},
 reviews:{path:'/reviews/',title:'Reviews | Speak Boldly'},
 'students-portal':{path:'/student-portal/',title:'Student Dashboard | Speak Boldly'},
 'boldly-notes':{path:'/blog/',title:'Bold Blog from Speak Boldly English Language Coaching'},
 'daily-quote':{path:'/learn/daily-quotes/',title:'Daily Motivation | Speak Boldly'},
 quote:{path:'/get-a-quote/',title:'Get a Quote | Speak Boldly'},
 'join-team':{path:'/join-us/',title:'Join Us | Speak Boldly'},
 contact:{path:'/contact/',title:'Contact Speak Boldly'}
};
export function publicTabTarget(hash,{pathname='/',motivationUrl=''}={}){
 const parts=String(hash).replace(/^#/,'').split('/'),view=parts[0]||'home';
 if(view==='daily-quote'&&motivationUrl)return motivationUrl;
 if(view==='boldly-notes'&&parts[1]&&/^[a-zA-Z0-9_-]+$/.test(parts[1]))return '/blog/'+parts[1]+'/';
 // Preserve existing course and free-resource deep links inside their own views.
 if(view==='courses'&&/^\/programs\/[a-z0-9-]+\/$/.test(pathname))return pathname;
 if(view==='students-portal'&&['/learn/','/learn/daily-idioms/','/learn/daily-challenges/'].includes(pathname))return pathname;
 return PUBLIC_TAB_ROUTES[view]?.path||null;
}
export function initializePublicTabAddresses(doc,win){
 function sync(){const hash=win.location.hash,view=hash.slice(1).split('/')[0]||'home',motivationUrl=doc.querySelector('#daily-quote')?.dataset.publicShareUrl,target=publicTabTarget(hash,{pathname:win.location.pathname,motivationUrl});if(!target)return;const url=new URL(target,win.location.origin);if(url.origin!=='https://speakboldly.space'&&url.origin!==win.location.origin)return;
  if(!target.includes('?')&&view!=='daily-quote'){const search=new URLSearchParams(win.location.search);for(const key of ['motivation-entry','daily-motivation','motivation'])search.delete(key);url.search=search.toString();}url.hash=hash;
  const destination=url.pathname+url.search+url.hash;if(win.location.pathname+win.location.search+win.location.hash!==destination)win.history.replaceState(null,'',destination);
  const title=PUBLIC_TAB_ROUTES[view]?.title;if(title)doc.title=view==='boldly-notes'&&hash.includes('/')?title+' | '+(doc.querySelector('[data-notes-reader]>h2')?.textContent||'Read the blog'):title;
 }
 const later=()=>win.queueMicrotask(sync);win.addEventListener('hashchange',later);doc.addEventListener('sb-public-share-url',later);later();
}
if(typeof document!=='undefined')initializePublicTabAddresses(document,window);
