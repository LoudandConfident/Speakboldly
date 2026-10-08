import {privateFiles} from './exam-api.js';
export const MATERIAL_FOLDERS = {
 exercises:'student-files/exercises',
 exams:'student-files/exams',
 reports:'student-files/reports',
 material:'student-files/material',final:'student-files/final',listening:'student-files/listening'
};
export const LEVEL_EXAMS=Array.from({length:6},(_,i)=>({title:'Level '+(i+1)+' Exam',url:new URL('student-files/exams/Level-'+(i+1)+'-Exam.pdf','https://loudandconfident.github.io/Speakboldly/').href}));
function combineExams(items){return [...new Map([...LEVEL_EXAMS,...items].map(item=>[item.url,item])).values()].sort((a,b)=>a.title.localeCompare(b.title));}
// GitHub provides an authenticated owner upload interface; visitors need no token to list public materials.
async function loadPublicMaterials(section,fetcher=fetch){
 const folder=MATERIAL_FOLDERS[section];if(!folder)throw new Error('Unknown material section');
 let response;try{response=await fetcher('https://api.github.com/repos/LoudandConfident/Speakboldly/contents/'+folder+'?ref=main',{headers:{Accept:'application/vnd.github+json'}});}catch(error){if(section==='exams')return combineExams([]);throw error;}
 if(response.status===404)return section==='exams'?combineExams([]):[];
 if(!response.ok){if(section==='exams')return combineExams([]);throw new Error('Materials are unavailable');}
 const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid materials list');
 const items=data.filter(item=>item.type==='file'&&typeof item.name==='string'&&!item.name.startsWith('.')&&typeof item.path==='string'&&item.path.startsWith(folder+'/')).map(item=>({title:item.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),url:new URL('./'+item.path.split('/').map(encodeURIComponent).join('/'), 'https://loudandconfident.github.io/Speakboldly/').href})).sort((a,b)=>a.title.localeCompare(b.title));
 return section==='exams'?combineExams(items):items;
}

export async function loadPortalMaterials(section,fetcher=fetch){const privateItems=await privateFiles(section);let publicItems;try{publicItems=await loadPublicMaterials(section,fetcher);}catch(error){if(privateItems.length)return privateItems;throw error;}return [...publicItems,...privateItems];}
