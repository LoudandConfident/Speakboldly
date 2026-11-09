const excuses=[
 'checking their blood pressure after a heated debate with the present perfect.',
 'having a very serious meeting with a cup of tea.',
 'trying to convince the silent letters to speak up.',
 'negotiating a peace treaty between “since” and “for”.',
 'looking for the “s” that went missing after “he”.',
 'taking a deep breath. The phrasal verbs have formed a group chat.',
 'asking the dictionary why “read” and “read” look exactly the same.',
 'rehearsing a calm response to “English has no rules”.',
 'on a coffee break with the irregular verbs. Nobody is behaving.',
 'trying to get “though”, “through” and “thought” into separate rooms.'
];
export function createCoachExcuses(doc){
 const style=doc.createElement('link');style.rel='stylesheet';style.href=new URL('./coach-excuses.css?v=1',import.meta.url).href;if(!doc.querySelector('link[data-coach-excuses]')){style.dataset.coachExcuses='';doc.head.append(style);}
 const card=doc.createElement('aside');card.className='coach-excuses';card.setAttribute('aria-label','A little coach humour');
 const copy=doc.createElement('div'),kicker=doc.createElement('p'),sentence=doc.createElement('p'),text=doc.createElement('span'),caption=doc.createElement('p'),button=doc.createElement('button');
 kicker.className='coach-excuses-kicker';kicker.textContent='COACH STATUS · UNOFFICIAL';sentence.className='coach-excuses-line';sentence.setAttribute('aria-live','polite');sentence.setAttribute('aria-atomic','true');sentence.append(doc.createTextNode('Our coaches are '),text);caption.className='coach-excuses-caption';caption.textContent='A little drama. You can still send your question below.';
 button.type='button';button.className='coach-excuses-button';button.innerHTML='<span aria-hidden="true">⤨</span> Another excuse';
 let remaining=[],last=-1;function next(){if(!remaining.length){remaining=excuses.map((_,i)=>i);for(let i=remaining.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[remaining[i],remaining[j]]=[remaining[j],remaining[i]];}if(remaining.at(-1)===last)[remaining[0],remaining[remaining.length-1]]=[remaining[remaining.length-1],remaining[0]];}last=remaining.pop();text.textContent=excuses[last];}
 next();button.addEventListener('click',next);copy.append(kicker,sentence,caption);card.append(copy,button);return card;
}
