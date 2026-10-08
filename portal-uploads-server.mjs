import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import {PORTAL_SECTIONS,canOpenFile,filePermission} from './portal-access.js';
export function createPortalUploads({db,directory,session,getClient,allClients,error}){
 db.exec('CREATE TABLE IF NOT EXISTS files(id TEXT PRIMARY KEY,section TEXT NOT NULL,title TEXT NOT NULL,name TEXT NOT NULL,mime TEXT NOT NULL,client_id TEXT)');
 const pathFor=f=>'/api/files/'+f.id+'/'+encodeURIComponent(f.name);
 return async(req,res,url,headers)=>{
  const path=url.pathname,send=data=>{res.writeHead(200,headers);res.end(JSON.stringify(data));};
  if(path==='/api/admin/files'&&req.method==='POST'){
   session(req,'admin');if(!directory)throw error('Private file storage is not configured.',503);
   let size=0;const chunks=[];for await(const chunk of req){size+=chunk.length;if(size>32*1024*1024)throw error('Choose files under 32 MB per upload.',413);chunks.push(chunk);}
   const form=await new Response(Buffer.concat(chunks),{headers:{'Content-Type':req.headers['content-type']||''}}).formData();
   const section=form.get('section'),clientId=form.get('clientId')||null,file=form.get('file');
   if(!PORTAL_SECTIONS[section]||!file||typeof file.arrayBuffer!=='function')throw error('Choose a folder and a file.');
   const client=clientId?getClient(clientId):null;if(clientId&&!client)throw error('Client not found.',404);
   const name=file.name.split(/[\\/]/).pop().replace(/[^a-zA-Z0-9 ._-]/g,'_').slice(0,150);
   const types={pdf:'application/pdf',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',mp3:'audio/mpeg',wav:'audio/wav',ogg:'audio/ogg',mp4:'video/mp4',webm:'video/webm'};
   const mime=types[name.split('.').pop().toLowerCase()];if(!mime)throw error('Upload PDF, image, audio or video files. Convert Word documents to PDF first.');
   const bytes=Buffer.from(await file.arrayBuffer());if(!bytes.length)throw error('The file is empty.');
   if(mime==='application/pdf'&&!bytes.subarray(0,5).equals(Buffer.from('%PDF-')))throw error('Invalid PDF file.');
   const f={id:randomUUID(),section,title:name.replace(/\.[^.]+$/,'').replace(/[-_]/g,' '),name,mime,client_id:clientId};
   mkdirSync(directory,{recursive:true});writeFileSync(directory+'/'+f.id,bytes,{flag:'wx'});
   db.prepare('INSERT INTO files VALUES(?,?,?,?,?,?)').run(f.id,f.section,f.title,f.name,f.mime,f.client_id);
   if(client){client.permissions=[...new Set([...client.permissions,'section:'+section,filePermission(section,pathFor(f))])];db.prepare('UPDATE clients SET data=? WHERE id=?').run(JSON.stringify(client),client.id);}
   send({file:{title:f.title,url:pathFor(f)},clients:allClients()});return true;
  }
  const listing=path.match(/^\/api\/(admin|student)\/files$/);
  if(listing&&req.method==='GET'){
   const auth=session(req,listing[1]),section=url.searchParams.get('section');if(!PORTAL_SECTIONS[section])throw error('Unknown folder.');
   const rows=db.prepare('SELECT * FROM files WHERE section=?').all(section).filter(f=>listing[1]==='admin'||!f.client_id||f.client_id===auth.client_id);
   send({files:rows.map(f=>({title:f.title,url:pathFor(f)}))});return true;
  }
  const download=path.match(/^\/api\/files\/([a-f0-9-]+)\/[^/]+$/);
  if(download&&req.method==='GET'){
   let auth;try{auth=session(req,'admin');}catch{auth=session(req,'student');}
   const f=db.prepare('SELECT * FROM files WHERE id=?').get(download[1]);if(!f)throw error('File not found.',404);
   if(auth.role!=='admin'&&((f.client_id&&f.client_id!==auth.client_id)||!canOpenFile(getClient(auth.client_id),f.section,pathFor(f))))throw error('Your teacher has not granted access to this file.',403);
   const bytes=readFileSync(directory+'/'+f.id);res.writeHead(200,{...headers,'Content-Type':f.mime,'Content-Disposition':'inline','Content-Length':bytes.length});res.end(bytes);return true;
  }
  return false;
 };
}
