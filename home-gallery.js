// Update this list to change the daily pictures and quotes.
export const dailyQuotes = [
 { image: './images/daily-motivation-1.png', alt: 'A notebook and phone, ready for a fresh start', quote: 'Make time for what matters.' },
 { image: './images/daily-motivation-2.png', alt: 'A welcoming study space with notes and books', quote: 'Drop the shame and get in the game.' },
 { image: './images/daily-motivation-3.png', alt: 'A runner preparing to move forward', quote: 'It’s not how you start that matters. It’s how you finish.' },
 { image: './images/daily-motivation-4.png', alt: 'A woman celebrating on a mountain at sunrise', quote: 'It is never too late to be what you might have been.' },
 { image: './images/daily-motivation-5.png', alt: 'An open window overlooking a mountain lake', quote: 'To learn a language is to have one more window from which to look at the world.' }
];
export function cairoDayNumber(now = new Date()) {
 const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Africa/Cairo', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
 const part = type => Number(parts.find(p => p.type === type).value);
 return Math.floor(Date.UTC(part('year'), part('month') - 1, part('day')) / 86400000);
}
export function quoteForDate(now = new Date()) {
 return dailyQuotes[cairoDayNumber(now) % dailyQuotes.length];
}
export function initializeGallery(doc, win) {
 const root = doc.querySelector('.daily-motivation');
 if (!root) return;
 const button = root.querySelector('.daily-quote-trigger'), card = root.querySelector('.daily-quote-card');
 let day = null, closeTimer;
 function refresh() {
  const now = new win.Date(), nextDay = cairoDayNumber(now);
  if (day === nextDay) return;
  day = nextDay;
  const entry = quoteForDate(now);
  root.querySelector('#daily-quote-image').src = entry.image;
  root.querySelector('#daily-quote-image').alt = entry.alt;
  root.querySelector('#daily-quote-text').textContent = entry.quote;
 }
 function show(open) {
  win.clearTimeout(closeTimer);
  if (open) refresh();
  card.hidden = !open;
  button.setAttribute('aria-expanded', String(open));
 }
 button.addEventListener('pointerenter', e => { if (e.pointerType !== 'touch') show(true); });
 root.addEventListener('pointerenter', () => win.clearTimeout(closeTimer));
 root.addEventListener('pointerleave', () => { closeTimer = win.setTimeout(() => show(false), 150); });
 button.addEventListener('focus', () => show(true));
 root.addEventListener('focusout', () => win.setTimeout(() => { if (!root.contains(doc.activeElement)) show(false); }, 0));
 button.addEventListener('click', () => show(true));
 doc.addEventListener('keydown', e => { if (e.key === 'Escape') show(false); });
 doc.addEventListener('click', e => { if (!root.contains(e.target)) show(false); });
 win.addEventListener('hashchange', () => show(false));
 doc.addEventListener('visibilitychange', () => { if (!doc.hidden) refresh(); });
 refresh();
 let interval;
 function start() { win.clearInterval(interval); interval = win.setInterval(refresh, 1000); refresh(); }
 start();
 win.addEventListener('pagehide', () => win.clearInterval(interval));
 win.addEventListener('pageshow', start);
}
if (typeof document !== 'undefined') initializeGallery(document, window);
