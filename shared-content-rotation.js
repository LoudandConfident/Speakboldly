const DEFAULT_ENDPOINT='https://script.google.com/macros/s/AKfycbz6CwMAv4mosev17Pw3BfnbMPESUk64QT-AlKPL6_8e3tlknBg-9ReLA3ejvFfRKfJX/exec';
let states={},pending=null,lastLoaded=0,epoch=0;
export function contentRotation(channel){return states[channel]?{...states[channel]}:null;}
export function setContentRotation(channel,state,doc){states={...states,[channel]:{...state}};epoch++;doc?.dispatchEvent(new doc.defaultView.CustomEvent('sb-content-rotation-changed',{detail:{channel}}));}
export async function refreshContentRotation(doc,{force=false}={}){
 if(pending)return pending;if(!force&&Date.now()-lastLoaded<30000)return states;
 const win=doc.defaultView,endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue||DEFAULT_ENDPOINT,controller=new win.AbortController(),timer=win.setTimeout(()=>controller.abort(),10000),start=epoch;
 pending=(async()=>{try{const r=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'contentRotationSettings'}),signal:controller.signal});const d=await r.json();if(r.ok&&d.ok&&d.capabilities?.sharedRotation===1&&d.states&&epoch===start){states=d.states;doc.dispatchEvent(new win.CustomEvent('sb-content-rotation-changed',{detail:{channel:'all'}}));}}catch{}finally{win.clearTimeout(timer);lastLoaded=Date.now();pending=null;}return states;})();return pending;
}
export function featuredFirst(posts,rotation){if(!rotation?.active)return [...posts];return [...posts].sort((a,b)=>Number(b.id===rotation.selectedId)-Number(a.id===rotation.selectedId));}
export function initializeContentRotation(doc){if(doc.documentElement.dataset.rotationPolling)return;doc.documentElement.dataset.rotationPolling='true';const win=doc.defaultView;let timer;const refresh=()=>{if(!doc.hidden)void refreshContentRotation(doc);};const start=()=>{win.clearInterval(timer);timer=win.setInterval(refresh,60000);};doc.addEventListener('visibilitychange',refresh);win.addEventListener('focus',refresh);win.addEventListener('pagehide',()=>win.clearInterval(timer));win.addEventListener('pageshow',start);start();refresh();}
if(typeof document!=='undefined')initializeContentRotation(document);
