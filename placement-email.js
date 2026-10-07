import {scoreAnswers} from './placement-scoring.js';
export function buildResultEmail(record) {
 const result=scoreAnswers(record.answers);
 return {
  _subject:'Someone scored '+result.level+' — Speak Boldly',
  _template:'table',
  _captcha:'false',
  _url:'https://loudandconfident.github.io/Speakboldly/',
  'Test version':record.version,
  'Attempt ID':record.attemptId,
  'Submitted at (UTC)':record.submittedAt,
  'Score':result.score+' / '+result.total,
  'Percentage':result.percentage+'%',
  'Estimated level':result.level,
  'Answered questions':result.answered+' / '+result.total,
  'Result note':'Provisional estimate from the shortened Language Hub test, not a certified CEFR level. No participant name or email is collected.'
 };
}
export function emailResponseStatus(data) {
 const message=String(data?.message||'');
 if(/activat|confirm.*email|check.*email/i.test(message))return 'activation-required';
 if(data?.success===true||data?.success==='true')return 'accepted';
 throw new Error('Email request was not accepted');
}
