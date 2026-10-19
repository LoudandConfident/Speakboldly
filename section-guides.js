const GUIDES={
 'portal-accent':['Accent','This space is being prepared. More details are coming soon.'],
 'portal-exams':['Quizzes','Take the interactive examination for your level. Enter the details requested before starting. Submit your answers when you finish; your instructor reviews the writing and sends your final report separately.'],
 'portal-exercises':['Activities','Open the practice sheets and resources your instructor has made available. Use the folder password when requested, then choose a document to practise.'],
 'portal-material':['Material','Choose your level and enter its passcode. Open the books and learning documents here, and return to useful pages between sessions.'],
 'portal-listening':['Listening','Choose your level and open the listening resources. Listen for the main idea first, then return for useful expressions and details.'],
 'portal-practice':['Activities','Choose a realistic practice goal and use the activities to keep English part of your week.'],
 'daily-mission':['Daily Task','A new reading task appears every day. Choose your level, read at your own pace and try the language activities. Open today’s idiom for one more useful expression.'],
 'portal-monthly':['Native English','Explore the selected listening page and monthly novel. Open a novel inside the website; the reader remembers your page on this browser/device. Your instructor can choose the selections or keep automatic changes.'],
 'portal-contact':['Contact','Send a question or learning note to your instructor. Include your name and an email address where you can receive a reply.'],
 'portal-calendar':['Calendar','Choose an available appointment within the booking window. Follow the assessment and payment instructions for that appointment. Your instructor accepts or declines the request before the booking is confirmed.'],
 'portal-studio':['SB Studio','Open Roleplay Room for a daily situation and a prompt to use in your own chat. Open Voice Lab to hear a model, record yourself and compare the words heard.']
};
export function initializeSectionGuides(doc){const root=doc.querySelector('#portal-content');if(!root)return;let current;
 const decorate=()=>{for(const [id,[title,copy]]of Object.entries(GUIDES)){const host=doc.getElementById(id);if(!host||host.querySelector(':scope>.section-guide'))continue;const button=doc.createElement('button');button.type='button';button.className='section-guide';button.setAttribute('aria-label','How to use '+title);button.setAttribute('aria-haspopup','dialog');const mark=doc.createElement('span');mark.className='guide-mark';mark.textContent='i';const words=doc.createElement('span');words.textContent='Inside '+title;button.append(mark,words);button.onclick=()=>{current?.remove();current=doc.createElement('dialog');current.className='action-popup section-guide-popup';current.setAttribute('aria-label','How to use '+title);const close=doc.createElement('button');close.type='button';close.className='popup-close';close.textContent='×';close.setAttribute('aria-label','Close section guide');close.onclick=()=>current.close();const heading=doc.createElement('h2');heading.textContent=title;const p=doc.createElement('p');p.textContent=copy;current.append(close,heading,p);current.addEventListener('close',()=>{current?.remove();current=null;},{once:true});doc.body.append(current);current.showModal();};host.prepend(button);}};
 decorate();new doc.defaultView.MutationObserver(decorate).observe(root,{childList:true,subtree:true});
}
if(typeof document!=='undefined')initializeSectionGuides(document);

