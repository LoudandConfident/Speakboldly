// Share an in-flight read, retain the last good snapshot, and reject stale reads.
export function createCalendarLoader({read,apply,onError=()=>{},isActive=()=>true,now=Date.now,freshFor=30000}){
 let generation=0,lastLoaded=null,pending=null;
 function invalidate(){generation++;lastLoaded=null;}
 function refresh({force=false}={}){
  if(!isActive())return Promise.resolve(false);
  if(pending){
   if(pending.generation!==generation)return pending.promise.then(()=>refresh({force:true}));
   return pending.promise;
  }
  if(!force&&lastLoaded!==null&&now()-lastLoaded<freshFor)return Promise.resolve(true);
  const ticket={generation};pending=ticket;
  ticket.promise=Promise.resolve().then(read).then(value=>{
   if(ticket.generation!==generation||!isActive())return false;
   apply(value);lastLoaded=now();return true;
  }).catch(error=>{if(ticket.generation===generation&&isActive()){lastLoaded=null;onError(error);}return false;})
   .finally(()=>{if(pending===ticket)pending=null;});
  return ticket.promise;
 }
 return{refresh,invalidate,clear:invalidate};
}
