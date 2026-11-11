// Only an optional, modest reveal; no tracking, storage, network calls or reader import.
const reduced=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(!reduced&&'IntersectionObserver'in window){
 const observer=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}},{threshold:.08});
 for(const section of document.querySelectorAll('.reveal')){section.classList.add('reveal-pending');observer.observe(section);}
}
