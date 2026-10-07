export const MATERIAL_FOLDERS = {
 exercises:'student-files/exercises',
 exams:'student-files/exams',
 reports:'student-files/reports'
};
// GitHub provides an authenticated owner upload interface; visitors need no token to list public materials.
export async function loadPortalMaterials(section,fetcher=fetch){
 const folder=MATERIAL_FOLDERS[section];if(!folder)throw new Error('Unknown material section');
 const response=await fetcher('https://api.github.com/repos/LoudandConfident/Speakboldly/contents/'+folder+'?ref=main',{headers:{Accept:'application/vnd.github+json'}});
 if(response.status===404)return [];
 if(!response.ok)throw new Error('Materials are unavailable');
 const data=await response.json();if(!Array.isArray(data))throw new Error('Invalid materials list');
 return data.filter(item=>item.type==='file'&&typeof item.name==='string'&&!item.name.startsWith('.')&&typeof item.path==='string'&&item.path.startsWith(folder+'/')).map(item=>({title:item.name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),url:new URL('./'+item.path.split('/').map(encodeURIComponent).join('/'), 'https://loudandconfident.github.io/Speakboldly/').href})).sort((a,b)=>a.title.localeCompare(b.title));
}
