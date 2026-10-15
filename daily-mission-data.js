// A 371-day rotation: 53 everyday topics × 7 practice formats.
const topics=[
 ['Making plans','Arrange a time to meet someone.','Could we meet on Saturday afternoon? I am free after two.'],
 ['Asking for help','Ask someone to explain something you do not understand.','Could you explain that again? A short example would help me.'],
 ['Your morning','Describe what you usually do before starting your day.','I usually have breakfast before I leave home. Today I am starting a little earlier.'],
 ['A favourite meal','Describe a meal you enjoy and why you like it.','My favourite meal is simple to prepare. I enjoy sharing it with my family.'],
 ['Getting directions','Ask how to reach a place you have not visited.','Is the station near here? I would prefer to walk if it is not too far.'],
 ['A small achievement','Describe something you managed to do recently.','I finished a task that I had been avoiding. Taking the first step made it easier.'],
 ['Shopping','Ask for information about something you want to buy.','Does this come in a different size? I would like to compare the two options.'],
 ['A useful habit','Explain a habit that makes your day easier.','I write a short list before I start work. It helps me decide what matters most.'],
 ['Introducing yourself','Introduce yourself to someone you have just met.','I am interested in learning new skills. At the moment, I am working on my English.'],
 ['Changing a booking','Ask to change the time of an appointment.','Would it be possible to move my appointment? Thursday morning would suit me better.'],
 ['A place you enjoy','Describe a place where you like spending time.','There is a quiet place near my home. I go there when I need a short break.'],
 ['Giving advice','Suggest a small step that could help a friend.','You could start with one small task. You do not have to finish everything today.'],
 ['Your weekend','Describe a weekend you enjoyed or one you are planning.','Last weekend, I spent time with a friend. We went for a walk and talked for hours.'],
 ['Comparing options','Compare two ways of doing an everyday task.','The first option costs less, but it takes longer. The second option would save me time.'],
 ['A missed call','Leave a short message for someone who did not answer.','Hi, I called about our plans for tomorrow. Please call me back when you have a moment.'],
 ['An unexpected change','Explain how you adapted when a plan changed.','Our original plan did not work out. We chose a simpler option and still enjoyed the day.'],
 ['Learning a skill','Describe a skill you would like to develop.','I would like to learn how to cook a new dish. I plan to start with an easy recipe.'],
 ['A polite request','Ask someone to do something in a considerate way.','Could you send me the details when you have time? I would like to read them before our meeting.'],
 ['Working together','Suggest how two people could share a task.','I can prepare the first part if you check the details. Then we can review everything together.'],
 ['A journey','Describe how you get to a place you often visit.','I usually take the bus because it is convenient. If the weather is pleasant, I walk part of the way.'],
 ['Explaining a problem','Explain what is wrong and what help you need.','I am having trouble opening the file. Could you send it in a different format?'],
 ['Your interests','Talk about something you enjoy doing in your free time.','I enjoy activities that help me relax. Recently, I have been making more time for reading.'],
 ['Making a suggestion','Suggest an activity and explain why it could work.','Why do we not try a different place this time? It is nearby and has enough space for everyone.'],
 ['A busy day','Describe how you choose priorities when you are busy.','I have several things to finish today. I will start with the most urgent task and take a short break afterwards.'],
 ['Thanking someone','Thank someone and explain what their help meant to you.','Thank you for taking the time to help me. Your explanation made the next step much clearer.'],
 ['A new experience','Describe something you tried for the first time.','I felt unsure before I started. Once I tried it, I realised I could learn as I went along.'],
 ['Describing an object','Explain what an everyday object looks like and how you use it.','It is small enough to carry in my bag. I use it almost every day because it is practical.'],
 ['Checking understanding','Check that you have understood a plan correctly.','Let me check that I understood correctly. We are meeting at ten, and I should bring my notes.'],
 ['A recommendation','Recommend a book, film, place, or activity.','I would recommend it to someone who enjoys a good story. The beginning is slow, but it becomes more interesting.'],
 ['Waiting for something','Explain what you are waiting for and what you will do next.','I am waiting for a reply before I make a decision. In the meantime, I can prepare the information we need.'],
 ['A simple explanation','Explain a familiar process in a clear order.','First, check that you have everything you need. Next, follow the steps carefully and check the result.'],
 ['Your neighbourhood','Describe something useful or interesting near your home.','There is a small shop at the end of my street. It is useful when I only need a few things.'],
 ['Agreeing and disagreeing','Respond to an opinion politely and explain your view.','I understand your point, but I see it a little differently. I think we should consider another option.'],
 ['An invitation','Invite someone to an activity and give the essential details.','Would you like to join us on Friday? We are meeting in the afternoon, and you are welcome to bring a friend.'],
 ['An improvement','Describe something you would like to improve in your routine.','I would like to spend less time rushing in the morning. Preparing a few things the night before might help.'],
 ['Ordering something','Place a simple order and ask a follow-up question.','I would like a sandwich and a bottle of water, please. Is it possible to have the sauce on the side?'],
 ['A difficult choice','Explain a choice you made and the reason for it.','Both options had advantages. I chose the one that suited my situation better at the time.'],
 ['Describing a person','Describe someone you appreciate without sharing private details.','This person is patient and easy to talk to. They listen carefully and make others feel welcome.'],
 ['Solving a small problem','Describe a practical step you could take when something goes wrong.','The first approach did not work. I checked the instructions and tried one change at a time.'],
 ['Asking a follow-up question','Ask for more detail about something someone has said.','That sounds interesting. What made you decide to try it, and how did it go?'],
 ['A personal goal','Describe a goal and one realistic step towards it.','My goal is to feel more comfortable using English. This week, I will practise a little on three different days.'],
 ['A short update','Give someone a clear update on a task.','I have finished the first part and checked the main details. I expect to complete the rest tomorrow.'],
 ['An apology','Apologise for a small mistake and suggest a way to put it right.','I am sorry I sent the wrong time. The meeting starts at eleven, and I will send a corrected message now.'],
 ['Explaining a preference','Say which option you prefer and give a reason.','I would prefer an earlier time because I have another commitment later. Would that work for you?'],
 ['Looking back','Compare how you felt before and after learning something.','At first, I needed help with every step. Now I can do the basics on my own and ask more specific questions.'],
 ['A useful service','Explain what a service does and why someone might use it.','This service helps people organise their appointments. It sends a reminder so they do not forget the time.'],
 ['Setting a boundary','Say what you can and cannot do politely.','I cannot finish everything today, but I can help with the first part. Would tomorrow morning work for the rest?'],
 ['A small celebration','Describe a reason to celebrate and how you would mark it.','It does not have to be a big event. A simple meal together would be a lovely way to celebrate.'],
 ['Clarifying a message','Rewrite an unclear message so the next step is obvious.','Please send the updated document by Wednesday afternoon. Let me know if you need any information from me.'],
 ['A future plan','Talk about something you hope to do in the coming months.','I hope to make time for something new this year. I have not decided on all the details, but I know where to begin.'],
 ['Giving feedback','Share one positive point and one constructive suggestion.','The main idea is clear and easy to follow. One extra example would make the explanation even stronger.'],
 ['A memorable conversation','Describe what made a conversation helpful or enjoyable.','The conversation helped me understand a different point of view. We asked questions and gave each other time to answer.'],
 ['Your next step','Choose one thing you can put into practice today.','I do not need to change everything at once. Today, I will choose one useful idea and put it into practice.']
];
const phrases=['Could you help me with…?','What I mean is…','Would it be possible to…?','One thing I have noticed is…','The main reason is…','Let me check that I understood.','A useful next step would be…'];
const corrections={
 foundation:[['She go to work every day.','She goes to work every day.','Use goes with she, he, or it in the present simple.'],['I am agree with you.','I agree with you.','Agree is a verb; it does not need am here.'],['Yesterday I go shopping.','Yesterday I went shopping.','Use the past form went for a completed action yesterday.'],['He has two childs.','He has two children.','The plural of child is children.'],['I did not went there.','I did not go there.','Use the base form go after did not.'],['There is many people here.','There are many people here.','Use are with a plural noun.'],['Can you to help me?','Can you help me?','Use the base form without to after can.']],
 developing:[['I have visited her yesterday.','I visited her yesterday.','Use the past simple with a finished time such as yesterday.'],['I look forward to hear from you.','I look forward to hearing from you.','To is a preposition in look forward to; follow it with an -ing form.'],['If I will have time, I will call.','If I have time, I will call.','Use the present simple in the if-clause of this first conditional.'],['I have been here since three hours.','I have been here for three hours.','Use for with a duration; use since with a starting point.'],['Despite of the rain, we went out.','Despite the rain, we went out.','Despite is followed directly by a noun or -ing form, without of.'],['She suggested to meet earlier.','She suggested meeting earlier.','Suggest can be followed by an -ing form.'],['I am used to work early.','I am used to working early.','Be used to means be accustomed to; use an -ing form after to.']],
 stretching:[['Had I knew, I would have helped.','Had I known, I would have helped.','In this inverted third conditional, use had plus the past participle.'],['Not only he arrived late, but he also forgot his notes.','Not only did he arrive late, but he also forgot his notes.','An initial not only triggers inversion: did he arrive.'],['The proposal needs to be discuss.','The proposal needs to be discussed.','A passive infinitive uses to be plus the past participle.'],['No sooner we arrived than it began to rain.','No sooner had we arrived than it began to rain.','Initial no sooner uses inversion, typically with the past perfect.'],['The report, which I sent it yesterday, is ready.','The report, which I sent yesterday, is ready.','Do not repeat the object it inside a relative clause where which is already the object.'],['Were I you, I will reconsider.','Were I you, I would reconsider.','Use would for the imagined result of this hypothetical condition.'],['Only when I checked I noticed the mistake.','Only when I checked did I notice the mistake.','An initial only when clause triggers inversion in the main clause.']]
};
export const missionLevels={foundation:'A1–A2 · Simple English',developing:'B1–B2 · More advanced',stretching:'C1–C2 · Professional English'};
export function cairoMissionDate(now=new Date()){
 const parts=new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),get=key=>parts.find(p=>p.type===key).value;return get('year')+'-'+get('month')+'-'+get('day');
}
export function missionWeekDates(day){const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()-(date.getUTCDay()+6)%7);return Array.from({length:7},(_,i)=>{const next=new Date(date);next.setUTCDate(next.getUTCDate()+i);return next.toISOString().slice(0,10);});}
export function dailyMission(day,level='foundation'){
 if(!Object.hasOwn(missionLevels,level))level='foundation';
 const ordinal=Math.floor(Date.parse(day+'T12:00:00Z')/86400000);if(!Number.isFinite(ordinal))throw new Error('Invalid mission date.');
 const index=((ordinal-Math.floor(Date.UTC(2026,0,1)/86400000))%371+371)%371,topic=topics[Math.floor(index/7)],kind=index%7,phrase=phrases[Math.floor(index/7)%phrases.length];
 const difficulty=level==='foundation'?'Use 2–3 short sentences. Simple, clear English is enough.':level==='developing'?'Add a reason and a specific example. Connect your ideas in 4–5 sentences.':'Give a concise but nuanced response. Consider another perspective and vary your phrasing.';
 const formats=[
  {type:'Say it',instruction:'Speak for 30–60 seconds. '+topic[1]+' Try once without notes, then repeat with one improvement.',response:'Write a few key words or a short reflection.'},
  {type:'Hear it',instruction:'Listen twice without reading. Summarise the message, then open the transcript to check what you heard.',audio:topic[2],model:topic[2],response:'What was the speaker’s main message?'},
  {type:'Use it',instruction:'Use “'+phrase+'” in a short exchange about '+topic[0].toLowerCase()+'. Write both speakers’ replies, then say the exchange aloud.',model:'Check: does the expression fit the situation, and is your meaning clear?',response:'Write your short exchange.'},
  {type:'Fix it',instruction:'Find and correct the mistake: “'+corrections[level][Math.floor(index/7)%7][0]+'” Then write a sentence of your own about '+topic[0].toLowerCase()+'.',model:corrections[level][Math.floor(index/7)%7][1]+' '+corrections[level][Math.floor(index/7)%7][2],response:'Write the corrected sentence and your own example.'},
  {type:'Read & respond',instruction:'Read the short message below. Give it a one-sentence summary, then write a reply or a relevant follow-up question.',reading:topic[2],model:'Compare your summary with the message: did you keep the main idea? Check whether your reply follows naturally.',response:'Write your summary and reply.'},
  {type:'Try it outside',instruction:topic[1]+' Try it in a real conversation if you have the opportunity, or role-play both sides yourself. Notice one expression you want to reuse.',response:'What did you try, and what will you improve next time?'},
  {type:'Recall & repeat',instruction:'Read the model below once. Look away and retell it in your own words. Then change one detail to make it true for you and say it again.',reading:topic[2],response:'Write your own version from memory.'}
 ];return {id:'mission-v1-'+index,type:formats[kind].type,title:topic[0],...formats[kind],difficulty,day,level};
}
export const MISSION_STORAGE_KEY='speak-boldly-daily-missions-v1';
export function readMissionState(storage){try{const raw=JSON.parse(storage.getItem(MISSION_STORAGE_KEY)||'{}');const days={};if(raw&&typeof raw.days==='object'&&raw.days)for(const [day,entry]of Object.entries(raw.days).sort().slice(-400)){if(!/^\d{4}-\d{2}-\d{2}$/.test(day)||!entry||typeof entry!=='object')continue;days[day]={answer:typeof entry.answer==='string'?entry.answer.slice(0,4000):'',done:entry.done===true,level:Object.hasOwn(missionLevels,entry.level)?entry.level:'foundation'};}return {name:typeof raw?.name==='string'?raw.name.slice(0,60):'',level:Object.hasOwn(missionLevels,raw?.level)?raw.level:'foundation',days};}catch{return {name:'',level:'foundation',days:{}};}}
export function writeMissionState(storage,state){const days=Object.fromEntries(Object.entries(state.days).sort().slice(-400));storage.setItem(MISSION_STORAGE_KEY,JSON.stringify({version:1,name:state.name,level:state.level,days}));}
