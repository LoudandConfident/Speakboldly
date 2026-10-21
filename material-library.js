import {learningDocumentPart,createLearningDocumentCard} from './learning-document-cards.js?v=library-folders';
export const MATERIAL_FOLDERS=[
 {id:'general',title:'SB General Conversation'},
 {id:'instructor-training',title:'Instructors training'},
 {id:'business-writing',title:'E-mail and business writing workshop'},
 {id:'kids',title:'Let the kids learn!'},
 {id:'pronunciation',title:'Pronunciation workshop'},
 {id:'meetings',title:'Meetings and presentation workshop'},
 {id:'write-boldly',title:'Write Boldly!'},
 {id:'different-learners',title:'Different learners and how to support them.'},
 {id:'focus',title:'Reclaim your focus workshop'}
];
export function learningDocumentFolder(item){const key=String(item.title||'').match(/\[SB-folder:([a-z-]+)\]/)?.[1];return MATERIAL_FOLDERS.some(f=>f.id===key)?key:'general';}
export function renderMaterialLibrary(doc,target,{folder,level,items,enabled,chooseFolder,chooseLevel,back,open}){
 const el=(tag,value)=>{const n=doc.createElement(tag);if(value)n.textContent=value;return n;},button=(label,action)=>{const b=el('button',label);b.type='button';b.className='portal-level-button';b.onclick=action;return b;};
 target.replaceChildren(el('h3','Learning Library'));delete target.dataset.learningLevel;delete target.dataset.learningCategory;
 if(!folder){const grid=el('div');grid.className='material-folder-grid';grid.setAttribute('aria-label','Material Library folders');for(const entry of MATERIAL_FOLDERS){const b=button(entry.title,()=>chooseFolder(entry.id));b.dataset.libraryFolder=entry.id;const icon=el('span','▱');icon.className='material-folder-icon';icon.setAttribute('aria-hidden','true');b.prepend(icon);grid.append(b);}target.append(grid);return;}
 const entry=MATERIAL_FOLDERS.find(f=>f.id===folder);target.append(el('h4',entry.title));const goBack=button(folder==='general'&&level?'Choose another level':'All library folders',back);goBack.className='button light small';target.append(goBack);
 if(folder==='general'&&!level){const grid=el('div');grid.className='portal-level-menu';grid.setAttribute('aria-label','SB General Conversation levels');for(let n=1;n<=12;n++){const b=button('Level '+n,()=>chooseLevel(n));b.disabled=!enabled(n);grid.append(b);}target.append(grid);return;}
 target.dataset.learningLevel=level;target.dataset.learningCategory='material';if(folder==='general')target.append(el('p','Level '+level));
 const parts=el('div');parts.className='library-level-parts';for(const [part,label]of [['book','Main book'],['activity','Activities'],['audio','Audio']]){const section=el('section');section.className='library-level-part';section.dataset.libraryPart=part;section.append(el('h4',label));const files=el('div');files.className='learning-document-grid';for(const item of items.filter(i=>learningDocumentFolder(i)===folder&&learningDocumentPart(i)===part))files.append(createLearningDocumentCard(doc,item,e=>open(item,e)));if(!files.children.length)files.append(el('p','No files uploaded yet.'));section.append(files);parts.append(section);}target.append(parts);
}
