import {openSection} from './section-navigation.js';
export function openPopup(dialog) {
 if (!dialog || dialog.open) return;
 dialog.showModal();
 dialog.scrollTop = 0;
}
export function initializePopups(doc, win) {
 const dialogs = [...doc.querySelectorAll('.action-popup')];
 for (const dialog of dialogs) {
  dialog.querySelector('.popup-close')?.addEventListener('click', () => dialog.close());
 }
 doc.querySelectorAll('[data-popup]').forEach(button => button.addEventListener('click', () => openPopup(doc.getElementById(button.dataset.popup))));
 const assessment = doc.querySelector('#assessment-dialog');
 const assessmentPage = doc.querySelector('#assessment');
 const mobile = () => win.matchMedia ? win.matchMedia('(max-width: 680px)').matches : win.innerWidth <= 680;
 function useAssessmentPage() {
  if (!assessmentPage || assessmentPage.hasAttribute('data-view')) return;
  if (assessment?.open) assessment.close();
  assessmentPage.setAttribute('data-view','');
  assessmentPage.hidden = true;
  doc.querySelector('main').append(assessmentPage);
  const intro=assessmentPage.querySelector('.intro');
  if(intro)intro.textContent='50 questions · 20 minutes. Leaving this page does not pause the timer. Leave questions blank if you don’t know the answer. Submit when you’re ready, or your answers will be submitted when the timer reaches zero.';
 }
 useAssessmentPage();
 const openAssessment = () => {
  if(!openSection(doc,'assessment')){
   let message=doc.getElementById('assessment-tab-message');if(!message){message=doc.createElement('p');message.id='assessment-tab-message';message.setAttribute('role','status');doc.querySelector('#assessment-start').after(message);}message.textContent='Allow a new tab for Speak Boldly, then try again. Your current page is unchanged.';
  }
 };
 doc.querySelector('#assessment-start')?.addEventListener('click', openAssessment);
 function route() {
  if (win.location.hash === '#assessment') {
   if(mobile() || assessmentPage?.hasAttribute('data-view')) {
    useAssessmentPage();
    doc.dispatchEvent(new win.Event('assessment-open'));
   } else {
    win.location.hash = 'placement';
    openAssessment();
   }
  } else {
   for (const dialog of dialogs) if (dialog.open && !(dialog === assessment && win.location.hash === '#placement')) dialog.close();
  }
 }
 win.addEventListener('hashchange', route);
 if (win.location.hash === '#assessment') win.dispatchEvent(new win.Event('hashchange'));
}
if (typeof document !== 'undefined') initializePopups(document, window);
