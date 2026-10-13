import {buildAssessmentPdf} from './assessment-pdf.js';
import {studentDocumentFilename,documentDate} from './student-document-filenames.js';
import {clientSheetConnected,sheetLibraryRequest as sheetExamRequest} from './client-sheet.js?v=level-history';
import {getLevelExamText} from './exam-questions.js';

export function initializeExamReview(doc,isUnlocked) {
 const root=doc.querySelector('#exam-review');if(!root)return;
 const status=root.querySelector('#exam-review-status'),content=root.querySelector('#exam-review-content'),list=root.querySelector('#exam-attempts'),detail=root.querySelector('#exam-review-detail');
 let generation=0;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 const time=value=>value?new Intl.DateTimeFormat('en-GB',{timeZone:'Africa/Cairo',dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'—';
 function review(item) {
  detail.replaceChildren();const exam=getLevelExamText(item.level);
  detail.append(text('h4',item.name+' — Level '+item.level));
  const heading=text('h4','A. Choose the Correct Answer');detail.append(heading);
  for(const q of exam.questions){const answer=item.answers.A[q.number];detail.append(text('p',q.number+'. '+q.question),text('p',Number.isInteger(answer)?String.fromCharCode(97+answer)+') '+q.options[answer]:'(No answer)'));}
  for(const section of ['B','C','D','E']) {
   const data=exam.sections[section];detail.append(text('h4',data.title));for(const intro of data.intro)detail.append(text('p',intro));
   if(data.questions.length)data.questions.forEach((q,i)=>detail.append(text('p',q),text('p',item.answers[section]?.[i+1]||'(No answer)')));
   else detail.append(text('p',item.answers[section]||'(No answer)'));
  }
  const form=doc.createElement('form');form.className='exam-mark-form';
  for(const section of ['A','B','C','D','E']){const label=text('label',section+' — marks out of 20'),input=doc.createElement('input');input.type='number';input.name=section;input.min=0;input.max=20;input.step='0.5';input.required=true;if(item.marks)input.value=item.marks[section];label.append(input);form.append(label);}
  const label=text('label','Feedback'),feedback=doc.createElement('textarea');feedback.name='feedback';feedback.maxLength=10000;feedback.rows=4;feedback.value=item.feedback||'';label.append(feedback);form.append(label);
  const button=text('button','Save corrected score');button.type='submit';button.className='button';form.append(button);detail.append(form);
  form.onsubmit=async event=>{
   event.preventDefault();if(!isUnlocked()||!form.reportValidity())return;const current=generation;button.disabled=true;
   try{const data=new doc.defaultView.FormData(form),marks=Object.fromEntries(['A','B','C','D','E'].map(key=>[key,Number(data.get(key))]));const result=await sheetExamRequest('reviewExamAttempt',{attemptId:item.id,version:item.version,marks,feedback:data.get('feedback')});if(current!==generation||!isUnlocked())return;detail.replaceChildren();await refresh();status.textContent='Score saved: '+result.attempt.score+' / 100. '+item.name+' can view it in the Student Portal.';}
   catch(error){if(current===generation)status.textContent=error.message;}finally{button.disabled=false;}
  };
 }
 async function refresh() {
  if(!isUnlocked())return;const current=generation;content.hidden=false;
  if(!clientSheetConnected()){status.textContent='Connect your Clients sheet in Google Sheets, then check submissions.';return;}
  status.textContent='Loading assessments…';
  try{const result=await sheetExamRequest('listExamAttempts');if(current!==generation||!isUnlocked())return;list.replaceChildren();
   for(const item of result.attempts){
    const row=doc.createElement('article');row.className='exam-attempt';row.append(text('h4',item.name+' — Level '+item.level),text('p','Program: '+item.program+(item.age?' · Age: '+item.age:'')),text('p',item.status+' · '+(item.score===null?'Score pending correction':item.score+' / 100')),text('p','Opened: '+time(item.openedAt)+' · Submitted: '+time(item.submittedAt)));
    if(item.submittedAt){
     const download=text('button','Download assessment PDF');download.type='button';download.className='button light small';download.onclick=async()=>{if(!isUnlocked())return;const current=generation;download.disabled=true;try{const response=await doc.defaultView.fetch('./document-templates/DejaVuSans.ttf');if(!response.ok)throw new Error('Assessment font could not load.');const bytes=await buildAssessmentPdf(item,new Uint8Array(await response.arrayBuffer()));if(current!==generation||!isUnlocked())return;const url=doc.defaultView.URL.createObjectURL(new Blob([bytes],{type:'application/pdf'})),link=doc.createElement('a');link.href=url;link.download=studentDocumentFilename(item.name,'Assessment',{level:item.level,date:documentDate(new Date(item.submittedAt))});doc.body.append(link);link.click();link.remove();doc.defaultView.setTimeout(()=>doc.defaultView.URL.revokeObjectURL(url),60000);}catch(error){if(current===generation)status.textContent=error.message;}finally{download.disabled=false;}};row.append(download);
     row.append(text('p','Notification email: '+(item.notificationStatus||'Pending')+(item.notificationError?' — '+item.notificationError:'')));
     if(item.notificationStatus==='failed'){const retry=text('button','Retry notification email');retry.type='button';retry.className='button light small';retry.onclick=async()=>{retry.disabled=true;try{await sheetExamRequest('retryExamNotification',{attemptId:item.id});await refresh();}catch(error){status.textContent=error.message;retry.disabled=false;}};row.append(retry);}
     const button=text('button',item.status==='Reviewed'?'Edit correction':'Correct assessment');button.type='button';button.className='button light small';button.onclick=()=>review(item);row.append(button);
    }
    list.append(row);
   }
   if(!result.attempts.length)list.append(text('p','No assessment attempts yet.'));status.textContent='';
  }catch(error){if(current===generation)status.textContent=error.message;}
 }
 root.querySelector('#exam-review-refresh').onclick=refresh;
 root.addEventListener('toggle',()=>{if(root.open)refresh();});
 doc.addEventListener('client-sheet-configured',()=>{if(root.open)refresh();});
 return {refresh,lock(){generation++;list.replaceChildren();detail.replaceChildren();content.hidden=true;status.textContent='';}};
}
