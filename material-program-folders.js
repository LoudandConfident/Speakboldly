import {courses} from './courses.js?v=retire-it-program-1';
export const MATERIAL_PROGRAM_FOLDERS=courses.filter(course=>course.id!=='information-technology'&&course.category!=='General English'&&course.id!=='instructor-training').map(course=>({id:course.id,title:course.title})).concat([{id:'comprehension',title:'Comprehension'},{id:'listening',title:'Listening'}]);
export function materialProgram(item){
 const value=String(item.title||'').toLowerCase();
 return MATERIAL_PROGRAM_FOLDERS.find(folder=>value===folder.title.toLowerCase()||value.startsWith(folder.title.toLowerCase()+' — '))||MATERIAL_PROGRAM_FOLDERS.find(folder=>value.includes(folder.title.toLowerCase()))||MATERIAL_PROGRAM_FOLDERS.find(folder=>({interview:/interview/,writing:/business writing|e-mail/,speaking:/public speaking|presentation|meetings/,ielts:/ielts/,pronunciation:/pronunciation/,kids:/kids/,'different-learners':/different learners/,'urgent-session':/one session/}[folder.id]||/$^/).test(value));
}
