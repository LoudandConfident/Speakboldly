import {initializeTeacherLibrary} from './teacher-library.js?v=domain-email-routing';
import {loadPortalMaterials} from './portal-materials.js?v=parallel-files-1';
export function initializeMaterialOwnerLibrary(doc){
 const root=doc.querySelector('#teacher-full-library'),expected=doc.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;let clients=[];
 function connection(){try{const saved=JSON.parse(doc.defaultView.localStorage.getItem('speak-boldly-client-sheet-connection-v1')||'null');return saved?.endpoint===expected&&typeof saved.key==='string'&&saved.key?saved:null;}catch{return null;}}
 const connected=()=>Boolean(connection());
 async function request(action,data={}){
  const saved=connection();if(!saved)throw new Error('Connect your existing client sheet in Instructor Portal first.');
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
  try{const response=await doc.defaultView.fetch(saved.endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,key:saved.key,...data}),signal:controller.signal});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Library request failed.');return result;}
  catch(error){if(error.name==='AbortError')throw new Error('Google Drive took too long to respond. Check the folder before retrying an upload.');throw error;}finally{clearTimeout(timer);}
 }
 const library=initializeTeacherLibrary(doc,connected,()=>clients,loadPortalMaterials,{connected,request,sections:{material:'Material',exercises:'Exercises',exams:'Exam files',listening:'Listening tracks'}});
 return {async refresh(){root.hidden=!connected();if(root.hidden)return;try{clients=(await request('listClients')).clients||[];}catch{}await library.refresh();},lock(){library.lock();root.hidden=true;}};
}
