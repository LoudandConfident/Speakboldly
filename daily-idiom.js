// Shared daily expression, selected by Cairo date and independent of reading level.
export const idioms = `Break the ice|Make a new situation feel more relaxed.|A simple question helped break the ice.
On the same page|Understand or agree about the same thing.|Let's check that we are on the same page.
A piece of cake|Something very easy.|After some practice, the task was a piece of cake.
Get the ball rolling|Start an activity or process.|I'll send the first message to get the ball rolling.
Learn the ropes|Learn how a new job or activity works.|My colleague helped me learn the ropes.
Take it one step at a time|Deal with something gradually.|The course is challenging, so take it one step at a time.
Go the extra mile|Make more effort than expected.|She went the extra mile to explain the instructions.
Think outside the box|Look for an unusual or creative solution.|We need to think outside the box to solve this problem.
In a nutshell|In a few clear words.|In a nutshell, we need more time to prepare.
The big picture|The overall situation rather than small details.|Before changing the plan, look at the big picture.
Keep an open mind|Be willing to consider new ideas.|Keep an open mind when trying a new study method.
Get the hang of it|Learn how to do something.|I found it difficult at first, but I'm getting the hang of it.
Back to square one|Back at the beginning after an unsuccessful attempt.|The file was empty, so we were back to square one.
Call it a day|Stop working for now.|We've finished the main tasks. Let's call it a day.
Under the weather|Feeling a little unwell.|I'm feeling under the weather, so I'll rest today.
A breath of fresh air|A welcome and refreshing change.|Her practical approach was a breath of fresh air.
Better late than never|Doing something late is better than not doing it.|I finally started learning. Better late than never!
In the long run|Over a long period of time.|A small daily habit helps in the long run.
So far, so good|Things have gone well up to now.|How is the new course? So far, so good.
Out of the blue|Unexpectedly.|An old friend called me out of the blue.
Give it a shot|Try something.|I've never written a review in English, but I'll give it a shot.
Hang in there|Keep going during a difficult period.|You're making progress. Hang in there!
Find your feet|Become comfortable in a new situation.|It took me a few weeks to find my feet at work.
Take your time|Do something without rushing.|Take your time and read the question carefully.
Make up your mind|Decide.|I need another day to make up my mind.
Keep an eye on|Watch or check something.|Could you keep an eye on the time?
On the right track|Making progress in a useful direction.|Your examples are clearer. You're on the right track.
A learning curve|A period of learning through new experiences.|Using the new software was a learning curve.
See eye to eye|Agree with someone.|We don't see eye to eye on every detail.
Meet halfway|Reach an agreement by both making a compromise.|You prefer mornings and I prefer evenings. Can we meet halfway?
Go with the flow|Accept changes without trying to control everything.|We had no fixed plan, so we went with the flow.
Out of your comfort zone|In a situation that feels unfamiliar or challenging.|Speaking to a new group took me out of my comfort zone.
Have a lot on your plate|Have many things to deal with.|I have a lot on my plate this week.
Take a rain check|Politely postpone an invitation.|Can I take a rain check on coffee? I'm busy today.
Touch base|Make brief contact to exchange updates.|Let's touch base on Thursday about the project.
Keep me posted|Continue giving me updates.|Keep me posted about the new schedule.
At the last minute|Just before something happens or is due.|The meeting room changed at the last minute.
Ahead of the game|Better prepared or more advanced than others.|Reviewing the notes early helped me stay ahead of the game.
Play it by ear|Decide what to do as the situation develops.|We haven't chosen a time. Let's play it by ear.
Put your heads together|Work with others to think of a solution.|Let's put our heads together and make a plan.
Sleep on it|Wait until the next day before deciding.|It is an important decision. I'll sleep on it.
The best of both worlds|The advantages of two different situations.|Online lessons give me the best of both worlds: coaching and flexibility.
Once in a blue moon|Very rarely.|I eat at that restaurant once in a blue moon.
Time flies|Time seems to pass very quickly.|Time flies when we have an interesting conversation.
Better safe than sorry|Being careful is better than taking an unnecessary risk.|I'll save another copy. Better safe than sorry.
Keep your word|Do what you promised.|He said he would help, and he kept his word.
Make someone's day|Make someone feel very happy.|Your kind message made my day.
Go hand in hand|Be closely connected.|Practice and feedback go hand in hand.
Turn over a new leaf|Start behaving in a better or different way.|I've turned over a new leaf and started studying regularly.
Put something on hold|Pause or delay something.|We put the project on hold until next month.
Cut to the chase|Get to the main point.|We have ten minutes, so let's cut to the chase.
Go back to the drawing board|Start planning again because an idea did not work.|The design was confusing, so we went back to the drawing board.
On the fence|Not yet able to decide.|I'm on the fence about joining the evening course.
Worth a try|Reasonable to attempt even if success is uncertain.|This listening exercise is worth a try.
Read between the lines|Understand a meaning that is not stated directly.|Read between the lines: she may need more time.
Put yourself in someone's shoes|Imagine how another person feels.|Put yourself in the customer's shoes before replying.
Miss the point|Fail to understand the main idea.|I think I missed the point. Could you explain it again?
A fresh pair of eyes|Someone who can look at something in a new way.|Could you check my email? I need a fresh pair of eyes.
Set the tone|Establish the feeling or attitude of a situation.|A friendly introduction set the tone for the meeting.
Take the pressure off|Make a situation less stressful.|Preparing a few notes took the pressure off.
Get straight to the point|Say the main idea without delay.|The email gets straight to the point.
Not set in stone|Still possible to change.|The schedule isn't set in stone yet.
Something to think about|An idea worth considering.|Your suggestion gives us something to think about.
One thing at a time|Focus on one task before starting another.|There are several exercises. Let's do one thing at a time.`.split('\n').map(line=>{const [expression,meaning,example]=line.split('|');return {expression,meaning,example};});
export function idiomForDate(date=new Date()) {const parts=new Intl.DateTimeFormat('en',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date);const value=k=>parts.find(p=>p.type===k).value;const key=value('year')+'-'+value('month')+'-'+value('day');const day=Math.floor(Date.parse(key+'T00:00:00Z')/86400000);const index=((day%idioms.length)+idioms.length)%idioms.length;return {...idioms[index],key,index};}
if(typeof document!=='undefined'){
 const host=document.querySelector('#daily-mission');if(host){
  function render(){if(host.classList.contains('daily-seven'))return;const item=idiomForDate();let box=host.querySelector(':scope>.daily-idiom');if(box?.dataset.day===item.key)return;if(!box){box=document.createElement('details');box.className='daily-idiom';const intro=host.querySelector(':scope>.daily-task-intro');if(intro)intro.after(box);else host.append(box);}box.dataset.day=item.key;box.replaceChildren();const summary=document.createElement('summary');summary.textContent='Today’s idiom';const icon=document.createElement('span');icon.className='idiom-symbol';const drawings=['<path d="M7 11h42v27H27L14 49V38H7ZM15 21h26M15 29h16"/>','<path d="M8 12q11-5 22 0 11-5 22 0v32q-11-5-22 0-11-5-22 0ZM30 12v32"/>','<path d="M11 47 24 7M34 47 47 7M15 34h23M19 22h23M23 10h23"/>'];icon.innerHTML='<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true">'+drawings[item.index%3]+'</svg>';summary.prepend(icon);box.append(summary);const title=document.createElement('h4');title.textContent=item.expression;const meaning=document.createElement('p');meaning.textContent=item.meaning;const example=document.createElement('p');example.className='idiom-example';example.textContent='“'+item.example+'”';box.append(title,meaning,example);}
  render();new MutationObserver(render).observe(host,{childList:true,subtree:true});document.addEventListener('daily-mission-open',render);document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
 }
}
