// Public readiness only: no comment creation, instructor data, state changes or email sends.
import {readFileSync,writeFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),form=html.match(/<form[^>]*id="client-sheet-connect"[\s\S]*?<\/form>/)?.[0],endpoint=form?.match(/name="endpoint"[^>]*value="([^"]+)"/)?.[1]||form?.match(/value="([^"]+)"[^>]*name="endpoint"/)?.[1];
async function readPublic(action,extra={}){if(!endpoint)throw Error('No endpoint configured.');const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,...extra}),signal:AbortSignal.timeout(35000)});return{reachable:r.ok,data:await r.json()};}
const status={checkedAt:new Date().toISOString(),comments:{reachable:false,ready:false,enabled:false},sharedContent:{reachable:false,ready:false}};
await Promise.all([
 (async()=>{try{const{reachable,data}=await readPublic('blogComments',{postId:'your-english-is-not-your-worth'});status.comments={reachable,ok:data.ok===true,ready:data.ready===true,enabled:data.enabled===true,...(data.error?{error:String(data.error).slice(0,180)}:{})};}catch{status.comments.error='Public comments service could not be reached.';}})(),
 (async()=>{try{const{reachable,data}=await readPublic('contentRotationSettings');status.sharedContent={reachable,ready:data.ok===true&&data.capabilities?.sharedRotation===1,...(data.error?{error:String(data.error).slice(0,180)}:{})};}catch{status.sharedContent.error='Shared content controls could not be checked.';}})()
]);
writeFileSync(new URL('../content/comment-service-status.json',import.meta.url),JSON.stringify(status,null,2)+'\n');console.log(JSON.stringify(status));
