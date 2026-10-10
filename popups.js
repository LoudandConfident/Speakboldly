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
 const openAssessment = () => {
  openPopup(assessment);
  doc.dispatchEvent(new win.Event('assessment-open'));
 };
 doc.querySelector('#assessment-start')?.addEventListener('click', openAssessment);
 function route() {
  if (win.location.hash === '#assessment') {
   win.location.hash = 'placement';
   openAssessment();
  } else {
   for (const dialog of dialogs) if (dialog.open && !(dialog === assessment && win.location.hash === '#placement')) dialog.close();
  }
 }
 win.addEventListener('hashchange', route);
 if (win.location.hash === '#assessment') route();
}
if (typeof document !== 'undefined') initializePopups(document, window);
