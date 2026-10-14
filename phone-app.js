let installPrompt;
const installed = () => window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
const host = document.querySelector('#admin-dashboard');
const button = document.createElement('button');
button.type = 'button';
button.className = 'button light small';
button.textContent = 'Install on my phone';
button.hidden = installed();
host?.prepend(button);
window.addEventListener('beforeinstallprompt', event => {
  event.preventDefault();
  installPrompt = event;
});
window.addEventListener('appinstalled', () => { installPrompt = null; button.hidden = true; });
button.addEventListener('click', async () => {
  const installUrl = new URL(window.location.href);
  installUrl.searchParams.set('app', 'owner');
  installUrl.hash = 'students-portal';
  window.history.replaceState(null, '', installUrl);
  if (installPrompt) {
    const prompt = installPrompt;
    installPrompt = null;
    await prompt.prompt();
    await prompt.userChoice;
    return;
  }
  let dialog = document.querySelector('#phone-install-help');
  if (!dialog) {
    dialog = document.createElement('dialog');
    dialog.id = 'phone-install-help';
    dialog.className = 'action-popup';
    dialog.setAttribute('aria-labelledby', 'phone-install-title');
    dialog.innerHTML = '<button type="button" class="popup-close" aria-label="Close install instructions">×</button><h2 id="phone-install-title">Speak Boldly on your phone</h2><p><strong>iPhone:</strong> Open this website in Safari, tap Share, then Add to Home Screen. Turn on Open as Web App if shown, then tap Add.</p><p><strong>Android:</strong> Open this website in Chrome, tap the ⋮ menu, then Install app or Add to Home screen.</p><p>Open the Speak Boldly icon to reach your instructor portal. Your usual instructor code is still required. Internet access is needed.</p>';
    dialog.querySelector('button').onclick = () => dialog.close();
    document.body.append(dialog);
  }
  dialog.showModal();
});
if ('serviceWorker' in navigator && window.isSecureContext) {
  navigator.serviceWorker.register(new URL('./service-worker.js', import.meta.url), {updateViaCache: 'none'}).catch(error => console.warn('Phone app setup unavailable:', error.message));
}
// Open the instructor entry on app launch while preserving normal website links.
if ((installed() || new URL(window.location.href).searchParams.get('app') === 'owner') && (!window.location.hash || window.location.hash.startsWith('#students-portal'))) {
  window.location.hash = 'students-portal';
  document.querySelector('[data-portal-area="admin"]')?.click();
}
