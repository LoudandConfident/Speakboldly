import {learningDocumentCategory} from './learning-document-cards.js?v=activities';
export const LEARNING_HUB_SECTIONS=[
 {id:'exams',title:'Examinations'},
 {id:'listening',title:'Listening'},
 {id:'material',title:'Material'},
 {id:'practice',title:'Activities'},
 {id:'contact',title:'Contact Instructor'},
 {id:'calendar',title:'Calendar'}
];
export function learningHubItemSection(item){return item.section==='tests'?'exams':learningDocumentCategory(item);}
