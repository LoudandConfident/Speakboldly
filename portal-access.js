export const ADMIN_CLIENT_STORAGE_KEY='speak-boldly-admin-clients-v1';
export const PORTAL_SECTIONS={exercises:'Exercises',exams:'Exams',reports:'Progress reports',material:'Full material',final:'Final reports',listening:'Listening tracks'};
export function filePermission(section,url){return 'file:'+section+':'+new URL(url,'https://loudandconfident.github.io/Speakboldly/').pathname;}
export function canOpenSection(access,section){return Array.isArray(access?.permissions)&&access.permissions.includes('section:'+section);}
export function canOpenFile(access,section,url){return canOpenSection(access,section)&&access.permissions.includes(filePermission(section,url));}
export function findStudentAccess(code,storage){
 if(code==='1962')return{adminPreview:true};
 if(!/^\d{4}$/.test(code))return null;
 try{const clients=JSON.parse(storage.getItem(ADMIN_CLIENT_STORAGE_KEY)||'[]');if(!Array.isArray(clients))return null;const matches=clients.filter(c=>c&&c.code===code);if(matches.length!==1)return null;return{code,number:clients.indexOf(matches[0])+1,level:String(matches[0].level||''),permissions:Array.isArray(matches[0].permissions)?matches[0].permissions.filter(p=>typeof p==='string'):[]};}catch{return null;}
}
