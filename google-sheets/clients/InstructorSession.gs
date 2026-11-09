
// Password-only instructor login, built into the combined script.
// Reuses existing private password hashes and six-hour session credentials; no setup or data reset.
function sbUnifiedInstructorSessionEvent(event){
 let data;try{data=JSON.parse(event?.postData?.contents||'null');}catch{return null;}
 if(!data||(data.action!=='instructorLogin'&&!String(data.key||'').startsWith('SBI_')))return null;
 const json=value=>ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
 try{
  const props=PropertiesService.getScriptProperties(),cache=CacheService.getScriptCache(),salt=props.getProperty('SB_INSTRUCTOR_PASSWORD_SALT'),expected=props.getProperty('SB_INSTRUCTOR_PASSWORD_HASH'),privateKey=props.getProperty('CLIENT_SYNC_KEY');
  if(!privateKey||!props.getProperty('CLIENT_SHEET_ID'))throw Error('Use your existing Clients Apps Script project and keep its Script Properties.');
  if(!salt||!expected)throw Error('Your instructor password is not configured in this project. Use the existing Clients project with its saved instructor password.');
  const digest=value=>Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+':'+value));
  if(data.action==='instructorLogin'){
   if(event.postData.contents.length>2000)throw Error('Invalid login request.');
   const lock=LockService.getScriptLock();lock.waitLock(10000);
   try{
    const failures=Number(cache.get('sb-instructor-login-failures')||0);if(failures>=10)throw Error('Too many unsuccessful attempts. Try again in 15 minutes.');
    const password=String(data.password||'');if(password.length<8||password.length>128||digest(password)!==expected){cache.put('sb-instructor-login-failures',String(failures+1),900);throw Error('Incorrect instructor password.');}
    cache.remove('sb-instructor-login-failures');const credential='SBI_'+Utilities.getUuid()+Utilities.getUuid(),expires=Date.now()+21600000;
    cache.put('sb-instructor-session:'+digest(credential),JSON.stringify({salt,expires}),21600);return json({ok:true,credential,expires});
   }finally{lock.releaseLock();}
  }
  if(!/^SBI_[A-Za-z0-9-]{60,100}$/.test(String(data.key||'')))throw Error('Your instructor session expired. Sign in again with your password.');
  let session;try{session=JSON.parse(cache.get('sb-instructor-session:'+digest(data.key))||'null');}catch{}
  if(!session||session.salt!==salt||session.expires<=Date.now())throw Error('Your instructor session expired. Sign in again with your password.');
  data.key=privateKey;event.postData.contents=JSON.stringify(data);return null;
 }catch(error){return json({ok:false,error:String(error.message||error)});}
}
