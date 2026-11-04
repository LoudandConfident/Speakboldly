// Passwords are checked by the private Google service, never stored in website source.
export async function connectInstructor(doc,connection,password){
 const endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue;
 const secret=String(password||'');if(!secret)throw Error('Enter your instructor password.');
 // A resumed session can be validated directly without a second password request.
 if(/^SBI_[A-Za-z0-9-]{60,100}$/.test(secret))return connection.connect(secret);
 const controller=new doc.defaultView.AbortController(),timeout=doc.defaultView.setTimeout(()=>controller.abort(),15000);
 try{
  const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'instructorLogin',password:secret}),signal:controller.signal});
  let result;try{result=await response.json();}catch{throw Error('The login service could not be reached. Please try again.');}
  if(!response.ok||!result.ok){
   if(/Incorrect connection key|Invalid action|Unknown action|setupInstructorLoginRepair|setInstructorPasswordNow/i.test(result.error||''))throw Error('Google is still running the old login version. Deploy a New version of your existing Apps Script web app, then reload. Your instructor password has not been checked yet.');
   throw Error(result.error||'Your instructor password could not be checked.');
  }
  if(!/^SBI_[A-Za-z0-9-]{60,100}$/.test(result.credential||''))throw Error('The instructor login did not return a valid session.');
  return await connection.connect(result.credential);
 }catch(error){if(error.name==='AbortError')throw Error('Google took too long to check your password. Please try again.');if(error instanceof TypeError)throw Error('Could not reach the login service. Check your connection and try again.');throw error;}finally{doc.defaultView.clearTimeout(timeout);}
}
