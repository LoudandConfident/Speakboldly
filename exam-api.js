import {EXAM_BACKEND_URL} from './exam-config.js';
let ownerToken=null,studentToken=null;
export function backendBase(){if(EXAM_BACKEND_URL)return EXAM_BACKEND_URL.replace(/\/$/,'');if(typeof location!=='undefined'&&['localhost','127.0.0.1'].includes(location.hostname))return location.origin;return null;}
export function ownerConnected(){return !!ownerToken;}
export function clearOwner(){ownerToken=null;}
export function clearStudent(){studentToken=null;}
export async function request(path,{role,method='GET',data}={}){
 const base=backendBase();if(!base)throw new Error('Private exam storage is not connected yet. Your teacher needs to finish connecting it before online exams can be submitted.');
 const token=role==='admin'?ownerToken:role==='student'?studentToken:null;
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
 try{const response=await fetch(base+'/api/'+path,{method,headers:{...(data?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})},body:data?JSON.stringify(data):undefined,signal:controller.signal});let result;try{result=await response.json();}catch{throw new Error('Private exam storage is unavailable.');}if(!response.ok)throw new Error(result.error||'Request failed.');return result;}
 finally{clearTimeout(timer);}
}
export async function loginOwner(password){const result=await request('admin/login',{method:'POST',data:{password}});ownerToken=result.token;return(await request('admin/clients',{role:'admin'})).clients;}
export async function loginStudent(code){const result=await request('student/login',{method:'POST',data:{code}});studentToken=result.token;return result.access;}
export async function savePrivateClient(client){return(await request('admin/clients',{role:'admin',method:'POST',data:client})).client;}
export function loadStudentExam(level){return request('student/exams/'+level,{role:'student'});}
export function submitStudentExam(id,answers){return request('student/attempts/'+id+'/submit',{role:'student',method:'POST',data:{answers}});}

export function studentConnected(){return !!studentToken;}
export async function uploadPrivateFile(section,clientId,file){
 const data=new FormData();data.set('section',section);data.set('clientId',clientId);data.set('file',file);
 const response=await fetch(backendBase()+'/api/admin/files',{method:'POST',headers:{Authorization:'Bearer '+ownerToken},body:data});const result=await response.json();if(!response.ok)throw new Error(result.error||'Upload failed.');return result;
}
export async function privateFiles(section){const role=ownerToken?'admin':studentToken?'student':null;if(!role)return[];const result=await request(role+'/files?section='+encodeURIComponent(section),{role});return result.files.map(f=>({...f,url:backendBase()+f.url}));}
export async function fileBytes(url){const base=backendBase(),privateUrl=base&&url.startsWith(base+'/api/files/');const response=await fetch(url,{headers:privateUrl?{Authorization:'Bearer '+(ownerToken||studentToken)}:{}});if(!response.ok)throw new Error('File unavailable.');return new Uint8Array(await response.arrayBuffer());}
