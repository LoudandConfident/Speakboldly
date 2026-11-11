// Keep cards together by access type without changing their existing click handlers.
export function initializeLearningCardGroups(doc){
 const grid=doc.querySelector('#portal-content .learning-space-destinations');if(!grid||grid.dataset.accessGrouped)return;grid.dataset.accessGrouped='true';
 const groups=[['free','Free practice'],['tools','Learning tools'],['support','Your coach & calendar'],['preview','Stay Tuned']];
 const order=['mission','monthly','studio','exercises','material','listening','exams','contact','calendar','student-zone'];
 const lists=new Map();for(const [key,label]of groups){const section=doc.createElement('section');section.className='hub-card-group';section.dataset.cardGroup=key;section.setAttribute('aria-label',label);const heading=doc.createElement('h3');heading.className='hub-card-group-title';heading.textContent=label;const list=doc.createElement('div');list.className='hub-card-group-list';section.append(heading,list);grid.append(section);lists.set(key,{section,list});}
 function category(card){if(card.disabled||card.classList.contains('portal-feature-closed')||card.id==='portal-tab-student-zone')return 'preview';if(['portal-tab-contact','portal-tab-calendar'].includes(card.id))return 'support';const badge=card.querySelector('.hub-free-badge');return badge&&!badge.hidden?'free':'tools';}
 let queued=false;function update(){queued=false;const cards=[...grid.querySelectorAll('.learning-space-card')].sort((a,b)=>order.indexOf(a.id.replace('portal-tab-',''))-order.indexOf(b.id.replace('portal-tab-','')));for(const [key,{section,list}]of lists){const items=cards.filter(card=>category(card)===key);items.forEach((card,index)=>{if(list.children[index]!==card)list.insertBefore(card,list.children[index]||null);});if(section.hidden!==!items.length)section.hidden=!items.length;}}
 const later=()=>{if(!queued){queued=true;doc.defaultView.requestAnimationFrame(update);}};update();new doc.defaultView.MutationObserver(later).observe(grid,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','hidden']});
}
if(typeof document!=='undefined')initializeLearningCardGroups(document);
