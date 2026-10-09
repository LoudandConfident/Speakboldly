// Bind this script to your private Google Sheet. Run setupResultsSheet once.
// Deploy as a web app: execute as yourself, access Anyone. Keep the spreadsheet private.
const TEST_VERSION = 'language-hub-50-v1';
const ANSWER_KEY = [2, 3, 3, 2, 2, 0, 3, 2, 1, 2, 0, 0, 2, 3, 1, 1, 3, 1, 0, 2, 3, 1, 1, 2, 2, 0, 1, 2, 3, 0, 3, 1, 0, 2, 1, 3, 2, 0, 3, 0, 1, 3, 2, 1, 3, 0, 1, 0, 2, 3];
const LEVELS = ['Below A1','A1–A2','A2–B1','B1–B2','B2–C1'];
function setupResultsSheet() {
 const ss=SpreadsheetApp.getActiveSpreadsheet();
 if(!ss)throw new Error('Run setup from a script opened through your Google Sheet.');
 PropertiesService.getScriptProperties().setProperty('RESULTS_SPREADSHEET_ID',ss.getId());
 let results=ss.getSheetByName('Results')||ss.insertSheet('Results');
 if(results.getLastRow()===0){results.appendRow(['Attempt ID','Test version','Submitted at (UTC)','Correct answers','Total questions','Percentage','Estimated level','Answered questions']);}
 results.setFrozenRows(1);results.getRange('A1:H1').setFontWeight('bold');
 let analysis=ss.getSheetByName('Analysis')||ss.insertSheet('Analysis');
 analysis.getRange('A1:B4').setValues([['Anonymous placement analysis','Value'],['Total attempts','=COUNTA(Results!A2:A)'],['Average correct answers','=IFERROR(AVERAGE(Results!D2:D),0)'],['Average percentage','=IFERROR(AVERAGE(Results!F2:F),0)']]);
 analysis.getRange('A6:C6').setValues([['Estimated level','Participants','Share']]);
 LEVELS.forEach((level,i)=>{const row=i+7;analysis.getRange(row,1).setValue(level);analysis.getRange(row,2).setFormula('=COUNTIF(Results!G2:G,A'+row+')');analysis.getRange(row,3).setFormula('=IFERROR(B'+row+'/$B$2,0)');});
 analysis.getRange('C7:C11').setNumberFormat('0.0%');analysis.getRange('B4').setNumberFormat('0.0"%"');
 analysis.getRange('A13').setValue('Provisional estimates for a shortened 50-question test. These are not certified CEFR levels.');
 analysis.getRange('A14').setValue('Only anonymous results are stored. No names, emails, or submitted answer choices are retained.');
 analysis.getRange('A1:C1').setFontWeight('bold');analysis.getRange('A6:C6').setFontWeight('bold');analysis.autoResizeColumns(1,3);
 if(analysis.getCharts().length===0)analysis.insertChart(analysis.newChart().setChartType(Charts.ChartType.PIE).addRange(analysis.getRange('A6:B11')).setPosition(16,1,0,0).setOption('title','Estimated level distribution').build());
}
function gradeAnswers(answers){
 if(!answers||typeof answers!=='object'||Array.isArray(answers))throw new Error('Invalid answers');
 const allowed=new Set(ANSWER_KEY.map((_,i)=>'q'+(i+1)));
 if(Object.keys(answers).some(k=>!allowed.has(k)))throw new Error('Unknown question');
 let score=0,answered=0;
 ANSWER_KEY.forEach((correct,i)=>{const v=answers['q'+(i+1)];if(v===undefined||v===null||v==='')return;if(!['string','number'].includes(typeof v)||!String(v).match(/^[0-3]$/))throw new Error('Invalid answer');answered++;if(Number(v)===correct)score++;});
 return {score:score,total:50,answered:answered,percentage:Math.round(score/50*100),level:score<10?LEVELS[0]:score<20?LEVELS[1]:score<30?LEVELS[2]:score<40?LEVELS[3]:LEVELS[4]};
}
function jsonResponse(value){return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);}
function doGet(){return jsonResponse({ok:true,version:TEST_VERSION,service:'Anonymous placement result collection'});}
function doPost(e){
 const lock=LockService.getScriptLock();
 try{
  if(!e||!e.postData||e.postData.contents.length>12000)throw new Error('Invalid request');
  const p=JSON.parse(e.postData.contents);
  if(p.version!==TEST_VERSION||p.consent!==true||typeof p.attemptId!=='string'||!p.attemptId.match(/^[a-zA-Z0-9-]{16,80}$/))throw new Error('Invalid submission');
  const grade=gradeAnswers(p.answers);
  const id=PropertiesService.getScriptProperties().getProperty('RESULTS_SPREADSHEET_ID');if(!id)throw new Error('Storage not configured');
  lock.waitLock(20000);
  const sheet=SpreadsheetApp.openById(id).getSheetByName('Results');if(!sheet)throw new Error('Storage not configured');
  const existing=sheet.getLastRow()>1?sheet.getRange(2,1,sheet.getLastRow()-1,1).createTextFinder(p.attemptId).matchEntireCell(true).findNext():null;
  if(existing){const row=sheet.getRange(existing.getRow(),1,1,8).getValues()[0];return jsonResponse({ok:true,attemptId:p.attemptId,result:{score:row[3],total:row[4],percentage:row[5],level:row[6],answered:row[7]}});}
  sheet.appendRow([p.attemptId,TEST_VERSION,new Date().toISOString(),grade.score,grade.total,grade.percentage,grade.level,grade.answered]);
  return jsonResponse({ok:true,attemptId:p.attemptId,result:grade});
 }catch(error){console.error(error.message);return jsonResponse({ok:false,error:'Unable to save this result. Please check the connection or retry.'});}
 finally{if(lock.hasLock())lock.releaseLock();}
}
