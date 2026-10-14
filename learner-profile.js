import {learnerCourseGuidance} from './assessment-guidance.js';
import {addResultImageButton,addResultBranding} from './result-image.js?v=branded-results';
import {learnerProfiles,learnerQuestions,scoreLearnerProfile} from './learner-profile-data.js?v=30-scenarios';
export function initializeLearnerProfile(doc,win){
 const root=doc.querySelector('#learner-profile');if(!root)return;
 const form=root.querySelector('form'),questions=root.querySelector('.learner-questions'),progress=root.querySelector('.learner-progress'),result=root.querySelector('.learner-result'),previous=root.querySelector('[data-learner-previous]'),next=root.querySelector('[data-learner-next]'),submit=root.querySelector('[type=submit]'),error=root.querySelector('.learner-error');
 let page=0;const pageSize=5;const pageCount=Math.ceil(learnerQuestions.length/pageSize);const fields=[];
 const el=(tag,text,className)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
 learnerQuestions.forEach((question,index)=>{const field=el('fieldset');field.append(el('legend',(index+1)+'. '+question.prompt));question.options.forEach(option=>{const label=el('label'),input=el('input');input.type='radio';input.name='learner-'+index;input.value=option.profile;input.required=true;label.append(input,el('span',option.text));field.append(label);});questions.append(field);fields.push(field);});
 function showPage(){fields.forEach((field,index)=>{const active=Math.floor(index/pageSize)===page;field.hidden=!active;field.disabled=!active;});progress.textContent='Step '+(page+1)+' of '+pageCount;previous.disabled=page===0;next.hidden=page===pageCount-1;submit.hidden=page!==pageCount-1;error.textContent='';}
 const pageValid=()=>fields.filter(field=>!field.disabled).every(field=>{const input=field.querySelector('input');return input.reportValidity();});
 previous.onclick=()=>{if(page>0){page--;showPage();progress.focus();}};
 next.onclick=()=>{if(pageValid()){page++;showPage();progress.focus();}};
 function renderResult(score){result.classList.add('assessment-result');result.replaceChildren(el('h2','Your English learner profile'));
 const title=score.strongest.length===1?learnerProfiles[score.strongest[0]].name:'Your preferences are a blend';result.append(el('h3',title),el('p','This reflects the activities you chose today, not your ability or a fixed personality type.'));
 const table=el('table');table.append(el('caption','Your learning preferences'));for(const key of Object.keys(learnerProfiles)){const row=el('tr');const name=el('th',learnerProfiles[key].name);name.scope='row';row.append(name,el('td',Math.round(score.counts[key]/score.total*100)+'%'));table.append(row);}result.append(table);
 for(const key of score.strongest){const profile=learnerProfiles[key],section=el('section');section.append(el('h3',profile.name),el('p',profile.summary),el('h4','What helps you practise English'),el('p',profile.routine),el('h4','What to look for in a course'));const courseList=el('ul');learnerCourseGuidance[key].forEach(tip=>courseList.append(el('li',tip)));section.append(courseList,el('h4','On your own'));const list=el('ul');profile.tips.forEach(tip=>list.append(el('li',tip)));section.append(list);result.append(section);}
 result.append(el('h3','Whatever your preferences'),el('p','Mix listening, reading, speaking, and writing. Try to recall useful language without looking, use it in real situations, review feedback, and return to it over several days. Choose a routine you can repeat, then adjust it based on your progress.'));
 addResultBranding(doc,result);
 addResultImageButton(doc,win,result,'Speak Boldly — Learner assessment');
 const restart=el('button','Retake the learner test','button light');restart.type='button';restart.onclick=()=>{form.reset();page=0;form.hidden=false;result.hidden=true;showPage();progress.focus();};result.append(restart);form.hidden=true;result.hidden=false;result.focus();result.scrollIntoView({block:'start',behavior:'auto'});
 }
 form.onsubmit=event=>{event.preventDefault();if(page!==pageCount-1){next.click();return;}if(!pageValid())return;const answers=learnerQuestions.map((_,index)=>form.querySelector('[name="learner-'+index+'"]:checked')?.value);try{renderResult(scoreLearnerProfile(answers));}catch(e){error.textContent=e.message;const missing=answers.findIndex(answer=>!answer);if(missing>=0){page=Math.floor(missing/pageSize);showPage();error.textContent=e.message;progress.focus();}}};
 showPage();
}
if(typeof document!=='undefined')initializeLearnerProfile(document,window);
