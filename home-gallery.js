export function initializeGallery(doc,win){
 const gallery=doc.querySelector('.home-gallery');if(!gallery)return;
 const stage=gallery.querySelector('.carousel-slides'),slides=[...stage.querySelectorAll('.home-poster')],status=gallery.querySelector('.carousel-status');
 const controls=doc.createElement('div');controls.className='gallery-controls';status.before(controls);controls.append(status);
 const pause=doc.createElement('button');pause.type='button';pause.className='gallery-pause';controls.append(pause);
 let current=0,paused=!!win.matchMedia?.('(prefers-reduced-motion: reduce)').matches,drag=null,timer;
 function size(){const height=slides[current].offsetHeight;if(height)stage.style.height=height+'px';}
 function move(step){current=(current+step+slides.length)%slides.length;slides.forEach((slide,i)=>{const active=i===current;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));slide.inert=!active;});size();status.textContent=(current+1)+' / '+slides.length;}
 function restart(){win.clearInterval(timer);timer=win.setInterval(()=>{if(!paused&&!drag&&!doc.hidden&&!gallery.closest('[hidden]')&&!gallery.matches(':hover')&&!gallery.contains(doc.activeElement))move(1);},6000);}
 function label(){pause.textContent=paused?'Play slideshow':'Pause slideshow';pause.setAttribute('aria-label',pause.textContent);}
 pause.onclick=()=>{paused=!paused;label();restart();};label();
 gallery.addEventListener('keydown',event=>{if(event.key==='ArrowLeft'||event.key==='ArrowRight'){event.preventDefault();move(event.key==='ArrowLeft'?-1:1);restart();}});
 stage.addEventListener('dragstart',event=>event.preventDefault());
 stage.addEventListener('pointerdown',event=>{if(!event.isPrimary||event.button!==0)return;drag={id:event.pointerId,x:event.clientX,y:event.clientY};stage.classList.add('is-dragging');});
 win.addEventListener('pointerup',event=>{if(!drag||drag.id!==event.pointerId)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;drag=null;stage.classList.remove('is-dragging');if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)){move(dx<0?1:-1);suppressClick=true;win.setTimeout(()=>suppressClick=false,0);}restart();});
 let suppressClick=false;stage.addEventListener('click',event=>{if(suppressClick){event.preventDefault();event.stopPropagation();}},true);
 win.addEventListener('pointercancel',()=>{drag=null;stage.classList.remove('is-dragging');});
 const observer=new win.ResizeObserver(size);slides.forEach(slide=>observer.observe(slide));
 win.addEventListener('hashchange',()=>win.requestAnimationFrame(size));size();restart();
}
if(typeof document!=='undefined')initializeGallery(document,window);
