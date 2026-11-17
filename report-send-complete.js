import {showSubmissionSuccess} from './submission-success.js?v=report-receipt-96';
// Navigate only after the server confirms delivery. Failed/cancelled sends stay editable.
export function finishSentReport(win,result,returnUrl=null,{message='Document sent.'}={}){
 if(result?.status!=='sent')return false;
 const home=new URL('./',win.location.href);let target=returnUrl?new URL(returnUrl,win.location.href):home;
 if(target.origin!==home.origin)target=home;
 if(win.document){showSubmissionSuccess(win.document,{returnUrl:target.href,message});return true;}
 try{win.location.replace(target.href);return true;}catch{return false;}
}
