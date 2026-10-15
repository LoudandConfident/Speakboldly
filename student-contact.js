export function initializeStudentContact(doc) {
 const win=doc.defaultView,root=doc.querySelector('#portal-contact');
 const endpoint=doc.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 const dialog=doc.createElement('dialog');dialog.id='student-contact-dialog';dialog.className='action-popup';dialog.setAttribute('aria-labelledby','student-contact-title');
 dialog.innerHTML='<button type="button" class="popup-close" aria-label="Close note">×</button><h2 id="student-contact-title">How can I help you?</h2><form class="student-contact-form"><label>Your name<input name="name" autocomplete="name" maxlength="100" required></label><label>Your email<input name="email" type="email" autocomplete="email" maxlength="254" required></label><label>Your note<textarea name="message" rows="6" maxlength="4000" placeholder="Tell me what you need help with…" required></textarea></label><label hidden aria-hidden="true">Website<input name="website" tabindex="-1" autocomplete="off"></label><button class="button small" type="submit">Send request</button></form><p role="status" aria-live="polite"></p>';doc.body.append(dialog);
 const form=dialog.querySelector('form'),status=dialog.querySelector('[role=status]'),send=form.querySelector('[type=submit]');let requestId=null,busy=false,generation=0,sent=false;
 dialog.querySelector('.popup-close').onclick=()=>dialog.close();
 form.addEventListener('input',()=>{if(!busy){requestId=null;sent=false;send.disabled=false;status.textContent='';}});
 root.querySelector('[data-contact-note]')?.addEventListener('click',open);
 function open(message){if(typeof message==='string'&&!busy){const field=form.elements.message;if(!field.value.startsWith(message.trim()))field.value=(message+field.value).slice(0,4000);requestId=null;sent=false;send.disabled=false;status.textContent='';}if(!dialog.open)dialog.showModal();form.elements.name.focus();}
 form.onsubmit=async event=>{
  event.preventDefault();if(busy||sent||!form.reportValidity())return;
  busy=true;send.disabled=true;form.querySelectorAll('input,textarea').forEach(input=>input.disabled=true);const current=generation;requestId ||= win.crypto.randomUUID();status.textContent='Sending your request…';
  const controller=new AbortController(),timer=win.setTimeout(()=>controller.abort(),45000);
  try{
   const response=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'studentInstructorContact',requestId,name:form.elements.name.value.trim(),email:form.elements.email.value.trim(),message:form.elements.message.value.trim(),website:form.elements.website.value}),signal:controller.signal});
   const result=await response.json();if(current!==generation)return;
   if(!response.ok||!result.ok||result.status!=='sent')throw new Error(/Incorrect connection key|Not authorized|Invalid action/.test(result.error||'')?'Your instructor needs to deploy the updated contact script before this note can be emailed.':result.error||'Your request could not be sent.');
   sent=true;status.textContent='Your request has been emailed to your instructor.';
  }catch(error){if(current===generation)status.textContent=error.name==='AbortError'?'The response took too long. Retry with the same note; an already sent request will not be sent twice.':error.message;}
  finally{win.clearTimeout(timer);if(current===generation){busy=false;send.disabled=sent;form.querySelectorAll('input,textarea').forEach(input=>input.disabled=false);}}
 };
 return {open,lock(){generation++;busy=false;sent=false;requestId=null;form.reset();form.querySelectorAll('input,textarea').forEach(input=>input.disabled=false);status.textContent='';send.disabled=false;if(dialog.open)dialog.close();}};
}
