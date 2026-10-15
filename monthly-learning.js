// Curated listening pages from different sources. Rotation uses Cairo calendar months, not elapsed days.
export const MONTHLY_LEARNING_PAGES=[
  {
    "source": "BBC Learning English",
    "title": "BBC Learning English — Upper-intermediate",
    "url": "https://www.bbc.co.uk/learningenglish/english/hard_course",
    "brief": "Listen to various topics! Choose a lesson from this BBC course, listen for the main idea, and keep a few expressions you can use in your own conversations."
  },
  {
    "source": "TED Talks",
    "title": "10 ways to have a better conversation",
    "url": "https://www.ted.com/talks/celeste_headlee_10_ways_to_have_a_better_conversation",
    "brief": "Good conversations start with listening. Hear a different perspective, choose one idea that stays with you, and explain it in your own words."
  },
  {
    "source": "VOA Learning English",
    "title": "Short stories before bed",
    "url": "https://learningenglish.voanews.com/z/1581",
    "brief": "Consider yourself a toddler and listen as you go to bed. Pick a short story and let it play without stopping at every unfamiliar word. Follow the story before worrying about every detail."
  },
  {
    "source": "British Council LearnEnglish",
    "title": "Everyday conversations",
    "url": "https://learnenglish.britishcouncil.org/free-resources/general/audio-series/podcasts",
    "brief": "Spend some time with everyday English. Choose a podcast, listen to how people respond to each other, and borrow one expression for your next conversation."
  },
  {
    "source": "Easy English",
    "title": "English beyond the classroom",
    "url": "https://www.easyenglish.video/",
    "brief": "Real people do not all speak in the same way. Try a street interview and notice the pauses, reactions, and small phrases that make a conversation feel natural."
  },
  {
    "source": "Rachel’s English",
    "title": "Listen to the little sounds",
    "url": "https://rachelsenglish.com/explore/",
    "brief": "Words can sound different when they join together. Choose a free pronunciation video, listen closely to a short phrase, and try saying it with the speaker’s rhythm."
  },
  {
    "source": "Oxford Online English",
    "title": "Listen with a purpose",
    "url": "https://www.oxfordonlineenglish.com/free-english-listening-lessons",
    "brief": "Choose a listening lesson that interests you. Before pressing play, decide what you want to find out. Listen once for the answer, then again for useful language."
  },
  {
    "source": "TED-Ed",
    "title": "What does good listening look like?",
    "url": "https://www.ted.com/talks/ted_ed_4_things_all_great_listeners_know",
    "brief": "Listening is more than waiting for your turn to speak. Explore a short explanation, then choose one listening habit to practise in your next conversation."
  },
  {
    "source": "ELLLO",
    "title": "Different voices, different accents",
    "url": "https://www.elllo.org/english/",
    "brief": "English belongs to people from many places. Listen to a conversation with voices you are less familiar with. Focus on the message, and give your ears time to adjust."
  },
  {
    "source": "Speak English With Vanessa",
    "title": "Make room for everyday English",
    "url": "https://speakenglishwithvanessa.com/video-lessons/",
    "brief": "Choose a free lesson about something you might actually say. Practise a few phrases out loud, then change the examples so they describe your own life."
  },
  {
    "source": "Learn English with Bob the Canadian",
    "title": "See English in everyday life",
    "url": "https://www.youtube.com/@LearnEnglishwithBobtheCanadian",
    "brief": "Connect what you hear with the world around you. Pick a lesson about a familiar place or activity, and describe something similar from your own day."
  },
  {
    "source": "engVid",
    "title": "Follow your curiosity",
    "url": "https://www.engvid.com/english-lessons/",
    "brief": "You do not have to practise everything at once. Choose a free lesson that answers one question you have, and finish by making your own example."
  }
].map(page=>Object.freeze(page));
export function monthlyLearningPage(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit'}).formatToParts(now),year=Number(parts.find(part=>part.type==='year').value),month=Number(parts.find(part=>part.type==='month').value),offset=year*12+month-1-(2026*12+9),index=((offset%MONTHLY_LEARNING_PAGES.length)+MONTHLY_LEARNING_PAGES.length)%MONTHLY_LEARNING_PAGES.length;
 return {...MONTHLY_LEARNING_PAGES[index],key:year+'-'+String(month).padStart(2,'0'),label:new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',month:'long',year:'numeric'}).format(now)};
}
export function initializeMonthlyLearning(doc){
 const root=doc.querySelector('#portal-monthly');if(!root)return {open(){},lock(){}};
 let current='',timer;
 const text=(tag,value)=>{const node=doc.createElement(tag);node.textContent=value;return node;};
 function render(){
  const page=monthlyLearningPage();if(current===page.key&&root.children.length)return;current=page.key;root.replaceChildren(text('h3','Native English'),text('p','Sit back, watch and listen. Explore a different voice, channel, or learning page each month.'));
  const feature=doc.createElement('article');feature.className='monthly-learning-feature';const month=text('p',page.label);month.className='eyebrow';
  const source=text('p',page.source);source.className='monthly-learning-source';
  const link=text('a','Visit this month’s page');link.className='button';link.href=page.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Visit '+page.title+' on '+page.source+' (opens in a new tab)');
  feature.append(month,text('h4',page.title),source,text('p',page.brief),link,text('p','A different page appears here on the 1st of each month.'));
  const task=text('h4','Try this'),list=doc.createElement('ol');for(const instruction of ['Listen once for the main idea.','Listen again with captions or a transcript if one is available.','Choose three useful expressions and use each one in your own sentence.'])list.append(text('li',instruction));root.append(feature,task,list);
 }
 function tick(){if(!doc.hidden&&!root.hidden)render();}
 function start(){doc.defaultView.clearInterval(timer);timer=doc.defaultView.setInterval(tick,60000);}
 doc.addEventListener('visibilitychange',tick);doc.addEventListener('speak-boldly-app-resume',tick);doc.defaultView.addEventListener('pagehide',()=>doc.defaultView.clearInterval(timer));doc.defaultView.addEventListener('pageshow',start);start();
 return {open:render,lock(){current='';root.replaceChildren();}};
}
