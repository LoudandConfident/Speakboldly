// Public search pages share the main header, with ordinary crawlable links.
const menu=document.querySelector('.mobile-menu-toggle'),nav=document.querySelector('#main-navigation');
function closeMenu(){menu?.setAttribute('aria-expanded','false');nav?.classList.remove('mobile-open');}
menu?.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav?.classList.toggle('mobile-open',open);});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu?.getAttribute('aria-expanded')==='true'){closeMenu();menu.focus();}});
document.addEventListener('click',event=>{if(menu?.getAttribute('aria-expanded')==='true'&&!event.target.closest('header'))closeMenu();});
for(const link of nav?.querySelectorAll('a')||[]){const url=new URL(link.href);if(url.pathname===location.pathname&&!url.hash)link.setAttribute('aria-current','page');}
