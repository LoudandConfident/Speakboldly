import {loadStudentExam,submitStudentExam,request} from './exam-api.js';
function paragraph(doc,text){const p=doc.createElement('p');p.textContent=text;return p;}
export async function showInteractiveExam(doc,panel,level,access){
 panel.querySelector('.portal-document-viewer')?.remove();
 const root=doc.createElement('section');root.className='portal-document-viewer interactive-exam';root.setAttribute('aria-label','Interactive level '+level+' exam');panel.append(root);
 const heading=doc.createElement('h4');heading.textContent='Level '+level+' exam';root.append(heading);
 const close=doc.createElement('button');close.type='button';close.className='button light small';close.textContent='Close exam';close.onclick=()=>root.remove();root.append(close);
 const status=paragraph(doc,'Loading exam…');status.setAttribute('role','status');root.append(status);
 if(access?.adminPreview){status.textContent='This is the full-library preview. Use a client’s individual code to take and submit an exam; use the private review dashboard to see submitted answers.';return;}
 try{
  const loaded=await loadStudentExam(level),exam=loaded.exam;let attempt=loaded.attempt;if(!root.isConnected)return;
  let poll;
  function result(item){clearTimeout(poll);status.textContent=item.status==='Reviewed'?'Final result: '+item.percentage+'%'+(item.feedback?' — '+item.feedback:''):'Submitted — awaiting your teacher’s review. Your final percentage will appear here once all written sections have been marked.';if(item.status!=='Reviewed')poll=setTimeout(async()=>{if(!root.isConnected)return;try{const updated=await request('student/attempts/'+item.id,{role:'student'});if(root.isConnected)result(updated.attempt);}catch(error){if(root.isConnected)status.textContent='Your submission is saved. Reopen the exam to check your result. '+error.message;}},25000);}
  status.textContent='Each section is worth 20 marks. Your final percentage is released after your teacher reviews sections B–E. The listening section requires your teacher’s recording or instructions.';
  const form=doc.createElement('form');form.className='interactive-exam-form';
  const a=doc.createElement('h4');a.textContent='A. Choose the Correct Answer';form.append(a);
  for(const q of exam.questions){const field=doc.createElement('fieldset');field.className='placement-question';const legend=doc.createElement('legend');legend.textContent=q.number+'. '+q.question;field.append(legend);q.options.forEach((option,index)=>{const label=doc.createElement('label'),input=doc.createElement('input');input.type='radio';input.name='A.'+q.number;input.value=index;label.append(input,doc.createTextNode(String.fromCharCode(97+index)+') '+option));field.append(label);});form.append(field);}
  for(const [key,section] of Object.entries(exam.sections)){const h=doc.createElement('h4');h.textContent=section.title;form.append(h);for(const text of section.intro)form.append(paragraph(doc,text));if(section.questions.length){section.questions.forEach((text,i)=>{const label=doc.createElement('label');label.textContent=text;const area=doc.createElement('textarea');area.name=key+'.'+(i+1);area.rows=3;area.maxLength=10000;label.append(area);form.append(label);});}else{const label=doc.createElement('label');label.textContent=key==='D'?'Your listening summary':'Your writing response';const area=doc.createElement('textarea');area.name=key;area.rows=8;area.maxLength=20000;label.append(area);form.append(label);}}
  const draft=attempt.draftAnswers;for(const el of form.elements){const [key,number]=el.name.split('.'),value=number?draft?.[key]?.[number]:draft?.[key];if(value!==undefined){if(el.type==='radio')el.checked=String(value)===el.value;else el.value=value;}}
  const note=paragraph(doc,'Check your answers before submitting. Unanswered questions count as zero. Submitted answers cannot be changed.');form.append(note);
  const button=doc.createElement('button');button.type='submit';button.className='button';button.textContent='Submit exam';form.append(button);root.append(form);
  const timer=paragraph(doc,''),extra=doc.createElement('button');extra.type='button';extra.className='button light small';extra.textContent='Request 10 extra minutes';root.insertBefore(timer,form);root.insertBefore(extra,form);
  let offset=attempt.serverNow-Date.now(),saving,checking=false;
  const collect=()=>{const answers={A:{},B:{},C:{},D:'',E:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [key,number]=name.split('.');if(number)answers[key][number]=key==='A'?Number(value):value;else answers[key]=value;}return answers;};
  const save=async()=>{if(attempt.submittedAt||!root.isConnected)return;try{await request('student/attempts/'+attempt.id+'/draft',{role:'student',method:'POST',data:{answers:collect()}});}catch(error){status.textContent='Answers could not save: '+error.message;}};
  form.addEventListener('input',()=>{clearTimeout(saving);saving=setTimeout(save,400);});
  const onLeave=()=>{clearTimeout(saving);save();};doc.addEventListener('student-portal-locking',onLeave);close.onclick=()=>{onLeave();root.remove();};
  function apply(item){const resumed=attempt.submittedAt&&!item.submittedAt;attempt=item;offset=item.serverNow-Date.now();form.hidden=!!item.submittedAt;extra.hidden=!!item.submittedAt;extra.disabled=item.extension!=='none';extra.textContent=({pending:'Extra time requested — awaiting teacher approval',approved:'10 extra minutes approved',denied:'Extra time request declined'}[item.extension]||'Request 10 extra minutes');if(item.submittedAt)result(item);else if(resumed){clearTimeout(poll);status.textContent='Extra time approved. Continue your exam.';}}
  extra.onclick=async()=>{extra.disabled=true;try{await save();const response=await request('student/attempts/'+attempt.id+'/extra-time',{role:'student',method:'POST',data:{}});apply(response.attempt);}catch(error){status.textContent=error.message;extra.disabled=false;}};
  const ticks=setInterval(async()=>{if(!root.isConnected){clearInterval(ticks);clearTimeout(poll);clearTimeout(saving);doc.removeEventListener('student-portal-locking',onLeave);return;}const remaining=Math.max(0,Math.ceil((attempt.deadline-Date.now()-offset)/1000));timer.textContent='Time remaining: '+Math.floor(remaining/60)+':'+String(remaining%60).padStart(2,'0');if(remaining===0&&!attempt.submittedAt)form.hidden=true;if(!attempt.reviewedAt&&!checking&&((remaining===0&&!attempt.submittedAt)||Date.now()%5000<1100)){checking=true;try{const response=await request('student/attempts/'+attempt.id,{role:'student'});apply(response.attempt);}catch(error){status.textContent=error.message;}finally{checking=false;}}},1000);
  apply(attempt);
  form.onsubmit=async event=>{event.preventDefault();button.disabled=true;status.textContent='Submitting exam…';const answers={A:{},B:{},C:{},D:'',E:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [key,number]=name.split('.');if(number)answers[key][number]=key==='A'?Number(value):value;else answers[key]=value;}
   try{const response=await submitStudentExam(attempt.id,answers);apply(response.attempt);}
   catch(error){status.textContent=error.message;button.disabled=false;}
  };
 }catch(error){status.textContent=error.message;}
}
