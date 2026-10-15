function paragraph(doc,text){const p=doc.createElement('p');p.textContent=text;return p;}
export function createExamForm(doc,exam){
 const form=doc.createElement('form');form.className='interactive-exam-form';
 const pages=[];
 function page(title){const section=doc.createElement('section');section.className='exam-text-page';const h=doc.createElement('h4');h.textContent=title;h.tabIndex=-1;section.append(h);form.append(section);pages.push(section);return section;}
 for(let start=0;start<exam.questions.length;start+=10){
  const section=page('A. Choose the Correct Answer · '+(start+1)+'–'+Math.min(start+10,exam.questions.length));
  for(const q of exam.questions.slice(start,start+10)){
   const field=doc.createElement('fieldset');field.className='placement-question';const legend=doc.createElement('legend');legend.textContent=q.number+'. '+q.question;field.append(legend);
   q.options.forEach((option,index)=>{const label=doc.createElement('label'),input=doc.createElement('input');input.type='radio';input.name='A.'+q.number;input.value=index;label.append(input,doc.createTextNode(String.fromCharCode(97+index)+') '+option));field.append(label);});section.append(field);
  }
 }
 for(const [key,data] of Object.entries(exam.sections)){
  const section=page(data.title);for(const text of data.intro)section.append(paragraph(doc,text));
  if(data.questions.length){data.questions.forEach((text,i)=>{if(typeof text==='object'&&text.options){const field=doc.createElement('fieldset'),legend=doc.createElement('legend');legend.textContent=(i+1)+'. '+text.question;field.append(legend);text.options.forEach((option,index)=>{const label=doc.createElement('label'),input=doc.createElement('input');input.type='radio';input.name=key+'.'+(i+1);input.value=index;label.append(input,doc.createTextNode(option));field.append(label);});section.append(field);return;}const label=doc.createElement('label');label.className='exam-written-question';label.append(doc.createTextNode(text));const area=doc.createElement('textarea');area.name=key+'.'+(i+1);area.rows=3;area.maxLength=10000;label.append(area);section.append(label);});}
  else{const label=doc.createElement('label');label.className='exam-written-question';label.append(doc.createTextNode(key==='D'?'Your listening summary':'Your writing response'));const area=doc.createElement('textarea');area.name=key;area.rows=8;area.maxLength=20000;label.append(area);section.append(label);}
 }
 const pager=doc.createElement('div');pager.className='test-pager';const previous=doc.createElement('button'),next=doc.createElement('button'),position=doc.createElement('span');previous.type=next.type='button';previous.className=next.className='button light';previous.textContent='Previous';next.textContent='Next';position.setAttribute('aria-live','polite');pager.append(previous,position,next);form.append(pager);
 let current=0;
 function render(move=false){pages.forEach((section,i)=>section.hidden=i!==current);previous.disabled=current===0;next.disabled=current===pages.length-1;position.textContent='Page '+(current+1)+' of '+pages.length;if(move)pages[current].querySelector('h4').focus();}
 previous.onclick=()=>{if(current>0){current--;render(true);}};next.onclick=()=>{if(current<pages.length-1){current++;render(true);}};render();
 return form;
}
