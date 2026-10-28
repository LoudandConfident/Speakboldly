export function collectGeneralEnglishAnswers(doc,form){const answers={A:{},B:{},C:{},D:{},E:'',plan:''};for(const [name,value]of new doc.defaultView.FormData(form)){const [section,number]=name.split('.');if(number){if(section==='B')answers.B[number]=Number(value);else answers[section][number]=value;}else if(section==='E'||section==='plan')answers[section]=value;}return answers;}
export function createGeneralEnglishExamForm(doc,exam){
 const form=doc.createElement('form');form.className='interactive-exam-form ge-exam-form';form.noValidate=true;const pages=[];
 const p=value=>{const n=doc.createElement('p');n.textContent=value;return n;};
 for(const [key,data]of Object.entries(exam.sections)){
  const section=doc.createElement('section');section.className='exam-text-page';section.dataset.examSection=key;const h=doc.createElement('h3');h.tabIndex=-1;h.textContent=data.title+' · '+data.marks+' marks';section.append(h,p(data.instruction));
  if(data.wordBank){const bank=p(data.wordBank.join(' · '));bank.className='ge-word-bank';section.append(bank);}
  if(data.passage){const passage=p(data.passage);passage.className='ge-reading-passage';section.append(passage);}
  if(key==='D'){const live=p('Listening with your coach: the passage will be read live twice.');live.className='ge-listening-live';section.append(live);}
  for(const q of data.questions||[]){
   if(q.options){const field=doc.createElement('fieldset');field.className='placement-question';const legend=doc.createElement('legend');legend.textContent=q.number+'. '+q.question;field.append(legend);q.options.forEach((option,i)=>{const label=doc.createElement('label'),input=doc.createElement('input');input.type='radio';input.name=key+'.'+q.number;input.value=String(i);label.append(input,doc.createTextNode(option));field.append(label);});section.append(field);continue;}
   const label=doc.createElement('label');label.className='exam-written-question';label.append(doc.createTextNode(q.number+'. '+q.question));let input;
   if(key==='A'){input=doc.createElement('select');input.append(new doc.defaultView.Option('Choose a word',''));for(const word of data.wordBank)input.append(new doc.defaultView.Option(word,word));}else{input=doc.createElement('textarea');input.rows=3;input.maxLength=1500;}
   input.name=key+'.'+q.number;label.append(input);section.append(label);
  }
  if(key==='E'){
   section.append(p('Target length: '+data.wordMin+'–'+data.wordMax+' words.'));
   const rubric=doc.createElement('ul');for(const item of data.rubric){const li=doc.createElement('li');li.textContent=item.criterion+' · '+item.marks+' marks';rubric.append(li);}section.append(rubric);
   for(const [name,title,rows,max]of [['plan','Planning notes (not marked)',4,3000],['E','Your final writing response',10,12000]]){const label=doc.createElement('label');label.className='exam-written-question';label.textContent=title;const area=doc.createElement('textarea');area.name=name;area.rows=rows;area.maxLength=max;label.append(area);section.append(label);if(name==='E'){const count=p('0 words');count.className='ge-writing-count';area.addEventListener('input',()=>{count.textContent=(area.value.trim()?area.value.trim().split(/\s+/).length:0)+' words';});}}
  }
  form.append(section);pages.push(section);
 }
 const nav=doc.createElement('div');nav.className='test-pager';const previous=doc.createElement('button'),position=doc.createElement('span'),next=doc.createElement('button');previous.type=next.type='button';previous.className=next.className='button light';previous.textContent='Previous';next.textContent='Next';position.setAttribute('aria-live','polite');nav.append(previous,position,next);form.append(nav);let current=0;
 function show(move=false){pages.forEach((p,i)=>p.hidden=i!==current);previous.disabled=current===0;next.disabled=current===pages.length-1;position.textContent='Page '+(current+1)+' of '+pages.length;if(move)pages[current].querySelector('h3').focus();}
 previous.onclick=()=>{if(current>0){current--;show(true);}};next.onclick=()=>{if(current<pages.length-1){current++;show(true);}};show();return form;
}
