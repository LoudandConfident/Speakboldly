// ADD as a separate DriveFolders.gs file in the existing Clients project.
// Do not replace Code.gs. See DRIVE-FOLDERS-SETUP.md.
const SB_DRIVE_ROOTS={practice:'14sQwnxHRaZ9Lw0bAaJttvyHIKrse0c9L',library:'1PDDCug1wmNKH-TpsJQeLdb7VlpdS_d_Y'};
const SB_DRIVE_CHUNK=2000000,SB_DRIVE_MAX=100000000;
function setupDriveFolders(){
 for(const id of Object.values(SB_DRIVE_ROOTS)){const f=DriveApp.getFolderById(id);if(f.isTrashed())throw Error('A materials folder is in the trash.');console.log('Connected: '+f.getName());}
 if(typeof sbHubAllowed!=='function'||typeof sbPortalItems!=='function')throw Error('Keep the existing Clients Code.gs and password functions.');
 PropertiesService.getScriptProperties().setProperty('SB_DRIVE_FOLDERS_ENABLED','true');
 console.log('Folder discovery ready. Deploy a New version of the existing Clients web app. No client, calendar or material rows were changed.');
}
function sbDriveFoldersHandleEvent(event){
 let p;try{p=JSON.parse(event?.postData?.contents||'null');}catch{return null;}
 if(!p||!['studentPortalAccess','listPortalAccess','driveFolderRead','driveFolderSettings','savePortalAccess'].includes(p.action))return null;
 if(p.action==='savePortalAccess'&&!String(p.item?.id||'').startsWith('drive-folder:'))return null;
 const enabled=PropertiesService.getScriptProperties().getProperty('SB_DRIVE_FOLDERS_ENABLED')==='true';
 if(!enabled&&p.action!=='driveFolderSettings'&&p.action!=='driveFolderRead')return null;
 const json=x=>ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON);
 try{
  if(event.postData.contents.length>65000)throw Error('Request too large.');
  if(p.action==='driveFolderSettings'){sbRequireClientConnection(p);return json({ok:true,enabled,roots:SB_DRIVE_ROOTS,maxBytes:SB_DRIVE_MAX});}
  if(!enabled)throw Error('Drive folder access has not been activated yet.');
  if(p.action==='driveFolderRead')return json(sbDriveRead(p));
  if(p.action==='savePortalAccess'){sbRequireClientConnection(p);const m=String(p.item.id).match(/^drive-folder:(library):([\w-]{10,200})$/);if(!m||typeof p.item.enabled!=='boolean')throw Error('Practice Zone uses its monthly password; choose a library file to change individual access.');const {item}=sbDriveFind(m[2],m[1]),key='SB_DRIVE_DIM_'+m[1]+'_'+m[2],props=PropertiesService.getScriptProperties();if(p.item.enabled)props.deleteProperty(key);else props.setProperty(key,'true');return json({ok:true,item:{...p.item,title:item.title,url:'',enabled:p.item.enabled}});}
  const owner=p.action==='listPortalAccess';if(owner)sbRequireClientConnection(p);
  const original=sbPortalItems(sbExamBook()),dynamic=sbDriveCatalog(),ids=new Set(dynamic.map(x=>x.driveFileId));
  // Prefer the folder-backed copy of a registered Drive file, retaining its explicit dim setting.
  const registered=new Map();for(const item of original){const id=String(item.url||'').match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1];if(id)registered.set(id,item);}
  const extra=dynamic.map(item=>({...item,enabled:item.enabled&&(registered.get(item.driveFileId)||{}).enabled!==false}));
  const items=original.filter(item=>!ids.has(String(item.url||'').match(/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1])).concat(extra);
  if(owner)return json({ok:true,items,driveFolders:{enabled:true,maxBytes:SB_DRIVE_MAX}});
  return json({ok:true,passwordFreeFiles:true,hubAccess:sbHubSnapshot(false),items:items.map(item=>{
   const key=item.driveFolder?sbDriveKey(item):(sbHubItemKey(item)||(item.section==='exercises'?sbHubKeys().find(k=>k.startsWith('exercises:')&&sbHubAllowed(k,(p.hubGrants||{})[k])):null)),entry=key?sbHubEntry(key):null,enabled=item.enabled&&(!entry||entry.enabled);
   const allowed=enabled&&key&&sbHubAllowed(key,(p.hubGrants||{})[key]);
   // Folder files are always served through the password-checked reader, never a public Drive URL.
   return {...item,enabled,url:item.driveFolder?'':allowed?item.url:'',requiresAccess:Boolean(entry?.protected)};
  })});
 }catch(error){return json({ok:false,error:String(error.message||error)});}
}
function sbDriveMime(mime){return /^(application\/pdf|image\/(png|jpeg|webp|gif)|audio\/[\w.+-]+|video\/(mp4|webm))$/.test(mime);}
function sbDriveCatalog(){
 const items=[],settings=PropertiesService.getScriptProperties().getProperties();let scanned=0;
 function walk(folder,kind,path,depth){if(depth>6)throw Error('Use no more than six nested material folders.');
  const files=folder.getFiles();while(files.hasNext()){const f=files.next();if(++scanned>1000)throw Error('The materials folders exceed 1,000 files. Please organise a smaller active collection.');if(f.isTrashed()||!sbDriveMime(f.getMimeType()))continue;
   const title=sbDriveTitle(kind,path,f.getName(),f.getMimeType());if(!title)continue;
   items.push({id:'drive-folder:'+kind+':'+f.getId(),section:kind==='practice'?'exercises':'levels',title,url:'',enabled:settings['SB_DRIVE_DIM_'+kind+'_'+f.getId()]!=='true',driveFolder:kind,driveFileId:f.getId(),sourceName:f.getName(),mimeType:f.getMimeType(),size:f.getSize(),folderPath:path.join(' / ')});
  }
  const children=folder.getFolders();while(children.hasNext()){const child=children.next();if(!child.isTrashed())walk(child,kind,path.concat(child.getName()),depth+1);}
 }
 for(const [kind,id]of Object.entries(SB_DRIVE_ROOTS))walk(DriveApp.getFolderById(id),kind,[],0);
 return items.sort((a,b)=>a.title.localeCompare(b.title));
}
function sbDriveTitle(kind,path,name,mime){
 if(kind==='practice')return 'Level 1 — Practice — '+path.concat(name).join(' / ');
 const whole=path.concat(name).join(' / '),level=whole.match(/\blevel[\s_-]*(1[0-2]|[1-9])\b/i)?.[1];
 if(/instructor|different.learners/i.test(path.join(' / ')))return null;
 const folders={'english-momentum':/english.momentum/i,interview:/interview.preparation/i,ielts:/ielts/i,'business-writing':/business.writing|e.mail/i,kids:/kids/i,pronunciation:/pronunciation|intonation/i,meetings:/meetings|presentation|public.speaking/i,'write-boldly':/write.boldly/i,focus:/reclaim.*focus|focus.workshop/i};
 const group=Object.keys(folders).find(key=>folders[key].test(path.join(' / ')))||Object.keys(folders).find(key=>folders[key].test(name))||'general';
 // Unclassified general materials are not assigned to an arbitrary level.
 if(group==='general'&&!level)return null;
 const part=/^(audio|video)\//.test(mime)||/\baudio\b/i.test(whole)?'Audio':/activit|worksheet|practice/i.test(whole)?'Activity':'Main Book';
 return 'Level '+(group==='general'?level:1)+' — '+part+' — '+name+' [SB-folder:'+group+']';
}
function sbDriveKey(item){return item.driveFolder==='practice'?'exercises:1':'material:'+sbLearningItemLevel(item);}
function sbDriveFind(id,kind){
 if(!Object.prototype.hasOwnProperty.call(SB_DRIVE_ROOTS,kind)||! /^[\w-]{10,200}$/.test(id))throw Error('Unknown material.');
 const file=DriveApp.getFileById(id);if(file.isTrashed())throw Error('This material was removed.');
 const seen=new Set(),paths=[];
 function parents(node,path,depth){if(depth>6)return;const it=node.getParents();while(it.hasNext()){const f=it.next();if(f.isTrashed())continue;if(f.getId()===SB_DRIVE_ROOTS[kind]){paths.push(path);continue;}if(!seen.has(f.getId())){seen.add(f.getId());parents(f,[f.getName()].concat(path),depth+1);}}}
 parents(file,[],0);if(!paths.length)throw Error('This file is no longer inside the connected materials folder.');
 const title=sbDriveTitle(kind,paths[0],file.getName(),file.getMimeType());if(!title)throw Error('Place this library file inside its Level folder.');
 return {file,item:{driveFolder:kind,title,id:'drive-folder:'+kind+':'+id}};
}
function sbDriveRead(p){
 const match=String(p.itemId||'').match(/^drive-folder:(practice|library):([\w-]{10,200})$/);if(!match)throw Error('Unknown material.');
 const {file,item}=sbDriveFind(match[2],match[1]),key=sbDriveKey(item);
 if(!sbHubAllowed(key,(p.hubGrants||{})[key]))throw Error('Enter the current password before opening this file.');
 if(PropertiesService.getScriptProperties().getProperty('SB_DRIVE_DIM_'+match[1]+'_'+match[2])==='true')throw Error('This material is closed by your instructor.');
 const existing=sbPortalItems(sbExamBook()).find(x=>String(x.url||'').includes('/file/d/'+file.getId()+'/'));
 if(existing&&!existing.enabled)throw Error('This material is closed by your instructor.');
 const mime=file.getMimeType(),size=file.getSize();if(!sbDriveMime(mime))throw Error('Use a PDF, image, audio or MP4/WebM video.');
 if(!size||size>SB_DRIVE_MAX)throw Error('Inline files must be between 1 byte and 100 MB. Split larger videos into smaller clips.');
 const revision=file.getLastUpdated().getTime()+':'+size;
 if(p.revision&&p.revision!==revision)throw Error('This file changed while loading. Open it again.');
 const offset=p.offset===undefined?0:p.offset;if(!Number.isSafeInteger(offset)||offset<0||offset>=size||offset%SB_DRIVE_CHUNK!==0)throw Error('Invalid file position.');
 const end=Math.min(size-1,offset+SB_DRIVE_CHUNK-1),r=UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/'+encodeURIComponent(file.getId())+'?alt=media',{headers:{Authorization:'Bearer '+ScriptApp.getOAuthToken(),Range:'bytes='+offset+'-'+end},muteHttpExceptions:true});
 const code=r.getResponseCode();if(code!==206&&!(code===200&&offset===0&&size<=SB_DRIVE_CHUNK))throw Error('Drive could not read this part of the file. Try again later.');
 const bytes=r.getContent();if(bytes.length!==end-offset+1)throw Error('Incomplete file response. Please reopen the material.');
 return {ok:true,base64:Utilities.base64Encode(bytes),mimeType:mime,size,offset,nextOffset:end+1,done:end+1===size,revision};
}
