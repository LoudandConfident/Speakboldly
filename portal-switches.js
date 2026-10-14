import {learningHubItemSection} from './learning-hub-sections.js';
import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=level-history';
export function initializePortalSwitches(doc,isUnlocked,loader) {
 const root=doc.querySelector('#portal-switches');if(!root)return;
 const list=root.querySelector('.portal-switch-list'),status=root.querySelector('[role=status]');let generation=0,loading=false;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 function render(catalog,preview=false){const current=generation;list.replaceChildren();
  for(const [section,title]of [['practice','Activities'],['listening','Listening'],['material','Material'],['exams','Examinations']]) {
    const group=doc.createElement('details'),summary=text('summary',title);group.append(summary);
    for(const item of catalog.filter(item=>learningHubItemSection(item)===section)) {
     const row=doc.createElement('div');row.className='portal-access-switch';const name=text('span',item.title),button=doc.createElement('button');button.type='button';button.className='button light small';button.disabled=preview;
     function update(){row.classList.toggle('portal-item-dimmed',!item.enabled);button.textContent=item.enabled?'Dim':'Undim';button.setAttribute('aria-pressed',String(item.enabled));button.setAttribute('aria-label',(item.enabled?'Dim ':'Undim ')+item.title);}
     update();button.onclick=async()=>{
      if(!isUnlocked())return;button.disabled=true;status.textContent='Saving access…';
      try{const result=await sheetLibraryRequest('savePortalAccess',{item:{...item,enabled:!item.enabled}});if(current!==generation||!isUnlocked())return;Object.assign(item,result.item);update();status.textContent=item.title+' is now '+(item.enabled?'open':'dimmed')+' for everyone.';}
      catch(error){if(current===generation)status.textContent=error.message;}finally{button.disabled=false;}
     };row.append(name,button);group.append(row);
    }
    if(group.children.length===1)group.append(text('p','No files uploaded yet.'));list.append(group);
   }
 }
 const defaults=Array.from({length:6},(_,i)=>({id:'test:'+(i+1),section:'tests',title:'Level '+(i+1),url:'',enabled:false}));
 render(defaults,true);
 async function refresh() {
  if(!isUnlocked()||loading)return;const current=generation;loading=true;
  if(!clientSheetConnected()){status.textContent='Connect your Clients sheet first.';loading=false;return;}
  status.textContent='Loading access switches…';
  try {
   const saved=await sheetLibraryRequest('listPortalAccess');if(current!==generation||!isUnlocked())return;
   const catalog=[...saved.items],notes=[];
   for(const [section,group]of [['exercises','exercises'],['material','levels'],['exams','levels'],['listening','levels']]) {
    try{const items=await loader(section);for(let item of items){if(section==='listening')item={...item,title:'Listening — '+item.title};if(!catalog.some(entry=>entry.section===group&&entry.url===item.url))catalog.push({section:group,title:item.title,url:item.url,enabled:false});}}catch{notes.push('Website '+section+' files could not load.');}
    try{const result=await sheetLibraryRequest('listLibrary',{section});for(let item of result.items){if(section==='listening')item={...item,title:'Listening — '+item.title};if(!catalog.some(entry=>entry.section===group&&entry.url===item.url))catalog.push({section:group,title:item.title,url:item.url,enabled:false});}}catch{notes.push('Drive '+section+' folder is not connected.');}
   }
   if(current!==generation||!isUnlocked())return;list.replaceChildren();
   render(catalog);
   status.textContent=[...new Set(notes)].join(' ');
  }catch(error){if(current===generation)status.textContent=error.message;}
  finally{if(current===generation)loading=false;}
 }
 root.querySelector('button[data-refresh-access]').onclick=refresh;
 root.addEventListener('toggle',()=>{if(root.open)refresh();});
 doc.addEventListener('client-sheet-configured',()=>{if(root.open)refresh();});
 return{refresh,lock(){generation++;loading=false;render(defaults,true);status.textContent='';}};
}
