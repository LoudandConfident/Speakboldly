// Keep optional portal controllers out of the initial mobile module graph.
export function deferredController(load,{doc,host,methods=['open'],label='This section'}={}){
 let instance=null,pending=null,generation=0,notice=null;
 const hide=()=>{notice?.remove();notice=null;};
 async function invoke(method,args){if(method==='show'&&!args[0]){generation++;hide();instance?.show(false);return;}const ticket=generation;
  if(!instance){if(!notice&&host){notice=doc.createElement('p');notice.className='sb-loading';notice.setAttribute('role','status');notice.setAttribute('aria-label','Loading '+label);host.prepend(notice);}pending ||= load().then(value=>instance=value).catch(error=>{pending=null;throw error;});try{await pending;}catch(error){if(ticket===generation){hide();const message=doc.createElement('p');message.setAttribute('role','status');message.textContent=label+' could not load. Reopen this section to retry.';host?.prepend(message);}return;}}
  if(ticket!==generation){instance?.lock();return;}hide();return instance?.[method]?.(...args);
 }
 return Object.assign({lock(){generation++;hide();instance?.lock();}},Object.fromEntries(methods.map(method=>[method,(...args)=>invoke(method,args)])));
}
