import {backendBase,loginOwner,clearOwner,request} from './exam-api.js';
export function initializeExamReview(doc,isUnlocked,onClients){
 const root=doc.querySelector('#exam-review');if(!root)return;
 const login=root.querySelector('#private-owner-login'),status=root.querySelector('#exam-review-status'),content=root.querySelector('#exam-review-content'),list=root.querySelector('#exam-attempts'),events=root.querySelector('#exam-events'),detail=root.querySelector('#exam-review-detail');
 const time=value=>value?new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
 function label(text){const el=doc.createElement('p');el.textContent=text;return el;}
 async function review(item){
  detail.replaceChildren();try{const exam=await request('admin/exams/'+item.level,{role:'admin'});if(!isUnlocked())return;
   const h=doc.createElement('h4');h.textContent=item.client.name+' — Level '+item.level;detail.append(h,label('Multiple choice: '+item.multipleChoiceMarks+' / 20 (automatically marked)'));
   for(const section of ['B','C','D','E']){const heading=doc.createElement('h4');heading.textContent=exam.sections[section].title;detail.append(heading);const values=item.answers[section];if(typeof values==='string')detail.append(label(values||'(No answer)'));else for(const [number,text]of Object.entries(values)){detail.append(label(number+'. '+exam.sections[section].questions[Number(number)-1]),label(text||'(No answer)'));}}
   const notes=doc.createElement('details'),summary=doc.createElement('summary');summary.textContent='Teacher notes and suggested answers';notes.append(summary);for(const text of exam.teacherNotes)notes.append(label(text));detail.append(notes);
   const form=doc.createElement('form');form.className='exam-mark-form';
   for(const section of ['B','C','D','E']){const label=doc.createElement('label');label.textContent=section+' — marks out of 20';const input=doc.createElement('input');input.type='number';input.name=section;input.min=0;input.max=20;input.step='0.5';input.required=true;if(item.marks)input.value=item.marks[section];label.append(input);form.append(label);}
   const feedback=doc.createElement('label');feedback.textContent='Feedback';const area=doc.createElement('textarea');area.name='feedback';area.rows=4;area.maxLength=10000;area.value=item.feedback||'';feedback.append(area);form.append(feedback);
   const button=doc.createElement('button');button.type='submit';button.className='button';button.textContent='Save review & release final percentage';form.append(button);detail.append(form);
   form.onsubmit=async event=>{event.preventDefault();if(!isUnlocked()||!form.reportValidity())return;button.disabled=true;try{const data=new doc.defaultView.FormData(form),marks=Object.fromEntries(['B','C','D','E'].map(k=>[k,Number(data.get(k))]));const result=await request('admin/attempts/'+item.id+'/review',{role:'admin',method:'POST',data:{marks,feedback:data.get('feedback')}});status.textContent='Final result released: '+result.attempt.percentage+'%';detail.replaceChildren();await refresh();}catch(error){status.textContent=error.message;button.disabled=false;}};
  }catch(error){status.textContent=error.message;}
 }
 async function refresh(){
  try{const response=await request('admin/attempts',{role:'admin'});if(!isUnlocked())return;list.replaceChildren();events.replaceChildren();
   for(const item of response.attempts){const row=doc.createElement('article');row.className='exam-attempt';row.append(label(item.client.name+' — Level '+item.level+' — '+item.status),label('Opened: '+time(item.openedAt)+' | Submitted: '+time(item.submittedAt)),label(item.percentage===null?'Final result pending':item.percentage+'%'));if(item.submittedAt){const b=doc.createElement('button');b.type='button';b.className='button light small';b.textContent='Review answers';b.onclick=()=>review(item);row.append(b);}list.append(row);}
   if(!response.attempts.length)list.append(label('No exam attempts yet.'));
   for(const event of response.events)events.append(label(event.clientName+' — Level '+event.level+' — '+event.kind+' — '+time(event.at)));
  }catch(error){status.textContent=error.message;}
 }
 login.onsubmit=async event=>{event.preventDefault();if(!isUnlocked())return;const button=login.querySelector('button');button.disabled=true;try{const clients=await loginOwner(login.elements.password.value);if(!isUnlocked()){clearOwner();return;}login.reset();login.hidden=true;content.hidden=false;onClients(clients);status.textContent='Private storage connected. Add clients above to make their codes work across devices.';await refresh();}catch(error){status.textContent=error.message;}finally{button.disabled=false;}};
 root.querySelector('#exam-review-refresh').onclick=()=>{if(isUnlocked())refresh();};
 if(!backendBase()){login.querySelector('button').disabled=true;status.textContent='Private exam storage has not been connected. Online access tracking, submissions and shared results are not available yet.';}
 return{lock(){clearOwner();login.reset();login.hidden=false;content.hidden=true;list.replaceChildren();events.replaceChildren();detail.replaceChildren();status.textContent=backendBase()?'':'Private exam storage is not connected yet. Access tracking and online submissions are awaiting the one-time hosting connection.';}};
}
