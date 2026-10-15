import {learningDocumentCategory} from './learning-document-cards.js?v=exam-rebuild';
export const LEARNING_HUB_SECTIONS=[
 {id:'exams',title:'Examinations'},
 {id:'exercises',title:'Exercises'},
 {id:'listening',title:'Listening'},
 {id:'material',title:'Material'},
 {id:'practice',title:'Activities'},
 {id:'contact',title:'Contact Instructor'},
 {id:'calendar',title:'Calendar'}
];
export function learningHubItemSection(item){return item.section==='tests'?'exams':learningDocumentCategory(item);}

export function learningFolderPasswordGroup(section,level){
 if(!Number.isInteger(level)||level<1||level>8)throw new Error('Choose a valid level.');
 if(['material','exams'].includes(section))return section+':'+level;
 if(section==='exercises')return 'exercises';
 if(section==='practice')return 'activities';
 if(section==='listening')return 'listening';
 throw new Error('Choose a protected folder.');
}
