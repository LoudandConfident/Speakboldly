// Optional browser audio. All reading and answers remain usable without JavaScript.
for(const button of document.querySelectorAll('[data-listen]')){
 const section=button.closest('section'),status=section.querySelector('[data-audio-status]');
 if(!('speechSynthesis' in window)){button.hidden=true;status.textContent='Audio is unavailable in this browser. You can still read the passage aloud.';continue;}
 button.addEventListener('click',()=>{speechSynthesis.cancel();const utterance=new SpeechSynthesisUtterance([...section.querySelectorAll('[data-reading]')].map(p=>p.textContent).join(' '));utterance.lang='en-GB';utterance.rate=.9;utterance.onstart=()=>status.textContent='Playing the reading…';utterance.onend=()=>status.textContent='Reading finished.';utterance.onerror=()=>status.textContent='Audio could not play. Please try again or read the passage aloud.';speechSynthesis.speak(utterance);});
}
window.addEventListener('pagehide',()=>window.speechSynthesis?.cancel());
