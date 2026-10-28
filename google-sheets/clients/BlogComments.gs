// ADD as a separate BlogComments.gs file. Keep Code.gs and other feature files.
const SB_BLOG_COMMENT_HEADERS=['ID','Post ID','Thread ID','Reply to ID','Display name','Comment','Created at (UTC)','Author hash','Status','Coach','Request ID','Fingerprint'];
const SB_BLOG_COMMENT_ACTIONS=['blogComments','blogCommentReplies','blogCommentPost','blogCommentDelete','blogCommentsManage','blogCommentsSetEnabled'];
function setupBlogComments(){
 const book=sbExamBook();let sheet=book.getSheetByName('Blog comments');if(!sheet)sheet=book.insertSheet('Blog comments');if(!sheet.getLastRow()){sheet.appendRow(SB_BLOG_COMMENT_HEADERS);sheet.setFrozenRows(1);}else if(JSON.stringify(sheet.getRange(1,1,1,12).getValues()[0])!==JSON.stringify(SB_BLOG_COMMENT_HEADERS))throw Error('Blog comment headers differ. Existing rows were not changed.');
 const props=PropertiesService.getScriptProperties();if(props.getProperty('SB_BLOG_COMMENTS_READY')!=='true')props.setProperty('SB_BLOG_COMMENTS_ENABLED','true');props.setProperty('SB_BLOG_COMMENTS_READY','true');console.log('Blog comments ready. Add the small router block inside the existing doPost and deploy a New version. No emails sent; client, calendar, exam and report data were not changed.');
}
function sbBlogCommentsHandleEvent(event){
 let p;try{p=JSON.parse(event?.postData?.contents||'null');}catch{return null;}if(!p||!SB_BLOG_COMMENT_ACTIONS.includes(p.action))return null;
 const json=x=>ContentService.createTextOutput(JSON.stringify(x)).setMimeType(ContentService.MimeType.JSON),lock=LockService.getScriptLock();
 try{
  if(event.postData.contents.length>12000)throw Error('Your comment is too long.');
  const owner=['blogCommentsManage','blogCommentsSetEnabled'].includes(p.action)||Boolean(p.coach);if(owner)sbRequireClientConnection(p);
  const props=PropertiesService.getScriptProperties(),ready=props.getProperty('SB_BLOG_COMMENTS_READY')==='true',enabled=props.getProperty('SB_BLOG_COMMENTS_ENABLED')==='true';
  if(!ready){if(p.action==='blogComments')return json({ok:true,ready:false,enabled:false,threads:[],commentCount:0});throw Error('The coach needs to run setupBlogComments and deploy the new version.');}
  const sheet=sbExamBook().getSheetByName('Blog comments');if(!sheet)throw Error('The Blog comments sheet is missing. Contact your coach.');
  if(p.action==='blogCommentsManage'){const rows=sbBlogCommentRows(sheet);return json({ok:true,enabled,items:rows.filter(x=>!x.deleted).slice(-100).reverse().map(sbBlogCommentPublic)});}
  if(p.action==='blogCommentsSetEnabled'){if(typeof p.enabled!=='boolean')throw Error('Choose whether comments are open.');props.setProperty('SB_BLOG_COMMENTS_ENABLED',String(p.enabled));return json({ok:true,enabled:p.enabled});}
  const postId=String(p.postId||'');if(p.action==='blogCommentDelete'){if(!/^[a-zA-Z0-9_-]{1,100}$/.test(postId))throw Error('Unknown blog post.');}else sbBlogCommentPostExists(postId);
  if(p.action==='blogComments'||p.action==='blogCommentReplies'){
   const before=p.before===undefined?Infinity:Number(p.before);if(before!==Infinity&&(!Number.isSafeInteger(before)||before<1))throw Error('Invalid conversation page.');
   const revision=props.getProperty('SB_BLOG_COMMENTS_REV')||'0',cache=CacheService.getScriptCache(),cacheKey='blog-comments-anonymous-v1:'+sbExamHash(JSON.stringify([postId,p.action,p.rootId||'',before===Infinity?'latest':before,revision]));
   let cached=null;try{cached=cache.get(cacheKey);}catch{}if(cached)return json({...JSON.parse(cached),enabled});
   const rows=sbBlogCommentRows(sheet).filter(x=>x.postId===postId);let result;
   if(p.action==='blogCommentReplies'){const root=rows.find(x=>x.id===p.rootId&&!x.rootId);if(!root)throw Error('This conversation could not be found.');const all=rows.filter(x=>x.rootId===root.id&&!x.deleted&&x.seq<before).sort((a,b)=>b.seq-a.seq),items=all.slice(0,10).reverse();result={ok:true,ready:true,root:sbBlogCommentPublic(root),items:items.map(sbBlogCommentPublic),more:all.length>10,nextBefore:items[0]?.seq||null};}
   else{const threads=sbBlogCommentThreads(rows).filter(x=>x.activity<before).sort((a,b)=>b.activity-a.activity);result={ok:true,ready:true,threads:threads.slice(0,10),nextBefore:threads.length>10?threads[9].activity:null,commentCount:rows.filter(x=>!x.deleted).length};}
   const encoded=JSON.stringify(result);try{if(encoded.length<45000)cache.put(cacheKey,encoded,45);}catch{}return json({...result,enabled});
  }
  lock.waitLock(20000);const rows=sbBlogCommentRows(sheet);
  if(p.action==='blogCommentDelete'){
   const item=rows.find(x=>x.id===String(p.id||'')&&x.postId===postId);if(!item)throw Error('This comment could not be found.');
   if(!owner&&item.authorHash!==sbBlogCommentAuthor(p.authorToken))throw Error('You can remove only comments made from this browser.');
   if(!item.deleted)sheet.getRange(item.row,5,1,5).setValues([['','',item.createdAt,item.authorHash,'deleted']]);
   props.setProperty('SB_BLOG_COMMENTS_REV',Utilities.getUuid());return json({ok:true,id:item.id});
  }
  if(!enabled&&!owner)throw Error('New comments are paused. You can still read the conversation.');
  const requestId=String(p.requestId||''),name=owner?'Speak Boldly coach':sbBlogCommentNickname(sbBlogCommentAuthor(p.authorToken)),body=String(p.body||'').trim(),replyToId=String(p.replyToId||''),authorHash=owner?'coach':sbBlogCommentAuthor(p.authorToken);
  if(p.website||! /^[a-zA-Z0-9-]{16,100}$/.test(requestId)||name.length>60||/[\r\n]/.test(name)||!body||body.length>1500||(body.match(/https?:\/\//gi)||[]).length>2)throw Error('Use up to 60 characters for a name, 1,500 for a comment and no more than two links.');
  const fingerprint=sbExamHash(JSON.stringify([postId,replyToId,name,body,authorHash,owner]));const existing=rows.find(x=>x.requestId===requestId);
  if(existing){if(existing.fingerprint!==fingerprint)throw Error('This comment changed. Please try a new comment.');if(existing.deleted)throw Error('This comment was removed.');return json({ok:true,comment:sbBlogCommentPublic(existing),thread:sbBlogCommentThreads(rows.filter(x=>x.postId===postId)).find(x=>x.root.id===(existing.rootId||existing.id))});}
  let rootId='';if(replyToId){const parent=rows.find(x=>x.id===replyToId&&x.postId===postId&&!x.deleted);if(!parent)throw Error('That comment was removed. Choose another comment to reply to.');rootId=parent.rootId||parent.id;}
  const now=Date.now(),today=Utilities.formatDate(new Date(now),'Africa/Cairo','yyyy-MM-dd'),daily=rows.filter(x=>Utilities.formatDate(new Date(x.createdAt),'Africa/Cairo','yyyy-MM-dd')===today);
  if(!owner&&(daily.filter(x=>!x.coach).length>=200||daily.filter(x=>x.authorHash===authorHash).length>=50||rows.filter(x=>x.authorHash===authorHash&&Date.parse(x.createdAt)>now-300000).length>=8))throw Error('Give the conversation a little breathing room. Please try again later.');
  if(rows.length>=4000)throw Error('Comments are full for now. Your coach needs to archive older conversations.');
  const id=Utilities.getUuid(),createdAt=new Date(now).toISOString(),safe=v=>/^[=+\-@\t\r]/.test(v)?"'"+v:v,row=sheet.getLastRow()+1;
  sheet.getRange(row,1,1,12).setValues([[id,postId,rootId,replyToId,safe(name),safe(body),createdAt,authorHash,'published',owner,requestId,fingerprint]]);
  props.setProperty('SB_BLOG_COMMENTS_REV',Utilities.getUuid());const comment={id,postId,rootId,replyToId,name,body,createdAt,authorHash,deleted:false,coach:owner,requestId,fingerprint,seq:row,row};rows.push(comment);
  return json({ok:true,comment:sbBlogCommentPublic(comment),thread:sbBlogCommentThreads(rows.filter(x=>x.postId===postId)).find(x=>x.root.id===(rootId||id))});
 }catch(error){return json({ok:false,error:String(error.message||error)});}finally{if(lock.hasLock())lock.releaseLock();}
}
function sbBlogCommentAuthor(value){if(typeof value!=='string'||! /^[a-zA-Z0-9-]{64,160}$/.test(value))throw Error('Reload the page before commenting.');return sbExamHash(value);}
function sbBlogCommentPostExists(id){
 if(!/^[a-zA-Z0-9_-]{1,100}$/.test(id))throw Error('Unknown blog post.');const today=Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd');
 if(id==='your-english-is-not-your-worth'&&today>='2026-10-27')return;
 const sheet=sbExamBook().getSheetByName('Bold Blog');if(sheet&&sheet.getLastRow()>1&&sheet.getRange(2,1,sheet.getLastRow()-1,8).getValues().some(r=>String(r[0])===id&&r[5]===true&&String(r[3]).replace(/^'/,'')<=today))return;
 throw Error('This blog post is not published.');
}
function sbBlogCommentRows(sheet){const plain=v=>String(v||'').replace(/^'(?=[=+\-@\t\r])/,'');return sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,12).getValues().map((r,i)=>({id:String(r[0]),postId:String(r[1]),rootId:String(r[2]),replyToId:String(r[3]),name:plain(r[4]),body:plain(r[5]),createdAt:String(r[6]),authorHash:String(r[7]),deleted:String(r[8])==='deleted',coach:r[9]===true,requestId:String(r[10]),fingerprint:String(r[11]),seq:i+2,row:i+2})):[];}
function sbBlogCommentPublic(item){return{id:item.id,postId:item.postId,rootId:item.rootId,replyToId:item.replyToId,name:item.deleted?'':item.coach?'Speak Boldly coach':sbBlogCommentNickname(item.authorHash),body:item.deleted?'':item.body,createdAt:item.createdAt,deleted:item.deleted,coach:!item.deleted&&item.coach,seq:item.seq};}
function sbBlogCommentThreads(rows){
 const groups=new Map();for(const item of rows)if(item.rootId&&!item.deleted){if(!groups.has(item.rootId))groups.set(item.rootId,[]);groups.get(item.rootId).push(item);}
 return rows.filter(x=>!x.rootId).map(root=>{const replies=(groups.get(root.id)||[]).sort((a,b)=>a.seq-b.seq);return{root:sbBlogCommentPublic(root),replies:replies.slice(-3).map(sbBlogCommentPublic),replyCount:replies.length,moreReplies:replies.length>3,replyBefore:replies.slice(-3)[0]?.seq||null,activity:Math.max(root.seq,...replies.map(x=>x.seq))};}).filter(x=>!x.root.deleted||x.replyCount);
}

function sbBlogCommentNickname(hash){const adjectives=["Bold","Curious","Sunny","Brave","Clever","Cheerful","Dreamy","Friendly","Gentle","Happy","Jolly","Kind","Lively","Lucky","Merry","Playful","Thoughtful","Witty","Wondering","Daring","Bubbly","Cosy","Dancing","Fearless","Giggly","Hopeful","Joyful","Mighty","Peaceful","Sparkling","Spirited","Whimsical"],animals=["Lion","Panda","Otter","Penguin","Owl","Fox","Dolphin","Koala","Tiger","Rabbit","Falcon","Turtle","Badger","Bear","Butterfly","Cat","Deer","Elephant","Flamingo","Giraffe","Hedgehog","Lemur","Lynx","Meerkat","Narwhal","Parrot","Peacock","Puffin","Raccoon","Robin","Seal","Squirrel"];let value=2166136261;for(let i=0;i<hash.length;i++)value=Math.imul(value^hash.charCodeAt(i),16777619)>>>0;return adjectives[value%adjectives.length]+' '+animals[Math.floor(value/adjectives.length)%animals.length];}
