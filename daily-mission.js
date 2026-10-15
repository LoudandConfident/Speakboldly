import {dailyMission,cairoMissionDate,missionWeekDates,missionLevels,readMissionState,writeMissionState,MISSION_STORAGE_KEY} from './daily-mission-data.js?v=daily-missions-1';
export function initializeDailyMission(doc,win=doc.defaultView){
 const host=doc.querySelector('#daily-mission');if(!host||host.dataset.initialized)return;host.dataset.initialized='true';
 const el=(tag,text,cls)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(cls)node.className=cls;return node;};
 let state;try{state=readMissionState(win.localStorage);}catch{state={name:'',level:'foundation',days:{}};}
 let day=cairoMissionDate(new win.Date()),mission,playing=false,audioButton=null;
 const details=el('details'),summary=el('summary'),summaryText=el('span'),summaryTitle=el('strong','Your 5-minute English mission'),summaryNote=el('span','','daily-mission-summary-note');summaryText.append(summaryTitle,summaryNote);const plus=el('span','+','daily-mission-plus');plus.setAttribute('aria-hidden','true');summary.append(summaryText,plus);details.append(summary);
 const body=el('div',null,'daily-mission-body');
 const profile=el('div',null,'daily-mission-profile'),nameLabel=el('label','Your name (optional)'),name=el('input'),levelLabel=el('label','Choose your practice level'),level=el('select');name.type='text';name.maxLength=60;name.autocomplete='given-name';name.value=state.name;nameLabel.append(name);for(const [key,label]of Object.entries(missionLevels)){const option=el('option',label);option.value=key;level.append(option);}level.value=state.level;levelLabel.append(level);profile.append(nameLabel,levelLabel);
 const privacy=el('p','Your name, responses, and practice history stay in this browser on this device. They are not sent to your instructor. No account is needed.','daily-mission-note');
 const greeting=el('p',null,'daily-mission-greeting'),content=el('div'),tracker=el('div',null,'daily-mission-tracker'),weekLabel=el('p'),week=el('ol'),status=el('p',null,'daily-mission-status');status.setAttribute('role','status');status.setAttribute('aria-live','polite');week.setAttribute('aria-label','Your practice days this week');tracker.append(weekLabel,week);body.append(greeting,profile,privacy,content,tracker,status);details.append(body);host.replaceChildren(details);
 function entry(){return state.days[day]||(state.days[day]={answer:'',done:false,level:state.level});}
 function persist(message='Saved on this device.'){
  try{const latest=readMissionState(win.localStorage);const current=entry();state.days={...state.days,...latest.days,[day]:current};writeMissionState(win.localStorage,state);status.textContent=message;return true;}
  catch{status.textContent='This browser could not save your progress. Keep this page open; your work may be lost when you leave.';return false;}
 }
 function progress(){
  const dates=missionWeekDates(day),completed=dates.filter(date=>state.days[date]?.done===true).length;weekLabel.textContent='You practised on '+completed+' '+(completed===1?'day':'days')+' this week.';week.replaceChildren();
  for(const date of dates){const item=el('li'),label=new Intl.DateTimeFormat('en-GB',{weekday:'short',timeZone:'UTC'}).format(new Date(date+'T12:00:00Z')),done=state.days[date]?.done===true;item.textContent=label+(done?' ✓':'');item.dataset.done=String(done);item.setAttribute('aria-label',date+(done?' — practised':' — not marked complete'));if(date===day)item.setAttribute('aria-current','date');week.append(item);}
  const current=entry();summaryNote.textContent=(current.done?'Completed today · ':'Today · ')+mission.type+' · '+mission.title;
 }
 function stopAudio(){win.speechSynthesis?.cancel();playing=false;if(audioButton)audioButton.textContent='Listen to the message';}
 function render(){
  stopAudio();const record=entry();mission=dailyMission(day,state.level);content.replaceChildren();greeting.textContent=state.name?'Welcome back, '+state.name+'.':'A little practice, every day.';
  const date=el('p',new Intl.DateTimeFormat('en-GB',{weekday:'long',day:'numeric',month:'long',timeZone:'UTC'}).format(new Date(day+'T12:00:00Z'))+' · '+mission.type,'daily-mission-date');
  content.append(date,el('h4',mission.title),el('p',mission.instruction),el('p',mission.difficulty,'daily-mission-note'));
  if(mission.reading)content.append(el('blockquote',mission.reading));
  let model;
  if(mission.model){model=el('details',null,'daily-mission-model');model.append(el('summary',mission.audio?'Show transcript':'Show the check'),el('p',mission.model));}
  if(mission.audio){const listen=el('button','Listen to the message','button light small');listen.type='button';audioButton=listen;listen.onclick=()=>{if(playing){stopAudio();listen.textContent='Listen to the message';return;}if(!win.speechSynthesis||!win.SpeechSynthesisUtterance){model.open=true;status.textContent='Audio is unavailable here. Read the transcript, look away, and retell the message.';return;}const utterance=new win.SpeechSynthesisUtterance(mission.audio),voices=win.speechSynthesis.getVoices();utterance.lang='en-GB';const voice=voices.find(v=>v.lang==='en-GB')||voices.find(v=>/^en[-_]/i.test(v.lang));if(voice)utterance.voice=voice;utterance.rate=state.level==='foundation'?.85:1;const finish=()=>{playing=false;listen.textContent='Listen to the message';};utterance.onend=finish;utterance.onerror=event=>{finish();if(['canceled','interrupted'].includes(event.error))return;model.open=true;status.textContent='Audio could not play. You can use the transcript instead.';};win.speechSynthesis.cancel();playing=true;listen.textContent='Stop listening';win.speechSynthesis.speak(utterance);};content.append(listen,el('p','Audio uses your device’s English voice. You can also open the transcript.','daily-mission-note'));}
  const responseLabel=el('label',mission.response),response=el('textarea');response.rows=4;response.maxLength=4000;response.value=record.answer;response.placeholder='Your response or a few notes…';responseLabel.append(response);content.append(responseLabel);if(model)content.append(model);
  const actions=el('div',null,'daily-mission-actions'),complete=el('button',record.done?'Practised today ✓':'I practised today','button small');complete.type='button';complete.disabled=record.done;const undo=el('button','Undo today’s check-in','daily-mission-undo');undo.type='button';undo.hidden=!record.done;actions.append(complete,undo);content.append(actions,el('p','This is your practice space. Use the model to reflect; responses are not automatically graded.','daily-mission-note'));
  response.oninput=()=>{if(cairoMissionDate(new win.Date())!==day){record.answer=response.value;persist();rollover();return;}record.answer=response.value;record.level=state.level;persist();};
  complete.onclick=()=>{if(rollover())return;entry().done=true;entry().level=state.level;persist('Today’s practice is marked complete on this device.');complete.textContent='Practised today ✓';complete.disabled=true;undo.hidden=false;progress();};
  undo.onclick=()=>{if(rollover())return;entry().done=false;persist('Today’s check-in was undone. Your notes are still saved.');complete.textContent='I practised today';complete.disabled=false;undo.hidden=true;progress();};
  progress();
 }
 function rollover(){const today=cairoMissionDate(new win.Date());if(today===day)return false;day=today;status.textContent='A new day, a new mission.';render();return true;}
 name.oninput=()=>{state.name=name.value.trim();greeting.textContent=state.name?'Welcome back, '+state.name+'.':'A little practice, every day.';persist();};
 level.onchange=()=>{state.level=level.value;entry().level=state.level;persist();render();};
 doc.addEventListener('daily-mission-pause',stopAudio);doc.addEventListener('student-portal-locking',stopAudio);
 doc.addEventListener('visibilitychange',()=>{if(doc.hidden)stopAudio();else rollover();});
 win.addEventListener('hashchange',()=>{rollover();if(!win.location.hash.startsWith('#students-portal'))stopAudio();});
 win.addEventListener('storage',event=>{if(event.key!==MISSION_STORAGE_KEY)return;try{state=readMissionState(win.localStorage);name.value=state.name;level.value=state.level;render();}catch{}});
 let timer;const startTimer=()=>{if(timer==null)timer=win.setInterval(()=>{if(!doc.hidden)rollover();},30000);};startTimer();win.addEventListener('pageshow',()=>{rollover();startTimer();});win.addEventListener('pagehide',()=>{stopAudio();win.clearInterval(timer);timer=null;});
 details.addEventListener('toggle',()=>{if(!details.open)stopAudio();else rollover();});render();
 return {refresh:rollover};
}
if(typeof document!=='undefined')initializeDailyMission(document);
