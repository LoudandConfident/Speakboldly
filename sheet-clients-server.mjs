// Run on the private server only. The sheet key is never sent to student browsers.
export function createSheetClientLoader(env,fetcher=fetch,now=()=>Date.now()){
 const url=env.EXAM_CLIENT_SHEET_URL,key=env.EXAM_CLIENT_SHEET_KEY;
 if(!url&&!key)return null;if(!url||!key)throw new Error('Configure both the Clients sheet URL and its private key.');
 if(!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url))throw new Error('Invalid Clients sheet deployment URL.');
 let cached=null,until=0,pending=null,failure=null;
 return async()=>{
  if(now()<until){if(failure)throw new Error('Clients sheet temporarily unavailable. Try again shortly.');return cached;}
  if(pending)return pending;
  pending=(async()=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
   try{const response=await fetcher(url,{method:'POST',redirect:'follow',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'listClients',key}),signal:controller.signal});const result=await response.json();
    if(!response.ok||!result.ok||!Array.isArray(result.clients))throw new Error('Clients sheet unavailable.');
    cached=result.clients;failure=null;until=now()+30000;return cached;
   }catch{failure=true;until=now()+30000;throw new Error('Clients sheet temporarily unavailable. Please try again shortly.');}
   finally{clearTimeout(timer);pending=null;}
  })();return pending;
 };
}
