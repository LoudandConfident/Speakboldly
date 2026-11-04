// A remembered browser connection is verified by Google; passwords never live in public source.
export async function connectInstructor(doc,connection,password){
 try{return await connection.connect(password);}catch(error){if(!/Incorrect connection key|Incorrect instructor password/i.test(error.message))throw error;}
 const endpoint=doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue;
 const response=await doc.defaultView.fetch(endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'instructorLogin',password})});
 let result;try{result=await response.json();}catch{throw Error('The login service could not be reached. Try your saved connection.');}
 if(!response.ok||!result.ok){if(/Incorrect connection key|Invalid action|Unknown action/i.test(result.error||''))throw Error('Your familiar password needs the instructor login repair on Google. Use your saved connection here, or install the supplied repair file.');throw Error(result.error||'Your instructor password could not be checked.');}
 if(!/^SBI_[A-Za-z0-9-]{60,100}$/.test(result.credential||''))throw Error('The instructor login did not return a valid session.');
 return connection.connect(result.credential);
}
export function addSavedInstructorConnection(doc,form){
 let saved;try{saved=JSON.parse(doc.defaultView.localStorage.getItem('speak-boldly-client-sheet-connection-v1')||'null');}catch{}
 if(!saved?.key||saved.endpoint!==doc.querySelector('#client-sheet-connect')?.elements.endpoint.defaultValue)return;
 const b=doc.createElement('button');b.type='button';b.className='button light small';b.textContent='Use my saved connection';b.onclick=()=>{const input=form.querySelector('#admin-code');input.value=saved.key;form.requestSubmit();};form.append(b);
}
