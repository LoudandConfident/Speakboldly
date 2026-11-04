import {filmArtwork} from './film-posters.js';
import {cultureFilms,novelDetails,filmFortnight} from './culture-corner-data.js?v=weekly-family-2';
import {createClearEnglishReading} from './clear-english-reading.js?v=culture-pause-2';
import {createRealEnglishExtras} from './real-english-extras.js?v=fun-only-2';
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
export const NATIVE_ROTATION_START='2027-02-01';
export function nativeSelection(now=new Date(),settings={}){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),get=key=>parts.find(part=>part.type===key).value,day=get('year')+'-'+get('month')+'-'+get('day'),actualMonth=day.slice(0,7),frozen=day<NATIVE_ROTATION_START;
 const manual=settings.mode==='manual',offset=frozen?0:Math.max(0,(Number(get('year'))-2027)*12+Number(get('month'))-2)+1;
 return {key:!manual&&frozen?'2026-10':actualMonth,link:manual?Math.max(0,Math.min(11,Number(settings.manualLink)||0)):offset%12,novel:manual?Math.max(0,Math.min(23,Number(settings.manualNovel)||0)):offset%24,mode:manual?'manual':'automatic',frozen};
}
export function monthlyLearningPage(now=new Date(),settings={}){const selected=nativeSelection(now,settings);return {...MONTHLY_LEARNING_PAGES[selected.link],...selected,label:selected.mode==='manual'?'Selected by your instructor':selected.frozen?'Selected for you':new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',month:'long',year:'numeric'}).format(now)};}
export function monthlyLearningForKey(key){if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(key))throw new Error('Choose a valid month.');const date=new Date(key+'-01T12:00:00Z'),year=Number(key.slice(0,4)),month=Number(key.slice(5)),index=((year*12+month-1-(2026*12+9))%12+12)%12;return {...MONTHLY_LEARNING_PAGES[index],key,label:new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',month:'long',year:'numeric'}).format(date)};}
export function validateMonthlyPage(value){const page={};for(const [key,max]of [['source',150],['title',200],['url',2000],['brief',3000]]){if(typeof value?.[key]!=='string'||!value[key].trim()||value[key].trim().length>max)throw new Error('Check '+key+' (maximum '+max+' characters).');page[key]=value[key].trim();}const url=new URL(page.url);if(url.protocol!=='https:'||url.username||url.password||/[\s\\]/.test(page.url))throw new Error('Use a complete HTTPS link.');return page;}
export function monthlyFeature(doc,page){const text=(tag,value)=>{const node=doc.createElement(tag);node.textContent=value;return node;};const feature=doc.createElement('article');feature.className='monthly-learning-feature';const month=text('p',page.label);month.className='eyebrow';const source=text('p',page.source);source.className='monthly-learning-source';const link=text('a','Visit this month’s page');link.className='button';link.href=page.url;link.target='_blank';link.rel='noopener noreferrer';link.setAttribute('aria-label','Visit '+page.title+' on '+page.source+' (opens in a new tab)');feature.append(month,text('h4',page.title),source,text('p',page.brief),link);return feature;}
import {MONTHLY_NOVELS} from './novels-catalog.js?v=simplified-reading-3';

export function initializeMonthlyLearning(doc){
 const root=doc.querySelector('#portal-monthly');if(!root)return {open(){},lock(){}};
 const win=doc.defaultView,endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue;let current='',stamp='',timer,ticket=0,pending=false,lastChecked=0,settings={},filmSettings={},view=0,filmCheck=0;
 const text=(tag,value)=>{const node=doc.createElement(tag);node.textContent=value;return node;};
 const activityArt=kind=>{const art=doc.createElement('div');art.className='culture-activity-art';art.dataset.activity=kind;art.setAttribute('aria-hidden','true');return art;};
 function render(page,message=''){
  const selected=MONTHLY_NOVELS[page.novel||0],signature=JSON.stringify([{...page,key:undefined},selected,new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new win.Date()),filmFortnight(new win.Date())]);current=page.key;if(signature===stamp){const note=root.querySelector(':scope>[role=status]');if(note)note.textContent=message;return;}stamp=signature;root.querySelector('.novel-reader')?._closeReader?.();root.querySelector('.clear-english-reading')?.destroy?.();
  root.replaceChildren(text('h3','Culture Corner'),text('p','Watch a little. Read a little. Bring English into your world.'));const layout=doc.createElement('div');layout.className='real-english-layout';const main=doc.createElement('div');main.className='real-english-main';layout.append(main,createRealEnglishExtras(doc));root.append(layout);
  const sections=[],nav=doc.createElement('nav');nav.className='culture-navigation';nav.setAttribute('aria-label','Culture Corner pages');const prev=text('button','← Monthly videos'),next=text('button','Read Monthly Novel →'),position=text('span','');for(const b of [prev,next]){b.type='button';b.className='button light small';}position.setAttribute('role','status');nav.append(prev,position,next);main.append(nav);
  const listening=doc.createElement('section');listening.className='culture-page native-listening-part';listening.append(monthlyFeature(doc,page));const task=text('h4','Make it a small English habit'),list=doc.createElement('ol');for(const instruction of ['Open this month’s video page and choose a short video that interests you.','Listen once for the main idea, then watch with English subtitles where available.','Translate unfamiliar words or phrases to understand more of the content; replay the sentence afterwards.','Keep a notebook beside you. Write three new expressions and one example of your own for each.','Say a few lines aloud. Try the speaker’s rhythm, then tell someone what you watched.'])list.append(text('li',instruction));listening.append(task,list);const coach=text('button','Ask your coach');coach.type='button';coach.className='button light small';coach.onclick=()=>doc.querySelector('[data-portal-tab="contact"]')?.click();listening.append(text('p','Something unclear? Send your coach a question about the video or the English you are practising. Questions go to askcoach@speakboldly.space.'),coach,createClearEnglishReading(doc));main.append(listening);sections.push(listening);
  const info=novelDetails(selected),novels=doc.createElement('section');novels.className='culture-page monthly-novels';novels.append(text('p','THIS MONTH’S NOVEL'),text('h4',selected.title),text('p','By '+selected.author),text('p',info.brief));
  const versions=doc.createElement('div');versions.className='culture-book-choices';const reader=doc.createElement('div');reader.className='novel-reader';reader.hidden=true;const versionButtons=[];
  async function openVersion(simplified){versionButtons.forEach(b=>b.disabled=true);try{const {openNovelReader}=await import('./novel-reader.js?v=sharp-single-reader-3');if(!root.hidden&&view===1){await openNovelReader(doc,reader,simplified?{...selected,...selected.simplified,title:selected.title+' — Simplified by Speak Boldly'}:selected);versions.hidden=Boolean(reader.querySelector('canvas'));}}catch{reader.hidden=false;reader.textContent='The book could not open. Please try again.';}finally{versionButtons.forEach((b,i)=>b.disabled=i===1&&!selected.simplified);}}
  for(const simplified of [false,true]){const button=text('button','');button.type='button';button.className='culture-book-choice'+(simplified?' is-simplified':'');button.setAttribute('aria-label','Open '+selected.title+(simplified?' simplified by Speak Boldly':' original version'));button.append(text('small',simplified?'SIMPLIFIED BY SPEAK BOLDLY':'ORIGINAL NOVEL'),text('strong',selected.title),text('small',simplified?(selected.simplified?selected.simplified.pages+' pages · Modern English':'Coming soon'):selected.author));button.disabled=simplified&&!selected.simplified;button.onclick=()=>openVersion(simplified);versions.append(button);versionButtons.push(button);}
  reader.addEventListener('novel-reader-closed',()=>{versions.hidden=false;});novels.append(versions,reader,text('p','Choose a book to read here. Close it to return to both editions. Your reading page is remembered on this device.'));main.append(novels);sections.push(novels);
  const movies=doc.createElement('section');movies.className='culture-page culture-films';movies.append(activityArt('films'));movies.append(text('h4','From page to screen'));
  function movieCard(film,cls){const card=doc.createElement('article');card.className=cls;const artwork=filmArtwork(film);if(artwork){const image=doc.createElement('img');image.className='culture-film-poster';image.src=artwork.poster;image.alt=film.title+' original film poster';image.loading='lazy';image.decoding='async';image.draggable=false;image.referrerPolicy='no-referrer';image.oncontextmenu=event=>event.preventDefault();image.onerror=()=>{image.remove();};card.append(image);}card.append(text('h5',film.title+' ('+film.year+')'));if(film.genre)card.append(text('p',film.genre));card.append(text('p',film.brief));if(artwork?.cast)card.append(text('p','Starring: '+artwork.cast));if(film.language)card.append(text('p',film.language));return card;}
  if(info.adaptation)movies.append(movieCard(info.adaptation,'culture-adaptation'));else movies.append(text('p','No film adaptation is featured for this selection.'));
  movies.append(text('h4','Two films for your week'),text('p',filmSettings.mode==='manual'?'Selected by your coach.':'Fresh recommendations every week.'));const grid=doc.createElement('div');grid.className='culture-film-grid';for(const film of cultureFilms(new win.Date(),filmSettings))grid.append(movieCard(film,'culture-film-card'));movies.append(grid,text('p',"Read English subtitles and translate what you need. Pause when you hear words you do not know how to pronounce, then listen and repeat. If you do not have time for a full film, watch 15 minutes each night."));main.append(movies);sections.push(movies);
  function show(index){const nextView=Math.max(0,Math.min(2,index));if(nextView===2&&view!==2){view=2;stamp='';render(page);return;}view=nextView;layout.querySelector('.real-english-side').hidden=view!==0;sections.forEach((section,i)=>section.hidden=i!==view);position.textContent=(view+1)+' of 3';prev.hidden=view===0;next.hidden=view===2;prev.textContent=view===2?'← Read Monthly Novel':'← Monthly videos';next.textContent=view===0?'Read Monthly Novel →':'Explore the films →';if(view!==1){reader._closeReader?.();reader.hidden=true;versions.hidden=false;}if(view!==0)listening.querySelector('.clear-english-reading')?.pause?.();}
  prev.onclick=()=>show(view-1);next.onclick=()=>show(view+1);show(view);const status=text('p',message);status.setAttribute('role','status');root.append(status);
 }
 async function refreshFilms(){if(!endpoint||Date.now()-filmCheck<60000)return;filmCheck=Date.now();const controller=new AbortController(),timeout=win.setTimeout(()=>controller.abort(),6000);try{const response=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'cultureCornerFilms'}),signal:controller.signal}),result=await response.json();if(result.ok&&result.settings){const next=result.settings;if(JSON.stringify(next)!==JSON.stringify(filmSettings)){filmSettings=next;if(!root.hidden&&view===2){stamp='';render(monthlyLearningPage(new win.Date(),settings));}}}}catch{}finally{win.clearTimeout(timeout);}}
 async function refresh(force=false){let page=monthlyLearningPage(new win.Date(),settings);if(pending&&!force)return;if(!force&&current===page.key&&Date.now()-lastChecked<60000)return;const request=++ticket;pending=true;render(page);const checkStatus=root.querySelector(':scope>[role=status]');if(checkStatus)checkStatus.textContent='Checking the latest selections…';if(!endpoint){if(checkStatus)checkStatus.textContent='';pending=false;return;}const controller=new AbortController(),timeout=win.setTimeout(()=>controller.abort(),10000);try{let result;
  for(let pass=0;pass<2;pass++){const response=await win.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'nativeEnglishPage',month:page.key}),signal:controller.signal});result=await response.json();if(request!==ticket)return;if(!response.ok||!result.ok){if(/Invalid action|Not authorized|Incorrect connection key/i.test(result.error||'')){lastChecked=Date.now();if(checkStatus)checkStatus.textContent='';return;}throw new Error('Could not load the monthly page.');}settings=result.settings||{};const next=monthlyLearningPage(new win.Date(),settings);if(next.key===page.key){page=next;break;}page=next;}
  if(result.month!==page.key)throw new Error('Incorrect month.');render(result.page&&page.mode==='automatic'?{...page,...validateMonthlyPage(result.page)}:page);lastChecked=Date.now();
 }catch{if(request===ticket){if(!root.children.length)render(page);const status=root.querySelector('[role=status]');if(status)status.textContent='Could not check for updated content. Showing the available selection; reopen Culture Corner to retry.';}}finally{win.clearTimeout(timeout);if(request===ticket)pending=false;}}
 function tick(){if(!doc.hidden&&!root.hidden)refresh();}function start(){win.clearInterval(timer);timer=win.setInterval(tick,60000);}
 doc.addEventListener('culture-films-published',()=>{filmCheck=0;if(!root.hidden)void refreshFilms();});doc.addEventListener('visibilitychange',tick);doc.addEventListener('speak-boldly-app-resume',tick);doc.addEventListener('native-english-published',()=>{lastChecked=0;if(!root.hidden)refresh(true);});win.addEventListener('pagehide',()=>win.clearInterval(timer));win.addEventListener('pageshow',start);start();
 return {open(){void refreshFilms();return refresh();},lock(){ticket++;pending=false;current='';stamp='';lastChecked=0;root.querySelector('.clear-english-reading')?.destroy?.();root.querySelector('.novel-reader')?._closeReader?.();root.replaceChildren();}};
}

