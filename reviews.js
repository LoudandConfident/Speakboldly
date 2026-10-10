import {EMAIL_ENDPOINT} from './placement-config.js';
import {courses} from './courses.js';
export function initializeReviews(doc, send = fetch) {
 const opener = doc.querySelector('#review-open');
 const form = doc.querySelector('#review-form');
 if (!opener || !form) return;
 const programSelect = form.elements.program;
 for (const course of courses) {
  const option = doc.createElement('option');
  option.value = course.title; option.textContent = course.title;
  programSelect.append(option);
 }
 opener.addEventListener('click', () => {
  form.hidden = !form.hidden;
  opener.setAttribute('aria-expanded', String(!form.hidden));
  if (!form.hidden) form.elements.name.focus();
 });
 form.addEventListener('submit', async event => {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const button = form.querySelector('button[type=submit]');
  const status = doc.querySelector('#review-status');
  button.disabled = true;
  status.textContent = 'Sending your review…';
  try {
   const response = await send(EMAIL_ENDPOINT, {
    method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},
    body:JSON.stringify({_subject:'Speak Boldly — review awaiting approval',name:form.elements.name.value.trim() || 'Anonymous',age:form.elements.age.value || 'Not shared',program:form.elements.program.value,level:form.elements.level.value.trim(),review:form.elements.message.value.trim(),publicationConsent:'I agree to publication of my review, program, level, and name and age if provided.',consentRecordedAt:new Date().toISOString()})
   });
   const result = await response.json();
   if (!response.ok || !(result.success === true || result.success === 'true')) throw new Error('Request not accepted');
   status.textContent = 'Thank you! Your review has been submitted for approval before publication.';
   form.reset();
  } catch {
   status.textContent = 'Your review could not be sent. Please try again or email speakboldly16@gmail.com.';
  } finally {button.disabled = false;}
 });
}
if (typeof document !== 'undefined') initializeReviews(document);
