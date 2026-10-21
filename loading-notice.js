export function createLoadingNotice(doc,parent,id){
 const win=doc.defaultView,node=doc.createElement('p');node.id=id;node.className='portal-loading-notice';node.setAttribute('role','status');node.setAttribute('aria-live','polite');node.hidden=true;parent.prepend(node);const tasks=new Map();let next=0,timer=null;
 function paint(){if(!tasks.size){node.hidden=true;node.textContent='';node.removeAttribute('aria-busy');if(timer!==null)win.clearInterval(timer);timer=null;return;}const task=[...tasks.values()].at(-1);node.hidden=false;node.setAttribute('aria-busy','true');node.textContent=Date.now()-task.start>=5000?task.message.replace(/^Loading/i,'Still loading')+' The server is taking a little longer.':task.message;if(timer===null)timer=win.setInterval(paint,1000);}
 return {start(message){const key=++next;tasks.set(key,{message,start:Date.now()});paint();let ended=false;return()=>{if(ended)return;ended=true;tasks.delete(key);paint();};},clear(){tasks.clear();paint();},node};
}
