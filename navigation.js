export function initializeNavigation(doc,win){
 doc.querySelector('.sb-method-illustrated-button')?.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.currentTarget.dispatchEvent(new win.MouseEvent('click',{bubbles:true}));}});
 const menu=doc.querySelector('.mobile-menu-toggle'),nav=doc.querySelector('#main-navigation');
 function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('mobile-open');}
 menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('mobile-open',open);});
 doc.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
 doc.addEventListener('click',event=>{if(menu?.getAttribute('aria-expanded')==='true'&&!event.target.closest('header'))closeMenu();});
 win.addEventListener('hashchange',closeMenu);
 const reducedMotion=win.matchMedia?.('(prefers-reduced-motion: reduce)');
 const down=doc.querySelector('#page-down-arrow');
 function updateDownArrow(){if(down)down.hidden=doc.documentElement.scrollHeight-win.innerHeight-win.scrollY<=12;}
 down?.addEventListener('click',()=>win.scrollTo({top:doc.documentElement.scrollHeight,behavior:reducedMotion?.matches?'instant':'smooth'}));
 win.addEventListener('scroll',updateDownArrow,{passive:true});win.addEventListener('resize',updateDownArrow);
 if(down&&win.ResizeObserver){const sizeObserver=new win.ResizeObserver(updateDownArrow);sizeObserver.observe(doc.querySelector('main')||doc.body);}
 const trail=[];const back=doc.createElement('a');back.id='page-back-arrow';back.className='plain-back-arrow';back.setAttribute('aria-label','Back to previous page');back.innerHTML='<svg viewBox="0 0 40 26" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M35 13H5m11-9L5 13l11 9"/></svg>';back.hidden=true;doc.querySelector('main')?.prepend(back);
 const headings=new Map();for(const view of doc.querySelectorAll('[data-view]')){if(view.id==='home')continue;let row,title;if(view.id==='boldly-notes'){row=view.querySelector('.bold-blog-masthead');title=row?.querySelector('h2');}else{row=doc.createElement('div');title=view.id==='students-portal'?view.querySelector(':scope>.eyebrow'):view.id==='placement'?view.querySelector('.eyebrow'):view.querySelector('h2');view.prepend(row);if(title)row.append(title);}row.classList.add('sb-page-heading');if(title){title.classList.remove('sb-page-intro-title');title.classList.add('sb-page-title');}headings.set(view.id,row);}
 let active=null,transition=null,request=0;
 function showView(){
  const views=[...doc.querySelectorAll('[data-view]')];
  const requested=win.location.hash.slice(1).split('/')[0]||'home';
  const destination=requested==='programs'?'courses':requested;
  const next=views.find(v=>v.id===destination)||views.find(v=>v.id==='home');
  if(!next||next===active)return;
  const ticket=++request,animate=active&&!reducedMotion?.matches;
  transition?.skipTransition();
  const update=()=>{
   if(ticket!==request)return;
   views.forEach(v=>{v.hidden=v!==next;v.classList.remove('view-enter');});
   doc.querySelectorAll('[data-open-view]').forEach(b=>{if(b.dataset.openView===(['assessment','learner-profile','learner-results'].includes(next.id)?'placement':next.id)||(b.closest('#main-navigation')&&b.dataset.openView==='programs'&&next.id==='courses'))b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});
   if(trail.at(-1)!==next.id){if(trail.at(-2)===next.id)trail.pop();else trail.push(next.id);}
   const parent=['assessment','learner-profile','learner-results'].includes(next.id)?'placement':'home';back.href='#'+(trail.at(-2)||parent);back.hidden=next.id==='home';
   const heading=headings.get(next.id);if(heading)heading.prepend(back);else doc.querySelector('main')?.prepend(back);active=next;const resetScroll=()=>{if(ticket===request)win.scrollTo({top:0,left:0,behavior:'instant'});};resetScroll();win.requestAnimationFrame(()=>win.requestAnimationFrame(resetScroll));updateDownArrow();
  };
  if(animate&&typeof doc.startViewTransition==='function'){
   const current=doc.startViewTransition(update);transition=current;
   current.finished.catch(()=>{}).finally(()=>{if(transition===current)transition=null;});
  }else{update();if(animate)next.classList.add('view-enter');}
 }
 doc.querySelectorAll('[data-open-view]').forEach(b=>b.addEventListener('click',event=>{if(b.tagName==='A'){if(event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;event.preventDefault();}win.location.hash=b.dataset.openView;closeMenu();}));
 win.addEventListener('hashchange',showView);showView();
 return showView;
}
if(typeof document!=='undefined')initializeNavigation(document,window);



