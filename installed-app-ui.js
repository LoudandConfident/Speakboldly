const displayMode = window.matchMedia('(display-mode: standalone)');
function updateInstallVisibility() {
 const installed = displayMode.matches || window.navigator.standalone === true;
 document.querySelectorAll('#phone-install-button, .phone-install-row, #app-install, [data-instructor-app-link]').forEach(element => { element.hidden = installed; });
}
updateInstallVisibility();
displayMode.addEventListener?.('change', updateInstallVisibility);
