// Public readiness only: no comment creation, instructor data, state changes or email sends.
import {readFileSync,writeFileSync} from 'node:fs';
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8'),form=html.match(/<form[^>]*id="client-sheet-connect"[\s\S]*?<\/form>/)?.[0],endpoint=form?.match(/name="endpoint"[^>]*value="([^"]+)"/)?.[1]||form?.match(/value="([^"]+)"[^>]*name="endpoint"/)?.[1];
async function readPublic(action,extra={}){
 if(!endpoint)throw Error('No endpoint configured.');
 const started=Date.now(),timeout=action==='studentPortalAccess'?90000:35000;
 const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,...extra}),signal:AbortSignal.timeout(timeout)});
 const text=await r.text();let data;try{data=JSON.parse(text);}catch{
  const title=text.match(/<title[^>]*>([^<]{0,160})/i)?.[1]||'Non-JSON response';
  throw Error('HTTP '+r.status+'; '+title+'; '+Math.round((Date.now()-started)/1000)+' seconds');
 }
 return{reachable:r.ok,data,elapsedMs:Date.now()-started,httpStatus:r.status};
}
const status={checkedAt:new Date().toISOString(),comments:{reachable:false,ready:false,enabled:false},sharedContent:{reachable:false,ready:false},practiceDrive:{reachable:false,ready:false}};
await Promise.all([
 (async()=>{try{const{reachable,data,elapsedMs,httpStatus}=await readPublic('studentPortalAccess');const files=Array.isArray(data.items)?data.items:[];status.practiceDrive={reachable,elapsedMs,httpStatus,ready:data.ok===true&&files.some(item=>item.driveFolder==='practice'),files:files.filter(item=>item.driveFolder==='practice').length,...(data.error?{error:String(data.error).slice(0,180)}:{})};}catch(error){status.practiceDrive.error=error.name==='TimeoutError'?'Practice Drive catalog exceeded 90 seconds.':String(error.message||'Practice Drive catalog could not be checked.').slice(0,220);}})(),
 (async()=>{try{const{reachable,data}=await readPublic('blogComments',{postId:'your-english-is-not-your-worth'});status.comments={reachable,ok:data.ok===true,ready:data.ready===true,enabled:data.enabled===true,...(data.error?{error:String(data.error).slice(0,180)}:{})};}catch{status.comments.error='Public comments service could not be reached.';}})(),
 (async()=>{try{const{reachable,data}=await readPublic('contentRotationSettings');status.sharedContent={reachable,ready:data.ok===true&&data.capabilities?.sharedRotation===1,...(data.error?{error:String(data.error).slice(0,180)}:{})};}catch{status.sharedContent.error='Shared content controls could not be checked.';}})()
]);
writeFileSync(new URL('../content/comment-service-status.json',import.meta.url),JSON.stringify(status,null,2)+'\n');console.log(JSON.stringify(status));
