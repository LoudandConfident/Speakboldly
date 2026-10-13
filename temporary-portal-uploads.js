import {MATERIAL_PROGRAM_FOLDERS} from './material-program-folders.js?v=comprehension-listening';
// Temporary instructor upload controls. Remove this module when setup is finished.
export function attachTemporaryPortalUploads(doc) {
 const root=doc.querySelector('#students-portal'),expected=root.querySelector('#client-sheet-connect').elements.endpoint.defaultValue;
 const text=(tag,value)=>{const el=doc.createElement(tag);el.textContent=value;return el;};
 const targets=[['portal-exercises','exercises','exercises'],...[...root.querySelectorAll('[data-material-level],[data-material-program]')].map(folder=>[folder,'material','levels',folder.dataset.materialLevel||folder.dataset.materialProgram])];
 for(const [id,section,group,folderKey]of targets) {
  const panel=typeof id==='string'?root.querySelector('#'+id):id;if(!panel||panel.querySelector(':scope>.temporary-portal-uploads'))continue;
  const controls=doc.createElement('div');controls.className='temporary-portal-uploads teacher-library-controls';
  const input=doc.createElement('input');input.type='file';input.multiple=true;input.hidden=true;input.setAttribute('aria-label','Choose uploads for '+section);
  const choose=text('button','Choose files'),upload=text('button','Upload files');choose.type=upload.type='button';choose.className=upload.className='button light small';
  const level=doc.createElement('select');level.setAttribute('aria-label','Material folder');level.append(Object.assign(text('option','Choose folder'),{value:''}));for(let n=1;n<=8;n++)level.append(Object.assign(text('option','Level '+n),{value:String(n)}));for(const program of MATERIAL_PROGRAM_FOLDERS)level.append(Object.assign(text('option',program.title),{value:program.id}));if(folderKey)level.value=folderKey;else if(section==='material')controls.append(level);
  const selection=text('span','No files selected');selection.className='teacher-library-selection';selection.setAttribute('aria-live','polite');
  const note=text('p','Temporary instructor upload');note.setAttribute('role','status');
  choose.onclick=()=>input.click();input.onchange=()=>{selection.textContent=input.files.length?[...input.files].map(file=>file.name).join(', '):'No files selected';};
  async function request(connection,action,data) {
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),45000);
   try{const response=await doc.defaultView.fetch(connection.endpoint,{method:'POST',credentials:'omit',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action,key:connection.key,...data}),signal:controller.signal});const result=await response.json();if(!response.ok||!result.ok)throw new Error(result.error||'Upload failed.');return result;}
   catch(error){if(error.name==='AbortError')throw new Error('Upload timed out. Check Full library before retrying.');throw error;}finally{clearTimeout(timer);}
  }
  upload.onclick=async()=>{
   let connection;try{connection=JSON.parse(doc.defaultView.localStorage.getItem('speak-boldly-client-sheet-connection-v1')||'null');}catch{}
   if(!connection||connection.endpoint!==expected||typeof connection.key!=='string'||!connection.key){note.textContent='Sign in to Instructor Portal and connect Google Sheets first, then return here to upload.';return;}
   if(section==='material'&&!level.value){note.textContent='Choose a material folder first.';return;}
   if(!input.files.length){note.textContent='Choose your files first.';return;}
   upload.disabled=choose.disabled=true;let count=0;
   try{
    for(const file of input.files){
     if(file.size>5000000)throw new Error('For files above 5 MB, upload directly to the matching Google Drive folder.');
     note.textContent='Uploading '+file.name+'…';const bytes=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<bytes.length;i+=32768)binary+=String.fromCharCode(...bytes.subarray(i,i+32768));
     const result=await request(connection,'uploadLibraryFile',{section,name:section==='material'?(/^\d+$/.test(level.value)?'Level '+level.value:MATERIAL_PROGRAM_FOLDERS.find(program=>program.id===level.value).title)+' — '+file.name:file.name,mimeType:file.type,base64:doc.defaultView.btoa(binary)});count++;
     try{await request(connection,'savePortalAccess',{item:{section:group,title:result.item.title,url:result.item.url,enabled:false}});}
     catch(error){throw new Error('File saved to Drive. Portal listing could not be updated: '+error.message+' Refresh files in Instructor Portal after deploying the latest script.');}
    }
    input.value='';selection.textContent='No files selected';note.textContent=count+' file'+(count===1?'':'s')+' uploaded. Use Student Portal access in Instructor Portal to undim them.';
   }catch(error){note.textContent=error.message;}finally{upload.disabled=choose.disabled=false;}
  };
  const picker=doc.createElement('div');picker.className='teacher-library-picker';picker.append(choose,selection);controls.append(input,picker,upload,note);panel.querySelector(':scope>h3,:scope>summary')?.after(controls);
 }
}
