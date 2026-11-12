// Additive homepage theme settings. Existing login, sheets, calendar and mail stay intact.
function sbHomepageThemesEvent(event){
 let data;try{data=JSON.parse(event?.postData?.contents||'null');}catch{return null;}
 if(!data||!['homepageThemes','homepageThemesEdit','homepageThemesSave'].includes(data.action))return null;
 const json=value=>ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
 try{
  if(event.postData.contents.length>16000)throw Error('Theme settings are too long.');
  const props=PropertiesService.getScriptProperties(),read=()=>JSON.parse(props.getProperty('SB_HOMEPAGE_THEMES_V1')||'{"revision":"0","mode":"automatic","schedule":[]}');
  if(data.action==='homepageThemes')return json({ok:true,settings:read()});
  if(typeof sbInstructorRepairEvent==='function'){const result=sbInstructorRepairEvent(event);if(result!==null)return result;data=JSON.parse(event.postData.contents);}
  if(typeof sbRequireClientConnection!=='function')throw Error('Keep your existing Clients script.');
  sbRequireClientConnection(data);
  const lock=LockService.getScriptLock();lock.waitLock(10000);
  try{
   const current=read();if(data.action==='homepageThemesEdit')return json({ok:true,settings:current});
   if(!['automatic','off'].includes(data.mode))throw Error('Choose automatic themes or turn them off.');
   const schedule=sbValidateHomepageSchedule(data.schedule);
   if(String(data.revision)!==String(current.revision))throw Error('Themes changed on another device. Reload before publishing.');
   const settings={revision:Utilities.getUuid(),mode:data.mode,schedule};
   if(JSON.stringify(settings).length>8500)throw Error('Shorten your theme messages.');
   props.setProperty('SB_HOMEPAGE_THEMES_V1',JSON.stringify(settings));return json({ok:true,settings});
  }finally{lock.releaseLock();}
 }catch(error){return json({ok:false,error:String(error.message||error)});}
}

const SB_HOMEPAGE_ARTS=['thanksgiving','christmas','new-year','winter','valentine','mothers','april-fools','spring','summer','autumn'];
function sbValidateHomepageSchedule(input){
 if(!Array.isArray(input)||input.length<1||input.length>24)throw Error('Use 1–24 seasonal themes.');
 const used=new Set();return input.map((x,i)=>{if(!x||!SB_HOMEPAGE_ARTS.includes(x.art))throw Error('Choose an illustration for each theme.');
 const row={id:'theme-'+i};for(const key of ['start','end']){if(!/^\d{2}-\d{2}$/.test(x[key]||''))throw Error('Use MM-DD dates.');const d=new Date('2028-'+x[key]+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(5,10)!==x[key])throw Error('Check your dates.');row[key]=x[key];}
 for(const[key,max]of[['label',55],['message',100]]){if(typeof x[key]!=='string'||!x[key].trim()||x[key].trim().length>max)throw Error('Keep titles within 55 characters and messages within 100.');row[key]=x[key].trim();}row.art=x.art;
 for(let d=new Date('2028-01-01T12:00:00Z');d.getUTCFullYear()===2028;d.setUTCDate(d.getUTCDate()+1)){const md=d.toISOString().slice(5,10);if(row.start<=row.end?md>=row.start&&md<=row.end:md>=row.start||md<=row.end){if(used.has(md))throw Error('Theme dates overlap. Give each date one theme.');used.add(md);}}return row;});
}
