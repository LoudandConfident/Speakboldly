// Navigate only after the server confirms delivery. Failed/cancelled sends stay editable.
export function finishSentReport(win,result,returnUrl=null){
 if(result?.status!=='sent')return false;
 const home=new URL('./',win.location.href);let target=returnUrl?new URL(returnUrl,win.location.href):home;
 if(target.origin!==home.origin)target=home;
 try{win.location.replace(target.href);return true;}catch{return false;}
}
