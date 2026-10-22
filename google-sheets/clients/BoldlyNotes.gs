// Short public articles, managed only through the authenticated instructor routes.
function sbNotesSheet(){
 const book=SpreadsheetApp.openById(PropertiesService.getScriptProperties().getProperty('CLIENT_SHEET_ID'));
 let sheet=book.getSheetByName('Bold Blog');
 if(!sheet){sheet=book.insertSheet('Bold Blog');sheet.appendRow(['ID','Title','Topic','Publish date (Cairo)','Pages JSON','Published','Updated at']);}
 return sheet;
}
function sbNotesRows(){const sheet=sbNotesSheet();return {sheet,posts:sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,7).getValues().map((r,i)=>({row:i+2,id:String(r[0]),title:String(r[1]).replace(/^'/,''),topic:String(r[2]).replace(/^'/,''),date:String(r[3]).replace(/^'/,''),pages:JSON.parse(String(r[4])||'[]'),published:r[5]===true,updated:String(r[6])})):[]};}
function sbNotesVisible(post,today){return post.published&&post.date<=today;}
function sbNotesPublic(data){
 const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
 const posts=sbNotesRows().posts.filter(p=>sbNotesVisible(p,today)).sort((a,b)=>b.date.localeCompare(a.date)||b.updated.localeCompare(a.updated));
 if(data.id){const p=posts.find(p=>p.id===data.id);if(!p)throw Error('This note is not available.');return {ok:true,post:{id:p.id,title:p.title,topic:p.topic,date:p.date,pages:p.pages}};}
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
 const updated=new Date().toISOString(),safe=s=>/^[=+\-@]/.test(s)?"'"+s:s;
 store.sheet.getRange(existing?existing.row:store.sheet.getLastRow()+1,1,1,7).setValues([[id,safe(title),safe(topic),"'"+date,JSON.stringify(pages),data.published,updated]]);
 return {ok:true,post:{id,title,topic,date,pages,published:data.published,updated}};
 }finally{lock.releaseLock();}
}
