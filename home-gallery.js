// Update this list to change the daily pictures and quotes.
export const dailyQuotes = [
 { image: './images/daily-motivation-1.png', alt: 'A notebook and phone, ready for a fresh start', quote: 'Make time for what matters.' },
 { image: './images/daily-motivation-2.png', alt: 'A welcoming study space with notes and books', quote: 'Drop the shame and get in the game.' },
 { image: './images/daily-motivation-3.png', alt: 'A runner preparing to move forward', quote: 'It’s not how you start that matters. It’s how you finish.' },
 { image: './images/daily-motivation-4.png', alt: 'A woman celebrating on a mountain at sunrise', quote: 'It is never too late to be what you might have been.' },
 { image: './images/daily-motivation-5.png', alt: 'An open window overlooking a mountain lake', quote: 'To learn a language is to have one more window from which to look at the world.' } ,{ image: './images/daily-motivation-translation-clean.png', alt: 'A quiet cafe scene with a thoughtful speech bubble', quote: 'Lost in Translation? Don’t translate every thought—think in English.', embedded: false },
 { image: './images/daily-motivation-fluency-clean.png', alt: 'A work in progress sign in a sunny street', quote: 'Fluency: loading… Work in progress.', embedded: false },
 { image: './images/daily-motivation-doors-clean.png', alt: 'An open green door leading to a flower-lined street', quote: 'English opens doors. Don’t let hesitation keep you from entering them.', embedded: false },
 { image: './images/daily-motivation-unmute-clean.png', alt: 'A microphone on a sunlit desk', quote: 'Unmute yourself. You have something to say. Say it in English.', embedded: false },
 { image: './images/daily-motivation-talk-clean.png', alt: 'A hand holding a microphone beside a notebook', quote: 'Your turn to talk.', embedded: false }
];
dailyQuotes.push(
 {image:'./images/daily-motivation-start-clean.png',alt:'A hand opening curtains to a bright morning',quote:'Start when you’re not ready.',embedded:false},
 {image:'./images/daily-motivation-listen-clean.png',alt:'Headphones and an open book on a sunlit desk',quote:'Listen. Learn. Try again.',embedded:false},
 {image:'./images/daily-motivation-keep-going-clean.png',alt:'A winding countryside path leading towards sunrise',quote:'Keep going. You’re getting there.',embedded:false}
);
dailyQuotes.push({image:'./images/daily-motivation-accents-pyramids-clean.png',alt:'A foreign tourist in a sun hat speaking with an Egyptian tour guide at the Pyramids of Giza',quote:'عقدة الخواجة — Your accent tells your story.',embedded:false});
dailyQuotes.push({image:'./images/daily-motivation-french-clean.png',alt:'An original green cartoon bird reminding a learner to practise French',quote:'I learn French myself!',embedded:false});
dailyQuotes.push({image:'./images/daily-motivation-language-skill.png',alt:'A shy young woman with a bun, glasses and Arabic books standing among stylish women chatting together',quote:'Language is just a skill!',embedded:false});
dailyQuotes.push({image:'./images/daily-motivation-ballet.png',alt:'A slightly chubby adult ballerina practising at the barre while two other women exchange smirks in a dance studio',quote:"It's never too late!",embedded:false});
export function cairoDayNumber(now = new Date()) {
 const parts = new Intl.DateTimeFormat('en-GB', {timeZone:'Africa/Cairo', year:'numeric', month:'2-digit', day:'2-digit'}).formatToParts(now);
 const part = type => Number(parts.find(p => p.type === type).value);
 return Math.floor(Date.UTC(part('year'), part('month') - 1, part('day')) / 86400000);
}
export function quoteForDate(now = new Date()) {
 return dailyQuotes[cairoDayNumber(now) % dailyQuotes.length];
}
export const quoteDetails = [
 {support:['Better opportunities','Real conversations','More confidence','A brighter you','Freedom to be you','English for real life'],reflection:'Make a little room for English today. One real conversation, one question, or one voice note can be a step towards the things that matter to you. You don’t need a perfect study routine to begin. Try describing your day, asking someone a question, or listening closely to a short conversation. Choose something that fits your life and give it a few minutes of your attention. Small moments of practice can make English feel more useful and more familiar.'},
 {support:['I’m not fluent (yet).','I get nervous when I speak.','I make mistakes.','I feel awkward sometimes.','Real conversations. Real progress. A more confident you.'],reflection:'You don’t need to feel completely ready before you speak. Give yourself permission to try, make mistakes, and keep going. Feeling nervous or searching for a word doesn’t mean you have nothing to contribute. Pause, use a simpler phrase, or ask for help when you need it. The goal is to share your meaning and connect with someone. Every time you try, you give yourself another chance to become more comfortable.'},
 {support:[],reflection:'A difficult start doesn’t decide the rest of your journey. Keep taking small steps, and notice how far you have come. Some days you will find the words quickly; other days you might need more time. Both are part of learning. When something feels difficult, return to one manageable task instead of judging your whole journey by that moment. Keep showing up for yourself, and let the next conversation be another opportunity to move forward.'},
 {support:['Conversation','Confidence','Real progress'],reflection:'You can begin again at any point. Choose one small thing you want to say in English today and give it a try. Your past experience doesn’t have to decide what you try next. Maybe you want to ask a question at work, speak while travelling, or join a conversation you usually avoid. Start with one useful sentence and build from there. You’re allowed to learn at your own pace and discover new possibilities along the way.'},
 {support:['Real conversations','Real confidence','Real progress'],reflection:'Every new phrase gives you another way to connect with people and understand their world. Stay curious and keep opening that window. Learning a language can help you hear a different perspective, enjoy a story, or feel more at home in an unfamiliar place. Pay attention to the words that make you curious and the conversations you want to have. You don’t need to understand everything at once. Each thing you learn gives you a little more to explore.'},
 {support:['Don’t translate every thought.','Think in English.'],reflection:'Start with a simple thought in English. It doesn’t have to be a perfect sentence—let the words you already know help you express it. Try naming what you see or describing what you are doing without first building a full sentence in your first language. If a word is missing, explain it with simpler words you already know. Give yourself time to practise this in ordinary moments. Little by little, expressing a thought directly in English can feel more natural.'},
 {support:['Work in progress','Better conversations','Bigger confidence','Fluent you'],reflection:'Loading takes time. Each conversation gives you a little more practice, and progress counts even before it feels effortless. You might notice progress in small ways: asking a follow-up question, finding a familiar phrase, or staying in a conversation a little longer. Those moments matter even if you still make mistakes. Choose one skill to practise today and give yourself room to work on it. You can be proud of the effort while continuing to grow.'},
 {support:['New conversations','New places','A bigger you','More people','More opportunities','A brighter you'],reflection:'Don’t let hesitation keep you from entering. One small hello can be the beginning of a conversation you would otherwise miss. Think of a situation where you usually hold back, then prepare one sentence that could help you take part. It might be a greeting, a question, or a request for clarification. You don’t have to know how the whole conversation will go. Taking that first step gives you the chance to see what comes next.'},
 {support:['You have something to say.','Say it in English.'],reflection:'Your voice deserves to be heard. Pick something you care about and say a little about it today, using the English you have. Start with a sentence you can say comfortably, then add a little more when you feel ready. It’s okay to pause, rephrase, or tell someone you need a moment. Your thoughts don’t become less valuable because you are still learning how to express them. Give yourself a chance to be heard, one conversation at a time.'},
 {support:['Let’s speak English!'],reflection:'You don’t have to wait for someone else to start. Ask a question, share a thought, or tell a short story. Today can be your turn. Think about something you enjoyed, something you learned, or a question you would like to ask. Practise saying it aloud, then use it in a conversation when you have the opportunity. Listen to the reply and stay curious about the other person. Speaking is a shared experience, and you have something to bring to it.'}
];
export const dailyPractice = [
 'Try this today: record a short voice note about something that matters to you. Listen once, choose one phrase you want to improve, and try it again. A few focused minutes are enough to make a start.',
 'Try this today: share one opinion in English without apologising for your level first. If you need to pause or correct yourself, give yourself that time. Finishing your thought matters more than getting every word right.',
 'Try this today: think of one thing you can do now that used to feel difficult. Write it down, then choose one small next step. Let your own progress guide you rather than comparing yourself with someone else.',
 'Try this today: choose a situation you would like to handle more confidently and practise two sentences for it. You can start small, repeat them aloud, and use them when the opportunity comes.',
 'Try this today: listen to a short story or conversation from somewhere unfamiliar. Pick one phrase you like and think about when you could use it. Follow your curiosity and see where it takes you.',
 'Try this today: describe three things around you directly in English. Keep the sentences simple and use a different explanation if a word is missing. You can practise expressing meaning before searching for the perfect phrase.',
 'Try this today: choose one skill to focus on for the week. Notice small changes, such as finding a word more quickly or asking a clearer question. Give yourself credit for the practice you are putting in.',
 'Try this today: prepare a simple greeting and a follow-up question for someone you would like to speak with. A conversation can begin with a very small step. You can decide what to say next once it has started.',
 'Try this today: say one thought aloud in English that you would usually keep to yourself. Repeat it slowly if that helps, then add a reason or an example. Give your voice a little more space.',
 'Try this today: start a conversation with a question you actually want to ask. Listen to the answer and share a little about yourself in return. You have a part to play in making the conversation happen.'
];
quoteDetails.push(
 {support:[],reflection:'Readiness often grows through practice. You might be waiting to know more words, feel less nervous, or find the perfect moment to speak. Give yourself a smaller beginning instead: one greeting, one question, or a short voice note. You can pause, ask for help, and correct yourself as you go. Starting with the English you have gives you something real to build on. You don’t need complete confidence to take your first step.'},
 {support:[],reflection:'Listening gives you a chance to notice how English sounds in everyday life. Pay attention to a useful phrase, the rhythm of a sentence, or the way someone asks a question. Then try it aloud and make it your own. If the first attempt feels awkward, listen again and give yourself another try. Repetition can help you become more familiar with the language. Choose something short enough to enjoy and return to, rather than trying to understand everything at once.'},
 {support:[],reflection:'Progress can be easy to miss when you are focused on everything you still want to learn. Look for the small changes: a word you remember, a question you can ask, or a conversation you stay in a little longer. Difficult days don’t erase those achievements. Adjust your pace when you need to, and choose a manageable next step. You can keep learning without rushing. Give yourself credit for showing up and making English a part of your life.'}
);
dailyPractice.push(
 'Try this today: record a thirty-second introduction without writing a script first. Say what you can, pause when you need to, and finish your thought. Let this be a beginning you can build on.',
 'Try this today: listen to a short English clip and choose one useful sentence. Repeat it aloud, then change a few words to make it about your own life. Listen once more and try again.',
 'Try this today: write down three things that feel easier in English than they used to. Choose one small task for tomorrow, and keep this list to remind yourself of the progress you are making.'
);
quoteDetails.push({support:[],reflection:'In Egypt, we sometimes make it difficult for each other to be ourselves. Why do some people mock an Egyptian mixing up “B” and “P” or pronouncing “th” differently, yet encourage an American learning Arabic or respect an Indian speaking English? We deserve that same encouragement. Learning another language is challenging, especially when the job market makes it feel compulsory. It also opens your mind and gives you new ways to express yourself. There is nothing shameful about your Arabic showing up in your English accent. You can work on pronunciation so people understand you clearly while still sounding like yourself. Before laughing at someone’s pronunciation, remember the effort they are making to communicate in another language. Your accent tells your story. It shouldn’t silence your voice.'});
dailyPractice.push('Try this today: say one thought aloud in English without apologising for your accent. Practise a sound if it helps you communicate more clearly, and encourage someone else who is learning. A little kindness can help both of you keep speaking.');
quoteDetails.push({support:[],reflection:'I became much more empathetic towards my students when I started learning French myself. I opened mobile apps, revisited old French courses and schoolbooks, and started having conversations with my phone! Suddenly, I understood what it feels like to understand someone but not be able to reply. I struggled with the French “R” because my English pronunciation habits kept getting in the way. And I felt the frustration of recognising a word but not remembering what it means. I took a placement test at a language centre, waited my turn, felt disappointed, then found my motivation again. It even brought back a school memory: in second grade, I had to learn how to ask to go to the bathroom in French before I could actually go! Being a teacher doesn’t make me immune to feeling awkward as a learner. It reminds me why patience, encouragement, and space to make mistakes matter so much.'});
dailyPractice.push('Here’s what I want you to remember: understanding can come before speaking. Needing time to reply doesn’t mean you aren’t learning. Try using one small sentence today, even if you hesitate. Forget a word? Look it up and use it in your own sentence. You don’t have to feel confident every day to keep making progress. I’m learning that alongside you.');
quoteDetails.push({support:[],reflection:"Your value is not by any means tied to the number of skills you've gained over the years! The cultural pressure might give you the impression that you are obliged to own skills and learn languages to be able to fit in in the market, or at work, or with certain groups of friends.",paragraphs:["Your value is not by any means tied to the number of skills you've gained over the years! The cultural pressure might give you the impression that you are obliged to own skills and learn languages to be able to fit in in the market, or at work, or with certain groups of friends.", "Here's your new vocabulary for today: Bullshit!", "Cambridge Dictionary meaning, paraphrased: nonsense or something untrue. Our definition for today: the idea that your English level decides whether you deserve a seat at the table.", "It's just a skill, like any other skill that requires time and effort, that people learn because they love it or because they'll start using at work or wit their kids. It's not by any means related to your identity!"]});
dailyPractice.push("It's just a skill, like any other skill that requires time and effort, that people learn because they love it or because they'll start using at work or wit their kids. It's not by any means related to your identity!");
quoteDetails.push({support:[],reflection:"Wanna laugh? Here's a joke. I started learning Ballet as a 27-year-adult.",paragraphs:["Wanna laugh? Here's a joke. I started learning Ballet as a 27-year-adult.", "Why is it funny? Because not only was I too old to begin, but also I was new to obesity, with torn cruciate knee ligament and hurt ankles. I was the chubbiest in class.. not ashamed of it don't worry. :) I didn't split yet, not gonna lie to you.", "But guess what? I was the best in class with the moves and the dances!", "My body memorized the music and moves so well that I felt like I wanted to do this since I was a kid! Why didn't I start younger? I don't know and I don't care.", "All I know is today. And today I choose to do what I love, free as a bird as if the word \"Obstacles\" never existed in my dictionary.", "If you think I'm just crazy, 3 times I've had lady clients over 60 with Grand kids. And they were precious !"]});
dailyPractice.push("All I know is today. And today I choose to do what I love, free as a bird as if the word \"Obstacles\" never existed in my dictionary.");
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
  const headline = doc.createElement('strong');
  const heading = page.querySelector('#daily-quote-text');
  const title = entry.quote;
  headline.textContent = title;
  heading.replaceChildren(headline);
  heading.hidden = !title;
  const reflection=page.querySelector('#daily-quote-reflection');
  reflection.replaceChildren(...(details.paragraphs||[details.reflection,dailyPractice[index]]).map(text=>{const paragraph=doc.createElement('p');paragraph.textContent=text;return paragraph;}));
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
