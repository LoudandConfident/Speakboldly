import {createPlacementBookingRemark} from './placement-booking-remark.js?v=personalised-placement-1';
import {learnerCourseGuidance,learnerQuickPractice} from './assessment-guidance.js?v=bold-blog-simple-results';
import {addResultImageButton,addResultBranding} from './result-image.js?v=two-line-footer-1';
import {learnerProfiles,learnerQuestions,scoreLearnerProfile,learnerQuestionOrder} from './learner-profile-data.js?v=short-shuffled-v2';
export function initializeLearnerProfile(doc,win){
 const root=doc.querySelector('#learner-profile');if(!root)return;
 const form=root.querySelector('form'),questions=root.querySelector('.learner-questions'),progress=root.querySelector('.learner-progress'),result=doc.querySelector('#learner-results .learner-result'),previous=root.querySelector('[data-learner-previous]'),next=root.querySelector('[data-learner-next]'),submit=root.querySelector('[type=submit]'),error=root.querySelector('.learner-error');
 let page=0;const pageSize=5;const pageCount=Math.ceil(learnerQuestions.length/pageSize);const fields=[];
 const el=(tag,text,className)=>{const node=doc.createElement(tag);if(text)node.textContent=text;if(className)node.className=className;return node;};
 learnerQuestions.forEach((question,index)=>{const field=el('fieldset');field.append(el('legend',(index+1)+'. '+question.prompt));question.options.forEach(option=>{const label=el('label'),input=el('input');input.type='radio';input.name='learner-'+index;input.value=option.profile;input.required=true;label.append(input,el('span',option.text));field.append(label);});questions.append(field);fields.push(field);});
 const originalFields=[...fields];function shuffleQuestions(){const order=learnerQuestionOrder();fields.splice(0,fields.length,...order.map(index=>originalFields[index]));fields.forEach((field,index)=>{field.querySelector('legend').textContent=(index+1)+'. '+learnerQuestions[order[index]].prompt;questions.append(field);});}
 shuffleQuestions();
 function showPage(){fields.forEach((field,index)=>{const active=Math.floor(index/pageSize)===page;field.hidden=!active;field.disabled=!active;});progress.textContent='Step '+(page+1)+' of '+pageCount;previous.disabled=page===0;next.hidden=page===pageCount-1;submit.hidden=page!==pageCount-1;error.textContent='';}
 const pageValid=()=>fields.filter(field=>!field.disabled).every(field=>{const input=field.querySelector('input');return input.reportValidity();});
 previous.onclick=()=>{if(page>0){page--;showPage();progress.focus();}};
 next.onclick=()=>{if(pageValid()){page++;showPage();progress.focus();}};
 function renderResult(score){result.classList.add('assessment-result');result.replaceChildren(el('h2','Your learning profile'));
 const title=score.strongest.length===1?learnerProfiles[score.strongest[0]].name:'Your preferences are a blend';result.append(el('h3',title),el('p','Your preferences today—not a fixed learning type.'));
 const table=el('table');table.append(el('caption','Your learning preferences'));for(const key of Object.keys(learnerProfiles)){const row=el('tr');const name=el('th',learnerProfiles[key].name);name.scope='row';row.append(name,el('td',Math.round(score.counts[key]/score.total*100)+'%'));table.append(row);}result.append(table);
 for(const key of score.strongest){const section=el('section');section.append(el('h3',learnerProfiles[key].name),el('h4','In a course'),el('p',learnerCourseGuidance[key][0]),el('h4','Try this on your own'),el('p',learnerQuickPractice[key]));result.append(section);}
 result.append(el('p','Practise for 10 minutes a day. Mix listening, reading, speaking, and writing, and keep what helps you improve.'));
 result.append(createPlacementBookingRemark(doc,win));
 addResultBranding(doc,result);
 addResultImageButton(doc,win,result,'Your learning profile',{learnerCard:true});
 const restart=el('button','Retake the learner test','button light');restart.type='button';restart.onclick=()=>{form.reset();shuffleQuestions();page=0;form.hidden=false;result.hidden=true;doc.querySelector('.learner-results-empty').hidden=false;showPage();win.location.hash='learner-profile';};result.append(restart);form.hidden=false;result.hidden=false;doc.querySelector('.learner-results-empty').hidden=true;win.location.hash='learner-results';
 }
 form.onsubmit=event=>{event.preventDefault();if(page!==pageCount-1){next.click();return;}if(!pageValid())return;const answers=learnerQuestions.map((_,index)=>form.querySelector('[name="learner-'+index+'"]:checked')?.value);try{renderResult(scoreLearnerProfile(answers));}catch(e){error.textContent=e.message;const missing=answers.findIndex(answer=>!answer);if(missing>=0){page=Math.floor(fields.indexOf(originalFields[missing])/pageSize);showPage();error.textContent=e.message;progress.focus();}}};
 showPage();
}
if(typeof document!=='undefined')initializeLearnerProfile(document,window);

