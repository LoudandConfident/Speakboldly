export function initializeNavigation(doc,win){
 const views=[...doc.querySelectorAll('[data-view]')];
 const reducedMotion=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 let active=null,transition=null,request=0;
 function showView(){
  const requested=win.location.hash.slice(1).split('/')[0]||'home';
  const next=views.find(v=>v.id===requested)||views.find(v=>v.id==='home');
  if(!next||next===active)return;
  const ticket=++request,animate=active&&!reducedMotion?.matches;
  transition?.skipTransition();
  const update=()=>{
   if(ticket!==request)return;
   views.forEach(v=>{v.hidden=v!==next;v.classList.remove('view-enter');});
   doc.querySelectorAll('[data-open-view]').forEach(b=>{if(b.dataset.openView===next.id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
   active=next;win.scrollTo({top:0,left:0,behavior:'instant'});
  };
  if(animate&&typeof doc.startViewTransition==='function'){
   const current=doc.startViewTransition(update);transition=current;
   current.finished.catch(()=>{}).finally(()=>{if(transition===current)transition=null;});
  }else{update();if(animate)next.classList.add('view-enter');}
 }
 doc.querySelectorAll('[data-open-view]').forEach(b=>b.addEventListener('click',()=>{win.location.hash=b.dataset.openView;}));
 win.addEventListener('hashchange',showView);showView();
 return showView;
}
if(typeof document!=='undefined')initializeNavigation(document,window);
