import {REVIEW_LEVELS} from './review-levels.js?v=course-levels-1';
export function reviewSubmission(form,submissionId){
 const fields=form.elements;
 const name=fields.name.value.trim(),age=String(fields.age.value).trim(),program=fields.program.value.trim(),level=fields.level.value.trim(),message=fields.message.value.trim();
 const fail=(field,text)=>{const error=new Error(text);error.field=field;throw error;};
 if(name.length>100)fail('name','Please keep your name within 100 characters.');
 if(age&&(!Number.isInteger(Number(age))||Number(age)<16||Number(age)>120))fail('age','Please enter an age between 16 and 120, or leave age blank.');
 if(!program)fail('program','Please choose your program.');
 if(!REVIEW_LEVELS.includes(level))fail('level','Please choose your Speak Boldly level from 1 to 8.');
 if(level.length>100)fail('level','Please keep your level within 100 characters.');
 if(message.length<10)fail('message','Please write at least 10 characters in your review, excluding spaces at the beginning and end.');
 if(message.length>3000)fail('message','Please keep your review within 3,000 characters.');
 return {submissionId,name:name||'Anonymous',age,program,level,message};
}
