// Never cache client records, submissions, report contents, or Apps Script requests.
const CACHE='speak-boldly-instructor-shell-v1';
const OFFLINE=new URL('./instructor-offline.html',self.location).href;
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll([OFFLINE,new URL('./speak-boldly-preview-dark-green.png',self.location).href])).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key.startsWith('speak-boldly-instructor-shell-')&&key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{const url=new URL(event.request.url);if(event.request.method!=='GET'||event.request.mode!=='navigate'||url.origin!==self.location.origin||!['instructor.html','report-editor.html'].includes(url.pathname.split('/').pop()))return;event.respondWith(fetch(event.request).catch(()=>caches.match(OFFLINE)));});
