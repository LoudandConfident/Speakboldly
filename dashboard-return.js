// Root dashboard arrows complement the existing back buttons inside each section.
export function initializeDashboardReturns(doc,win=doc.defaultView){
 const portal=doc.querySelector('#students-portal');if(!portal)return;
 for(const [selector,label]of [['.learning-space-heading','Back to portals'],['.admin-dashboard-heading','Back to portals']]){
  const heading=doc.querySelector(selector);if(!heading||heading.querySelector('.dashboard-return'))continue;
  const back=doc.createElement('button');back.type='button';back.className='dashboard-return';back.textContent='←';back.setAttribute('aria-label',label);back.title=label;
  back.onclick=()=>{if(doc.body.classList.contains('instructor-app')){win.location.href=new URL('./#students-portal',doc.baseURI).href;return;}if(selector==='.learning-space-heading'&&portal.querySelector('#portal-sign-out')){portal.querySelector('#portal-sign-out').click();}else{portal.querySelectorAll('#client-portal,#admin-portal').forEach(area=>area.hidden=true);portal.classList.remove('portal-session-active');win.location.hash='students-portal';}win.scrollTo({top:0,behavior:'instant'});};
  heading.prepend(back);
 }
}
if(typeof document!=='undefined')initializeDashboardReturns(document);
