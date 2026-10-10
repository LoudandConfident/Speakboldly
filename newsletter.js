import {EMAIL_ENDPOINT} from './placement-config.js';
const opener = document.querySelector('#newsletter-open');
const form = document.querySelector('#newsletter-form');
opener?.addEventListener('click', () => {
 form.hidden = !form.hidden;
 opener.setAttribute('aria-expanded', String(!form.hidden));
 if (!form.hidden) form.querySelector('input[type=email]').focus();
});
form?.addEventListener('submit', async event => {
 event.preventDefault();
 if (!form.reportValidity()) return;
 const button = form.querySelector('button[type=submit]');
 const status = document.querySelector('#newsletter-status');
 button.disabled = true;
 status.textContent = 'Sending your subscription request…';
 try {
  const response = await fetch(EMAIL_ENDPOINT, {
   method:'POST', headers:{'Content-Type':'application/json',Accept:'application/json'},
   body:JSON.stringify({_subject:'Weekly English tips — subscription request',email:form.elements.email.value.trim(),consent:'I would like to receive weekly English tips and resources by email.',consentRecordedAt:new Date().toISOString(),source:'Speak Boldly motivation page'})
  });
  const result = await response.json();
  if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Request not accepted');
  status.textContent = 'Your subscription request has been received. Weekly emails will begin once the mailing list is activated.';
  form.reset();
 } catch {
  status.textContent = 'Your request could not be sent. Please try again or email speakboldly16@gmail.com.';
 } finally {button.disabled = false;}
});
