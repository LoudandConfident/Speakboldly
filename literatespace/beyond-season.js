import {themeForDate} from '../seasonal-theme-data.js?v=christmas-122';
if(typeof document!=='undefined'){
 const update=()=>{const christmas=themeForDate()?.art==='christmas';document.body.dataset.beyondSeason=christmas?'christmas':'other';for(const logo of document.querySelectorAll('.teaching-return-logo'))logo.src=christmas?'/images/sb-christmas-logo-119.png':'/sb-logo-green.svg?v=dark-green';};
 update();window.addEventListener('pageshow',update);document.addEventListener('visibilitychange',()=>{if(!document.hidden)update();});window.setInterval(()=>{if(!document.hidden)update();},60000);
}
