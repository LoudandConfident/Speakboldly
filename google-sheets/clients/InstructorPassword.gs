// Additive password-only sign-in. No spreadsheet cells, sheet protections or emails.
// Install the small FIRST-inside-doPost block in INSTRUCTOR-PASSWORD-SETUP.md.
function sbInstructorPasswordEvent(event){
 let data;try{data=JSON.parse(event?.postData?.contents||'null');}catch{return null;}
 if(!data||(data.action!=='instructorLogin'&&!String(data.key||'').startsWith('SBI_')))return null;
 const json=value=>ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
 try{
  const properties=PropertiesService.getScriptProperties(),cache=CacheService.getScriptCache(),salt=properties.getProperty('SB_INSTRUCTOR_PASSWORD_SALT'),expected=properties.getProperty('SB_INSTRUCTOR_PASSWORD_HASH');
  if(!salt||!expected)throw Error('Run setupInstructorPasswordOnly once, then deploy a new version.');
  const digest=value=>Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,salt+':'+value));
  if(data.action==='instructorLogin'){
   if(event.postData.contents.length>2000)throw Error('Invalid login request.');
   const lock=LockService.getScriptLock();lock.waitLock(10000);try{
    const failures=Number(cache.get('sb-instructor-login-failures')||0);if(failures>=10)throw Error('Too many unsuccessful attempts. Try again in 15 minutes.');
    const password=String(data.password||'');if(password.length<8||password.length>128||digest(password)!==expected){cache.put('sb-instructor-login-failures',String(failures+1),900);throw Error('Incorrect instructor password.');}
    cache.remove('sb-instructor-login-failures');const credential='SBI_'+Utilities.getUuid()+Utilities.getUuid(),expires=Date.now()+21600000;
    cache.put('sb-instructor-session:'+digest(credential),JSON.stringify({salt,expires}),21600);return json({ok:true,credential,expires});
   }finally{lock.releaseLock();}
  }
  let session;try{session=JSON.parse(cache.get('sb-instructor-session:'+digest(data.key))||'null');}catch{}
  if(!session||session.salt!==salt||session.expires<=Date.now())throw Error('Your instructor session expired. Sign in again with your password.');
  const privateKey=properties.getProperty('CLIENT_SYNC_KEY');if(!privateKey)throw Error('Keep your existing Clients Apps Script project.');
  data.key=privateKey;event.postData.contents=JSON.stringify(data);return null;
 }catch(error){return json({ok:false,error:String(error.message||error)});}
}
