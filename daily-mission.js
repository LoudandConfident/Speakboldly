import {createDailyGrammar} from './daily-grammar.js?v=zucchini';
import {dailyMissionSet} from './daily-mission-set.js?v=past-stories';
import {cairoMissionDate,missionLevels,readMissionState,writeMissionState} from './daily-mission-data.js?v=five-practices';
export function initializeDailyMission(doc,win=doc.defaultView){
 const host=doc.querySelector('#daily-mission');if(!host||host.dataset.initialized)return;host.dataset.initialized='true';
 const el=(tag,text,cls)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 let state;try{state=readMissionState(win.localStorage);}catch{state={name:'',level:'foundation',days:{}};}
 let day=cairoMissionDate(new win.Date()),playing=false,activeButton=null,mission,renderTicket=0;
 const heading=el('h3','Daily Task'),levelLabel=el('label','Choose your level'),level=el('select');for(const [key,text]of Object.entries(missionLevels)){const option=el('option',text);option.value=key;level.append(option);}level.value=state.level;levelLabel.append(level);
 const content=el('div'),status=el('p',null,'daily-mission-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');host.replaceChildren(heading,el('p','Your English is not gonna improve itself!','daily-task-intro'),levelLabel,content,status);
 function save(){try{const fresh=readMissionState(win.localStorage);fresh.level=state.level;fresh.name='';writeMissionState(win.localStorage,fresh);state=fresh;status.textContent='';}catch{status.textContent='Your browser could not remember this level. You can still use today’s mission.';}}
 function stop(){win.speechSynthesis?.cancel();playing=false;if(activeButton)activeButton.textContent=activeButton.dataset.label||'Listen';activeButton=null;}
 function audioButton(text,spoken,before){const button=el('button',text,'button light small');button.type='button';button.dataset.label=text;button.onclick=()=>{if(playing&&activeButton===button){stop();return;}stop();before?.();if(!win.speechSynthesis||!win.SpeechSynthesisUtterance){status.textContent='Read-aloud audio is unavailable in this browser. Use the paragraph as your transcript.';return;}const speech=new win.SpeechSynthesisUtterance(spoken),voices=win.speechSynthesis.getVoices();speech.lang='en-GB';const voice=voices.find(v=>v.lang==='en-GB')||voices.find(v=>/^en[-_]/i.test(v.lang));if(voice)speech.voice=voice;speech.rate=state.level==='foundation'?.8:state.level==='developing'?.92:1;activeButton=button;playing=true;button.textContent='Stop';speech.onend=()=>{if(activeButton===button)stop();};speech.onerror=event=>{if(activeButton!==button)return;stop();if(!['canceled','interrupted'].includes(event.error))status.textContent='Audio could not play. You can still read the paragraph and practise aloud.';};win.speechSynthesis.speak(speech);};return button;}
 function check(label,text){const details=el('details',null,'daily-mission-check');details.append(el('summary',label),el('p',text));return details;}
 async function render(){
  const ticket=++renderTicket;stop();content.replaceChildren();status.textContent='Loading today’s Daily Task…';
  try{const loaded=await dailyMissionSet(day,state.level);if(ticket!==renderTicket)return;mission=loaded;status.textContent='';}
  catch(error){if(ticket!==renderTicket)return;status.textContent='Today’s mission could not load. Check your connection and try again.';const retry=el('button','Try again','button small');retry.type='button';retry.onclick=render;content.append(retry);return;}
  const title=el('h4',mission.title),reading=el('section',null,'mission-reading'),paragraphs=el('div',null,'mission-paragraphs');mission.paragraphs.forEach(text=>paragraphs.append(el('p',text)));const toggle=el('button','Hide the reading','mission-text-toggle');toggle.type='button';const setReading=visible=>{paragraphs.hidden=!visible;toggle.textContent=visible?'Hide the reading':'Show the reading';};toggle.onclick=()=>setReading(paragraphs.hidden);const controls=el('div',null,'mission-audio-controls');controls.append(audioButton('Read it aloud',mission.transcript,()=>setReading(true)),toggle);reading.append(title,paragraphs,controls);content.append(reading);
  const practices=el('div',null,'mission-practices');
  const activity=(number,name)=>{const section=el('section',null,'mission-practice');section.append(el('h4',number+'. '+name));practices.append(section);return section;};
  const hear=activity(1,'Hear it');hear.append(el('p','Listen to the story, then answer this question aloud:'),el('p',mission.question,'mission-question'),audioButton('Listen to the story',mission.transcript,()=>setReading(false)),check('Reveal the answer',mission.answer));
  const say=activity(2,'Say it');say.append(el('p','Read a favourite sentence aloud, then retell the main idea in your own words. Listen to the model and notice the pauses and stressed words.'),audioButton('Listen and repeat',mission.transcript,()=>setReading(true)));
  const learn=activity(3,'Learn it');for(const item of mission.useItems.slice(0,2)){const entry=el('div',null,'mission-expression-entry');entry.append(el('p',item.expression+' — '+item.meaning,'mission-expression'),el('p','Ex: '+item.example));learn.append(entry);}
  practices.append(createDailyGrammar(doc,day,{card:true,number:4}));
  const fix=activity(5,'Fix it');fix.append(el('p','Correct both sentences before revealing the answers. Say each corrected sentence aloud:'));for(const [index,item] of mission.fixItems.entries()){fix.append(el('blockquote',(index+1)+'. '+item.mistake),check('Reveal answer '+(index+1)+' and explanation',item.answer+' '+item.explanation));}
  content.append(practices);content.append(el('p','That’s a wrap! Same time tomorrow?','mission-tomorrow'));

 }
 function rollover(){const today=cairoMissionDate(new win.Date());if(today===day)return false;day=today;status.textContent='';render();return true;}
 level.onchange=()=>{state.level=level.value;save();render();};doc.addEventListener('daily-mission-open',rollover);doc.addEventListener('daily-mission-pause',stop);doc.addEventListener('student-portal-locking',stop);doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stop();else rollover();});win.addEventListener('hashchange',()=>{rollover();if(!win.location.hash.startsWith('#students-portal'))stop();});
 let timer;const startTimer=()=>{if(timer==null)timer=win.setInterval(()=>{if(!doc.hidden)rollover();},30000);};startTimer();win.addEventListener('pageshow',()=>{rollover();startTimer();});win.addEventListener('pagehide',()=>{stop();win.clearInterval(timer);timer=null;});render();return {refresh:rollover};
}
if(typeof document!=='undefined')initializeDailyMission(document);
