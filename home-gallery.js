// Update this list to change the daily pictures and quotes.
export const dailyQuotes = [
 { image: './images/daily-motivation-1.png', alt: 'A notebook and phone, ready for a fresh start', quote: 'Make time for what matters.' },
 { image: './images/daily-motivation-2.png', alt: 'A welcoming study space with notes and books', quote: 'Drop the shame and get in the game.' },
 { image: './images/daily-motivation-3.png', alt: 'A runner preparing to move forward', quote: 'It’s not how you start that matters. It’s how you finish.' },
 { image: './images/daily-motivation-4.png', alt: 'A woman celebrating on a mountain at sunrise', quote: 'It is never too late to be what you might have been.' },
 { image: './images/daily-motivation-5.png', alt: 'An open window overlooking a mountain lake', quote: 'To learn a language is to have one more window from which to look at the world.' } ,{ image: './images/daily-motivation-translation.png', alt: 'A quiet cafe scene with a thoughtful speech bubble', quote: 'Lost in Translation? Don’t translate every thought—think in English.', embedded: true },
 { image: './images/daily-motivation-fluency.png', alt: 'A work in progress sign in a sunny street', quote: 'Fluency: loading… Work in progress.', embedded: true },
 { image: './images/daily-motivation-doors.png', alt: 'An open green door leading to a flower-lined street', quote: 'English opens doors. Don’t let hesitation keep you from entering them.', embedded: true },
 { image: './images/daily-motivation-unmute.png', alt: 'A microphone on a sunlit desk', quote: 'Unmute yourself. You have something to say. Say it in English.', embedded: true },
 { image: './images/daily-motivation-talk.png', alt: 'A hand holding a microphone beside a notebook', quote: 'Your turn to talk.', embedded: true }
];
export function cairoDayNumber(now = new Date()) {
 const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Africa/Cairo', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
 const part = type => Number(parts.find(p => p.type === type).value);
 return Math.floor(Date.UTC(part('year'), part('month') - 1, part('day')) / 86400000);
}
export function quoteForDate(now = new Date()) {
 return dailyQuotes[cairoDayNumber(now) % dailyQuotes.length];
}
export const quoteDetails = [
 {support:['Better opportunities','Real conversations','More confidence','A brighter you','Freedom to be you','English for real life'],reflection:'Make a little room for English today. One real conversation, one question, or one voice note can be a step towards the things that matter to you.'},
 {support:['I’m not fluent (yet).','I get nervous when I speak.','I make mistakes.','I feel awkward sometimes.','Real conversations. Real progress. A more confident you.'],reflection:'You don’t need to feel completely ready before you speak. Give yourself permission to try, make mistakes, and keep going.'},
 {support:[],reflection:'A difficult start doesn’t decide the rest of your journey. Keep taking small steps, and notice how far you have come.'},
 {support:['Conversation','Confidence','Real progress'],reflection:'You can begin again at any point. Choose one small thing you want to say in English today and give it a try.'},
 {support:['Real conversations','Real confidence','Real progress'],reflection:'Every new phrase gives you another way to connect with people and understand their world. Stay curious and keep opening that window.'},
 {support:['Don’t translate every thought.','Think in English.'],reflection:'Start with a simple thought in English. It doesn’t have to be a perfect sentence—let the words you already know help you express it.'},
 {support:['Work in progress','Better conversations','Bigger confidence','Fluent you'],reflection:'Loading takes time. Each conversation gives you a little more practice, and progress counts even before it feels effortless.'},
 {support:['New conversations','New places','A bigger you','More people','More opportunities','A brighter you'],reflection:'Don’t let hesitation keep you from entering. One small hello can be the beginning of a conversation you would otherwise miss.'},
 {support:['You have something to say.','Say it in English.'],reflection:'Your voice deserves to be heard. Pick something you care about and say a little about it today, using the English you have.'},
 {support:['Let’s speak English!'],reflection:'You don’t have to wait for someone else to start. Ask a question, share a thought, or tell a short story. Today can be your turn.'}
];
export function initializeGallery(doc, win) {
 const page = doc.querySelector('#daily-quote');
 if (!page) return;
 let day = null;
 function refresh() {
  const now = new win.Date(), nextDay = cairoDayNumber(now);
  if (day === nextDay) return;
  day = nextDay;
  const index = nextDay % dailyQuotes.length, entry = dailyQuotes[index], details = quoteDetails[index];
  page.querySelector('#daily-quote-image').src = entry.image;
  page.querySelector('#daily-quote-image').alt = entry.alt + (entry.embedded ? '. ' + entry.quote : '');
  page.querySelector('#daily-quote-text').textContent = entry.quote;
  page.querySelector('figcaption').hidden = Boolean(entry.embedded);
  const support = page.querySelector('#daily-quote-support');
  support.replaceChildren(...details.support.map(text => {const span=doc.createElement('span');span.textContent=text;return span;}));
  page.querySelector('#daily-quote-reflection').textContent = details.reflection;
 }
 refresh();
 let interval;
 function start() { win.clearInterval(interval); interval = win.setInterval(refresh, 1000); refresh(); }
 start();
 win.addEventListener('hashchange', refresh);
 doc.addEventListener('visibilitychange', () => { if (!doc.hidden) refresh(); });
 win.addEventListener('pagehide', () => win.clearInterval(interval));
 win.addEventListener('pageshow', start);
}
if (typeof document !== 'undefined') initializeGallery(document, window);
