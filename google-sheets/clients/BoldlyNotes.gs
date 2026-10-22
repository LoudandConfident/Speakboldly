// Short public articles, managed only through the authenticated instructor routes.
function sbNotesSheet(){
 const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID'));
 let sheet=book.getSheetByName('Bold Blog');
 if(!sheet){sheet=book.insertSheet('Bold Blog');sheet.appendRow(['ID','Title','Topic','Publish date (Cairo)','Pages JSON','Published','Updated at','Pictures JSON']);}
 return sheet;
}
function sbNotesRows(){const sheet=sbNotesSheet();return {sheet,posts:sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,8).getValues().map((r,i)=>({row:i+2,id:String(r[0]),title:String(r[1]).replace(/^'/,''),topic:String(r[2]).replace(/^'/,''),date:String(r[3]).replace(/^'/,''),pages:JSON.parse(String(r[4])||'[]'),published:r[5]===true,updated:String(r[6]),images:JSON.parse(String(r[7]||'[]'))})):[]};}
function sbNotesVisible(post,today){return post.published&&post.date<=today;}
function sbNotesPublic(data){
 const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
 const posts=sbNotesRows().posts.filter(p=>sbNotesVisible(p,today)).sort((a,b)=>b.date.localeCompare(a.date)||b.updated.localeCompare(a.updated));
 if(data.id){const p=posts.find(p=>p.id===data.id);if(!p)throw Error('This note is not available.');return {ok:true,post:{id:p.id,title:p.title,topic:p.topic,date:p.date,pages:p.pages,images:p.images}};}
 return {ok:true,posts:posts.map(p=>({id:p.id,title:p.title,topic:p.topic,date:p.date,pageCount:p.pages.length}))};
}
function sbNotesOwner(data){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
 const store=sbNotesRows();
 if(data.action==='listBoldlyNotes')return {ok:true,posts:store.posts.map(({row,...post})=>post).sort((a,b)=>b.updated.localeCompare(a.updated))};
 const text=(v,max,label)=>{if(typeof v!=='string'||!v.trim()||v.trim().length>max)throw Error('Check '+label+'.');return v.trim();};
 const title=text(data.title,140,'the title'),topic=text(data.topic,80,'the topic'),date=text(data.date,10,'the publish date');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date+'T00:00:00Z'))||new Date(date+'T00:00:00Z').toISOString().slice(0,10)!==date)throw Error('Choose a valid publish date.');
 if(!Array.isArray(data.pages)||data.pages.length<1||data.pages.length>5)throw Error('Each note needs 1–5 pages.');
 const pages=data.pages.map(p=>text(p,6000,'each page (up to 6,000 characters)'));
 if(typeof data.published!=='boolean')throw Error('Choose draft or published.');
 const id=data.id?text(data.id,80,'the note ID'):Utilities.getUuid();
 if(!/^[a-zA-Z0-9-]+$/.test(id))throw Error('Invalid note ID.');
 const existing=store.posts.find(p=>p.id===id);if(data.id&&!existing)throw Error('Refresh your notes before editing.');
 const images=sbNotesPictures(data,existing,id);
 const updated=new Date().toISOString(),safe=s=>/^[=+\-@]/.test(s)?"'"+s:s;
 store.sheet.getRange(existing?existing.row:store.sheet.getLastRow()+1,1,1,8).setValues([[id,safe(title),safe(topic),"'"+date,JSON.stringify(pages),data.published,updated,JSON.stringify(images)]]);
 return {ok:true,post:{id,title,topic,date,pages,images,published:data.published,updated}};
 }finally{lock.releaseLock();}
}

function sbNotesPictures(data,existing,id){
 const previous=existing?existing.images:[],keep=data.keepImages===undefined?previous:data.keepImages;
 if(!Array.isArray(keep)||keep.length>5||keep.some(image=>!image||!previous.some(old=>old.url===image.url)))throw Error('Refresh your saved pictures before editing.');
 const uploads=data.pictures||[];if(!Array.isArray(uploads)||keep.length+uploads.length>5)throw Error('Use up to five pictures per post.');
 let total=0;
 const files=uploads.map(picture=>{const mime=String(picture.mimeType||''),encoded=String(picture.base64||'');if(!['image/jpeg','image/png','image/webp'].includes(mime)||encoded.length>2800000||! /^[A-Za-z0-9+/]*={0,2}$/.test(encoded))throw Error('Use JPG, PNG or WebP pictures up to 2 MB each.');const bytes=Utilities.base64Decode(encoded);total+=bytes.length;if(!bytes.length||bytes.length>2000000||total>5000000)throw Error('Pictures must be up to 2 MB each, 5 MB total.');const h=bytes.slice(0,12).map(n=>n&255),valid=mime==='image/png'?h[0]===137&&h[1]===80&&h[2]===78&&h[3]===71:mime==='image/jpeg'?h[0]===255&&h[1]===216&&h[2]===255:String.fromCharCode(...h.slice(0,4))==='RIFF'&&String.fromCharCode(...h.slice(8,12))==='WEBP';if(!valid)throw Error('The file does not match its image format.');return {mime,bytes};});
 if(!files.length)return keep.map(image=>({url:image.url}));
 const props=PropertiesService.getScriptProperties();let folder;const folderId=props.getProperty('SB_BLOG_PICTURES_FOLDER');if(folderId)folder=DriveApp.getFolderById(folderId);else{folder=DriveApp.createFolder('Speak Boldly — Blog pictures');props.setProperty('SB_BLOG_PICTURES_FOLDER',folder.getId());}
 return keep.map(image=>({url:image.url})).concat(files.map((image,index)=>{const file=folder.createFile(Utilities.newBlob(image.bytes,image.mime,'blog-'+id+'-'+index+(image.mime==='image/png'?'.png':image.mime==='image/webp'?'.webp':'.jpg')));file.setSharing(DriveApp.Access.ANYONE_WITH_LINK,DriveApp.Permission.VIEW);return {url:'https://drive.google.com/thumbnail?id='+encodeURIComponent(file.getId())+'&sz=w1600'};}));
}
