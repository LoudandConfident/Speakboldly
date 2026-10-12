import {getLevelExamText} from './exam-questions.js';
import {createExamForm} from './exam-form.js';
export function showTextExam(doc,panel,level,access){
 const exam=getLevelExamText(level);if(!exam)return;
 panel.querySelector('.portal-document-viewer')?.remove();
 const root=doc.createElement('section');root.className='portal-document-viewer interactive-exam';root.setAttribute('aria-label','Level '+level+' text exam');
 const heading=doc.createElement('h4');heading.textContent=exam.title;heading.tabIndex=-1;
 const close=doc.createElement('button');close.type='button';close.className='button light small';close.textContent='Close exam';close.onclick=()=>root.remove();
 const note=doc.createElement('p');note.textContent=access?.adminPreview?'Teacher preview · Read each question carefully. Use complete sentences where required.':'Read each question carefully. Practice answers in this view are not submitted. Use complete sentences where required.';
 const form=createExamForm(doc,exam);form.onsubmit=event=>event.preventDefault();root.append(heading,close,note,form);panel.append(root);heading.focus();
}
