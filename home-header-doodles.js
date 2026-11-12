// Echo the footer illustration in the genuinely unused header space.
export function initializeHomeHeaderDoodles(doc){
 const logo=doc.querySelector('body>header .speak-logo'),source=doc.querySelector('#home .home-whitespace-doodles svg');
 if(!logo||!source)return;const header=logo.closest('header');if(header.querySelector('.home-header-doodles'))return;
 const win=doc.defaultView,mark=doc.createElement('span'),art=source.cloneNode(true);mark.className='home-header-doodles';mark.setAttribute('aria-hidden','true');mark.append(art);header.append(mark);
 if(win.getComputedStyle(header).position==='static')header.style.position='relative';
 let queued=false;
 function layout(){
  queued=false;const menu=header.querySelector('.mobile-menu-toggle'),nav=header.querySelector('nav');
  const next=menu&&menu.getClientRects().length?menu:nav;if(!next)return;
  const h=header.getBoundingClientRect(),l=logo.getBoundingClientRect(),r=next.getBoundingClientRect();
  const start=l.right+10,end=r.left-10,gap=end-start;
  mark.hidden=gap<22;if(mark.hidden)return;
  const width=Math.min(150,gap),height=width<70?22:30;
  art.setAttribute('viewBox',width<70?'0 0 45 45':'0 0 230 45');
  mark.style.left=(start+(gap-width)/2-h.left)+'px';mark.style.top=(l.top+l.height/2-h.top-height/2)+'px';
  mark.style.width=width+'px';mark.style.height=height+'px';
 }
 const schedule=()=>{if(!queued){queued=true;win.requestAnimationFrame(layout);}};
 if(win.ResizeObserver){const observer=new win.ResizeObserver(schedule);for(const node of [header,logo,header.querySelector('nav'),header.querySelector('.mobile-menu-toggle')])if(node)observer.observe(node);}
 win.addEventListener('resize',schedule);doc.fonts?.ready.then(schedule);layout();
}
if(typeof document!=='undefined')initializeHomeHeaderDoodles(document);
