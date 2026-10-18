// Visual guidance only: never reads, changes, or submits assessment answers.
const drawings=[
 '<path d="M8 31h13v-9h13V13h16M41 13h9v9"/>',
 '<circle cx="30" cy="25" r="17"/><path d="M20 25h20M30 15v20M44 39l9 9"/>',
 '<path d="M9 14q11-5 21 0 11-5 21 0v32q-11-5-21 0-10-5-21 0ZM30 14v32M16 24h8M36 24h8"/>',
 '<path d="M12 42C3 15 50 8 48 12c1 26-9 37-28 29M17 42l24-23M28 31v-9M28 31h10"/>',
 '<circle cx="19" cy="19" r="7"/><circle cx="43" cy="37" r="9"/><path d="m24 24 12 8M12 45l7-7M41 12v8M37 16h8"/>',
 '<path d="M10 35c6-35 39 12 43-22M43 17l10-4 2 11M10 44h43"/>'
];
const art=(step=0)=>'<svg viewBox="0 0 64 56" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+drawings[step%drawings.length]+'</svg>';
function banner(host,text,step=0){if(!host)return;let node=host.querySelector(':scope > .learning-visual-note');if(!node){node=document.createElement('div');node.className='learning-visual-note';host.prepend(node);}const signature=text+step;if(node.dataset.signature===signature)return;node.dataset.signature=signature;node.dataset.art=String(step%6);node.innerHTML=art(step);const copy=document.createElement('span');copy.textContent=text;node.append(copy);}
const placementNotes=['One question at a time.','Take a moment. Trust your thinking.','Keep going at your own pace.','Every answer helps us understand your English.','A starting point for your next chapter.'];
function placement(){const form=document.querySelector('#placement-form'),label=document.querySelector('#test-page-label');if(!form||!label)return;const refresh=()=>{const n=Math.max(0,Number(label.textContent.match(/\d+/)?.[0]||1)-1);banner(form,placementNotes[n%5],n);};refresh();new MutationObserver(refresh).observe(label,{childList:true,characterData:true,subtree:true});}
function learner(){const host=document.querySelector('#learner-profile form'),label=document.querySelector('.learner-progress');if(!host||!label)return;const notes=['There is no perfect learning style.','Choose what feels most like you.','Think about what helps you get started.','Your preferences can change.','Notice what keeps you curious.','A little reflection goes a long way.'];const refresh=()=>{const n=Math.max(0,Number(label.textContent.match(/\d+/)?.[0]||1)-1);banner(host,notes[n%6],n+1);};refresh();new MutationObserver(refresh).observe(label,{childList:true,characterData:true,subtree:true});}
function portalDecorations(){for(const [id,text,step]of [['daily-mission','A little English. A little every day.',3],['portal-monthly','Different voices. A wider world.',4]]){const host=document.getElementById(id);if(!host)continue;const refresh=()=>{if(host.querySelector('h2,h3,p,a'))banner(host,text,step);};refresh();new MutationObserver(refresh).observe(host,{childList:true});}}
placement();learner();portalDecorations();
// The placement form is populated by its existing module after page parsing.
if(!document.querySelector('#test-page-label')){const form=document.querySelector('#placement-form');if(form){const ready=new MutationObserver(()=>{if(document.querySelector('#test-page-label')){ready.disconnect();placement();}});ready.observe(form,{childList:true});}}
