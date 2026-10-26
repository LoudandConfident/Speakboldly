const view=document.body.dataset.publicSiteView,course=document.body.dataset.publicCourse;
// Return to the normal root URL when navigating to another website section.
window.addEventListener('hashchange',()=>{if(location.hash!=='#'+view)history.replaceState(null,'','/'+location.search+location.hash);});
if(course&&location.hash==='#courses'){
 const grid=document.querySelector('#course-grid');
 let observer;
 function openCourse(){if(location.hash!=='#courses'){observer?.disconnect();return true;}const button=grid?.querySelector('[data-course="'+course+'"]');if(!button)return false;button.click();observer?.disconnect();return true;}
 if(!openCourse()&&grid){observer=new MutationObserver(openCourse);observer.observe(grid,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});}
}

// Open the existing Learning Hub controls, preserving their normal access checks.
if(view==='students-portal'){
 let clientOpened=false,panelOpened=false;
 const panel=document.body.dataset.publicPanel;
 const observer=new MutationObserver(openHub);
 function openHub(){
  if(location.hash!=='#students-portal'&&!location.hash.startsWith('#students-portal/')){observer.disconnect();return;}
  const client=document.querySelector('[data-portal-area="client"]');
  if(!clientOpened&&client&&!client.disabled){clientOpened=true;client.click();}
  if(!clientOpened)return;
  if(!panel){observer.disconnect();return;}
  const button=document.querySelector('[data-portal-tab="'+panel+'"]');
  if(!panelOpened&&button&&!button.disabled&&button.getClientRects().length){panelOpened=true;button.click();observer.disconnect();}
 }
 observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['hidden','disabled']});openHub();
 window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});
}
