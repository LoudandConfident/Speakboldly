const view=document.body.dataset.publicSiteView,course=document.body.dataset.publicCourse;
// Return to the normal root URL when navigating to another website section.
window.addEventListener('hashchange',()=>{if(location.hash!=='#'+view)history.replaceState(null,'','/'+location.search+location.hash);});
if(course&&location.hash==='#courses'){
 const grid=document.querySelector('#course-grid');
 let observer;
 function openCourse(){if(location.hash!=='#courses'){observer?.disconnect();return true;}const button=grid?.querySelector('[data-course="'+course+'"]');if(!button)return false;button.click();observer?.disconnect();return true;}
 if(!openCourse()&&grid){observer=new MutationObserver(openCourse);observer.observe(grid,{childList:true,subtree:true});window.addEventListener('pagehide',()=>observer.disconnect(),{once:true});}
}
