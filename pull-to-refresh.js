export function initializePullToRefresh(doc,win){
 const mode=win.matchMedia('(display-mode: standalone)');
 const enabled=()=>mode.matches||win.navigator.standalone===true||doc.body.classList.contains('instructor-app');
 const indicator=doc.createElement('div');indicator.className='app-refresh-indicator';indicator.setAttribute('role','status');indicator.setAttribute('aria-live','polite');indicator.hidden=true;doc.body.append(indicator);
 const threshold=90;let gesture=null,refreshing=false,hideTimer;
 function reset(){gesture=null;if(!refreshing)indicator.hidden=true;}
 function nestedScroller(target){for(let node=target;node&&node!==doc.body&&node!==doc.documentElement;node=node.parentElement){const style=win.getComputedStyle(node);if(/auto|scroll/.test(style.overflowY)&&node.scrollHeight>node.clientHeight+1)return true;}return false;}
 function blocked(){return doc.querySelector('dialog[open],#learner-profile:not([hidden]) input:checked,.interactive-exam form');}
 function configure(){doc.documentElement.classList.toggle('app-pull-refresh-enabled',enabled());if(!enabled())reset();}
 configure();mode.addEventListener?.('change',configure);
 doc.addEventListener('touchstart',event=>{
  if(!enabled()||refreshing||event.touches.length!==1||win.scrollY>1||blocked()||event.target.closest('input,textarea,select,button,a,[contenteditable="true"]')||nestedScroller(event.target)){reset();return;}
  win.clearTimeout(hideTimer);const touch=event.touches[0];gesture={x:touch.clientX,y:touch.clientY,distance:0};
 },{passive:true});
 doc.addEventListener('touchmove',event=>{
  if(!gesture)return;if(event.touches.length!==1||win.scrollY>1){reset();return;}
  const touch=event.touches[0],dx=Math.abs(touch.clientX-gesture.x),dy=touch.clientY-gesture.y;
  if(dy<0||(dx>12&&dx>dy)){reset();return;}if(dy<12)return;
  if(event.cancelable)event.preventDefault();gesture.distance=dy;indicator.hidden=false;indicator.textContent=dy>=threshold?'Release to refresh':'Pull down to refresh';
 },{passive:false});
 doc.addEventListener('touchend',()=>{
  if(!gesture)return;const ready=gesture.distance>=threshold;gesture=null;
  if(!ready){reset();return;}
  if(win.navigator.onLine===false){indicator.textContent='Reconnect to refresh';hideTimer=win.setTimeout(()=>indicator.hidden=true,2200);return;}
  refreshing=true;indicator.hidden=false;indicator.textContent='Refreshing…';win.setTimeout(()=>win.location.reload(),180);
 },{passive:true});
 doc.addEventListener('touchcancel',reset,{passive:true});
 win.addEventListener('pagehide',reset);
 return {reset};
}
if(typeof document!=='undefined')initializePullToRefresh(document,window);
