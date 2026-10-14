export const PORTAL_SUBFOLDERS=[...Array.from({length:8},(_,i)=>({key:'level:'+(i+1),title:'Level '+(i+1),parent:'material'})),{key:'exercise:comprehension',title:'Comprehension',parent:'exercises'},{key:'exercise:listening',title:'Listening',parent:'exercises'},{key:'exercise:resources',title:'Resources',parent:'exercises'}];
export function portalItemFolder(item){
 if(!['levels','exercises'].includes(item.section))return null;
 const title=String(item.title||'');
 const explicitLevel=title.match(/^Level[\s_-]*([1-8])\s*[—:-]/i);if(item.section==='levels'&&explicitLevel)return 'level:'+explicitLevel[1];
 if(/\bcomprehension\b/i.test(title))return 'exercise:comprehension';
 if(/\blistening\b/i.test(title))return 'exercise:listening';
 if(item.section==='exercises')return 'exercise:resources';
 const level=title.match(/(?:^|[^a-z0-9])level[\s_-]*([1-8])(?:[^0-9]|$)/i);return level?'level:'+level[1]:null;
}
export function ensurePortalFolderTree(doc){
 for(const parent of ['material','exercises']){
 const host=doc.querySelector('#portal-'+parent);if(!host||host.querySelector('[data-folder-key]'))continue;
 host.replaceChildren();const heading=doc.createElement('h3');heading.textContent=parent==='material'?'Material':'Exercises';host.append(heading);
 for(const folder of PORTAL_SUBFOLDERS.filter(f=>f.parent===parent)){
 const details=doc.createElement('details');details.className='portal-subfolder';details.dataset.folderKey=folder.key;details.dataset.passwordLocked='true';
 if(parent==='material')details.dataset.materialLevel=folder.key.split(':')[1];else details.dataset.exerciseFolder=folder.key.split(':')[1];
 const summary=doc.createElement('summary');summary.textContent=folder.title;const files=doc.createElement('div');files.className='folder-files';details.append(summary,files);host.append(details);
 }
 }
}
