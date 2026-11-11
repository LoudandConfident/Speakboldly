// Dormant reader scaffold. The teaser page never imports this module.
// Supply approved chapters and explicitly enable it only when publication is intended.
export function mountReadingRoom(host,{enabled=false,chapters=[],title='Beyond Words',storageKey='beyond-words:reading:v1'}={}){
 if(!enabled||!Array.isArray(chapters)||!chapters.length)return null;
 const doc=host.ownerDocument,win=doc.defaultView;
 const book=chapters.filter(chapter=>chapter&&typeof chapter.id==='string'&&typeof chapter.title==='string'&&Array.isArray(chapter.paragraphs)&&chapter.paragraphs.every(p=>typeof p==='string'));
 if(!book.length||new Set(book.map(chapter=>chapter.id)).size!==book.length)throw Error('Provide uniquely identified chapters with text paragraphs.');
 const make=(tag,cls,text)=>{const el=doc.createElement(tag);if(cls)el.className=cls;if(text)el.textContent=text;return el;};
 let state={chapter:book[0].id,size:18,theme:'light',progress:0};
 try{const saved=JSON.parse(win.localStorage.getItem(storageKey)||'null');if(saved){if(book.some(ch=>ch.id===saved.chapter))state.chapter=saved.chapter;if(Number.isFinite(saved.size))state.size=Math.min(24,Math.max(16,saved.size));if(saved.theme==='dark')state.theme='dark';if(Number.isFinite(saved.progress))state.progress=Math.min(1,Math.max(0,saved.progress));}}catch{}
 const shell=make('section','reading-room'),bar=make('header','reader-bar'),bookTitle=make('span','reader-book-title',title),controls=make('div','reader-controls');
 controls.setAttribute('role','group');controls.setAttribute('aria-label','Reading preferences');
 const smaller=make('button',null,'A−'),larger=make('button',null,'A+'),theme=make('button','reader-theme-toggle');
 for(const button of [smaller,larger,theme])button.type='button';smaller.setAttribute('aria-label','Decrease text size');larger.setAttribute('aria-label','Increase text size');controls.append(smaller,larger,theme);bar.append(bookTitle,controls);
 const layout=make('div','reader-layout'),toc=make('details','reader-toc'),summary=make('summary',null,'Chapters'),nav=make('nav');nav.setAttribute('aria-label','Book chapters');toc.append(summary,nav);toc.open=win.innerWidth>760;
 const article=make('article','reader-chapter');article.tabIndex=-1;const number=make('p','reader-chapter-number'),heading=make('h1'),body=make('div','reader-prose'),chapterNav=make('nav','reader-chapter-navigation');chapterNav.setAttribute('aria-label','Chapter navigation');
 const previous=make('button',null,'← Previous chapter'),next=make('button',null,'Next chapter →');previous.type=next.type='button';chapterNav.append(previous,next);article.append(number,heading,body,chapterNav);layout.append(toc,article);shell.append(bar,layout);
 const links=book.map(chapter=>{const button=make('button','reader-toc-link',chapter.title);button.type='button';button.onclick=()=>select(chapter.id);nav.append(button);return button;});
 function persist(){try{win.localStorage.setItem(storageKey,JSON.stringify(state));}catch{}}
 function preferences(){shell.dataset.theme=state.theme;shell.style.setProperty('--reader-size',state.size+'px');smaller.disabled=state.size<=16;larger.disabled=state.size>=24;theme.textContent=state.theme==='light'?'Dark mode':'Light mode';theme.setAttribute('aria-label','Switch to '+(state.theme==='light'?'dark':'light')+' reading mode');}
 function restore(){win.requestAnimationFrame(()=>{const top=article.getBoundingClientRect().top+win.scrollY;win.scrollTo({top:Math.max(0,top-28+state.progress*Math.max(0,article.offsetHeight-win.innerHeight+56)),behavior:'instant'});});}
 function render(){const index=book.findIndex(chapter=>chapter.id===state.chapter),chapter=book[index];number.textContent='Chapter '+(index+1)+' of '+book.length;heading.textContent=chapter.title;body.replaceChildren(...chapter.paragraphs.map(p=>make('p',null,p)));previous.disabled=index===0;next.disabled=index===book.length-1;links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','page');else link.removeAttribute('aria-current');});preferences();}
 function select(id){state.chapter=id;state.progress=0;render();persist();if(win.innerWidth<=760)toc.open=false;article.focus({preventScroll:true});restore();}
 smaller.onclick=()=>{state.size=Math.max(16,state.size-1);preferences();persist();};larger.onclick=()=>{state.size=Math.min(24,state.size+1);preferences();persist();};theme.onclick=()=>{state.theme=state.theme==='light'?'dark':'light';preferences();persist();};previous.onclick=()=>{const i=book.findIndex(ch=>ch.id===state.chapter);if(i>0)select(book[i-1].id);};next.onclick=()=>{const i=book.findIndex(ch=>ch.id===state.chapter);if(i<book.length-1)select(book[i+1].id);};
 let timer;function rememberPosition(){win.clearTimeout(timer);timer=win.setTimeout(()=>{const distance=win.scrollY-(article.getBoundingClientRect().top+win.scrollY-28);state.progress=Math.min(1,Math.max(0,distance/Math.max(1,article.offsetHeight-win.innerHeight+56)));persist();},180);}
 win.addEventListener('scroll',rememberPosition,{passive:true});win.addEventListener('pagehide',persist);host.replaceChildren(shell);host.hidden=false;render();if(state.progress>0)restore();
 return {destroy(){win.clearTimeout(timer);win.removeEventListener('scroll',rememberPosition);win.removeEventListener('pagehide',persist);shell.remove();},getProgress:()=>({...state})};
}
