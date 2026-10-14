const displayMode = window.matchMedia('(display-mode: standalone)');
function updateInstallVisibility() {
 const installed = displayMode.matches || window.navigator.standalone === true;
 const navigation = document.querySelector('#main-navigation');
 let returnLink = document.querySelector('#installed-dashboard-link');
 if (navigation && !returnLink) {
  returnLink = document.createElement('a');
  returnLink.id = 'installed-dashboard-link';
  returnLink.className = 'nav-tab';
  returnLink.href = './instructor.html';
  returnLink.textContent = 'Instructor';
  navigation.append(returnLink);
 }
 if (returnLink) returnLink.hidden = !installed;
 document.querySelectorAll('#phone-install-button, .phone-install-row, #app-install, [data-instructor-app-link]').forEach(element => { element.hidden = installed; });
}
updateInstallVisibility();
displayMode.addEventListener?.('change', updateInstallVisibility);
