// Included in UnifiedCode.gs. All web actions require the private owner key.
const SB_BACKUP_TABLES={Clients:14,Sessions:15,TeacherDocuments:4,'Exam attempts':18,'Portal access':5,'Registration requests':16,'Calendar availability':3,EmailLog:7,DeletedClients:3};
function sbBuildOwnerBackup(book){
 const tables={};
 for(const name of Object.keys(SB_BACKUP_TABLES)){const sheet=book.getSheetByName(name);if(sheet)tables[name]=sheet.getLastRow()?sheet.getRange(1,1,sheet.getLastRow(),SB_BACKUP_TABLES[name]).getValues():[];}
 const props=PropertiesService.getScriptProperties(),settings={};
 // Explicit allowlist: never export connection keys, passwords or login tokens.
 if(typeof props.getProperties==='function')for(const [name,value]of Object.entries(props.getProperties()))if(/^SB_(CALENDAR_SLOTS_\d{4}-\d{2}-\d{2}|NATIVE_ENGLISH_\d{4}-\d{2}|LEARNING_LEVEL_ACCESS)$/.test(name))settings[name]=value;
 return {format:'speak-boldly-owner-backup',version:1,createdAt:new Date().toISOString(),timeZone:'Africa/Cairo',tables,settings,materialFiles:'Links only. Keep the original uploaded files in their existing storage.'};
}
function sbSaveOwnerBackup(){
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const props=PropertiesService.getScriptProperties();let folder,id=props.getProperty('SB_BACKUP_FOLDER_ID');
  if(id)folder=DriveApp.getFolderById(id);else{folder=DriveApp.createFolder('Speak Boldly — private backups');props.setProperty('SB_BACKUP_FOLDER_ID',folder.getId());}
  const backup=sbBuildOwnerBackup(sbExamBook()),name='Speak-Boldly-backup-'+Utilities.formatDate(new Date(),'Africa/Cairo','yyyy-MM-dd')+'.json',files=folder.getFilesByName(name);
  const content=JSON.stringify(backup);if(files.hasNext())files.next().setContent(content);else folder.createFile(name,content,'application/json');
  props.setProperty('SB_BACKUP_LAST_SUCCESS',backup.createdAt);
  return {ok:true,savedAt:backup.createdAt};
 }finally{lock.releaseLock();}
}
// Run once in the Apps Script editor after saving the complete script.
function setupDailyBackups(){
 sbSaveOwnerBackup();
 if(!ScriptApp.getProjectTriggers().some(trigger=>trigger.getHandlerFunction()==='runDailyBackup'))ScriptApp.newTrigger('runDailyBackup').timeBased().everyDays(1).atHour(4).inTimezone('Africa/Cairo').create();
 PropertiesService.getScriptProperties().setProperty('SB_BACKUP_DAILY_ENABLED','true');
}
function runDailyBackup(){return sbSaveOwnerBackup();}
function sbOwnerBackupAction(data,book){
 if(data.action==='exportOwnerBackup'){const lock=LockService.getScriptLock();lock.waitLock(20000);try{return sbExamResponse({ok:true,backup:sbBuildOwnerBackup(book)});}finally{lock.releaseLock();}}
 if(data.action==='saveOwnerBackup')return sbExamResponse(sbSaveOwnerBackup());
 throw new Error('Invalid backup action.');
}
