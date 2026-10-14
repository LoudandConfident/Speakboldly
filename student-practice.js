export function practiceWeekKey(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
 const get=type=>parts.find(p=>p.type===type).value;
 const date=new Date(Date.UTC(Number(get('year')),Number(get('month'))-1,Number(get('day'))));
 date.setUTCDate(date.getUTCDate()-((date.getUTCDay()+6)%7));
 return 'speak-boldly-weekly-practice:'+date.toISOString().slice(0,10);
}
export function initializePractice(doc){
 const panel=doc.querySelector('#portal-practice');if(!panel||panel.dataset.initialized)return;
 panel.dataset.initialized='true';
 let key='',state={};const storage=()=>doc.defaultView.localStorage;
 function load(){const next=practiceWeekKey();if(next===key)return;key=next;try{state=JSON.parse(storage().getItem(key)||'{}')||{};}catch{state={};}
 panel.querySelectorAll('[data-practice-task]').forEach(input=>input.checked=state[input.dataset.practiceTask]===true);
 panel.querySelectorAll('[name=practice-days]').forEach(input=>input.checked=Number(input.value)===(Number(state.goal)||4));}
 load();
 panel.addEventListener('change',event=>{const input=event.target;if(!input.matches('[data-practice-task],[name=practice-days]'))return;
 const next=practiceWeekKey();if(next!==key){key='';load();}
 if(input.dataset.practiceTask)state[input.dataset.practiceTask]=input.checked;else state.goal=Number(input.value);
 try{storage().setItem(key,JSON.stringify(state));panel.querySelector('[role=status]').textContent='Saved on this device.';}catch{panel.querySelector('[role=status]').textContent='Your browser could not save these choices.';}
 });
 doc.addEventListener('visibilitychange',()=>{if(!doc.hidden)load();});
 doc.defaultView.addEventListener('hashchange',load);
}
