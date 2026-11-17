import {clientSheetConnected,sheetLibraryRequest} from './client-sheet.js?v=domain-email-routing';
import {cairoDayNumber,clientDailyMotivation,dailyQuotes,quoteDetails,dailyPractice,motivationEntryId} from './home-gallery.js?v=motivation-control-85';
import {setMotivationSettings,motivationSettings,motivationIsFrozen} from './motivation-settings.js';

export function initializeMotivationFreeze(doc,isUnlocked){
 const win=doc.defaultView,root=doc.createElement('details');root.id='motivation-freeze-editor';root.className='admin-detail';
 root.innerHTML='<summary>Motivation</summary><div class="motivation-freeze-body"><p class="motivation-current"><strong>On the website:</strong> <span data-current></span></p><p data-state></p><label class="motivation-selection" for="motivation-selection">Choose a motivation<select id="motivation-selection"></select></label><div class="motivation-control-preview"><img alt=""><div><h4></h4><div class="motivation-preview-copy"></div></div></div><p class="motivation-control-hint">Preview a message, then choose how long to show it. This choice also applies when you send motivation emails.</p><div class="detail-actions"><button type="button" class="button small" data-freeze="week">Use this week</button><button type="button" class="button light small" data-freeze="hold">Freeze until I resume</button><button type="button" class="button light small" data-freeze="resume">Resume weekly changes</button><button type="button" class="button light small" data-freeze="reload">Reload settings</button></div><p role="status" aria-live="polite"></p></div>';
 doc.querySelector('#admin-dashboard').append(root);
 const status=root.querySelector('[role=status]'),buttons=[...root.querySelectorAll('[data-freeze]')],select=root.querySelector('select'),preview=root.querySelector('.motivation-control-preview');
 let generation=0,revision='0',busy=false,loaded=false;
 const setBusy=value=>{busy=value;select.disabled=value||!loaded;buttons.forEach(b=>b.disabled=value||(b.dataset.freeze!=='reload'&&!loaded));};
 function previewSelection(){
  const index=dailyQuotes.findIndex(entry=>motivationEntryId(entry)===select.value),current=clientDailyMotivation(new win.Date());
  const entry=index>=0?dailyQuotes[index]:current,details=index>=0?quoteDetails[index]:null;
  preview.querySelector('img').src=entry.image;preview.querySelector('img').alt=entry.alt||entry.quote;
  preview.querySelector('h4').textContent=entry.quote;
  preview.querySelector('.motivation-preview-copy').replaceChildren(...(details?(details.paragraphs||[details.reflection,dailyPractice[index]]):current.paragraphs).filter(Boolean).map(text=>{const p=doc.createElement('p');p.textContent=text;return p;}));
 }
 function paint(){
  const s=motivationSettings(),now=new win.Date(),current=clientDailyMotivation(now);
  root.querySelector('[data-current]').textContent=current.quote;
  root.querySelector('[data-state]').textContent=motivationIsFrozen(now,cairoDayNumber)?(s.until?'Frozen until Monday, '+new win.Date(s.until+'T12:00Z').toLocaleDateString('en-GB',{timeZone:'Africa/Cairo'})+'.':'Frozen until you resume weekly changes.'):'Automatic weekly changes are on.';
  select.replaceChildren();const currentOption=doc.createElement('option');currentOption.value='';currentOption.textContent='Keep the current message';select.append(currentOption);
  dailyQuotes.forEach(entry=>{const option=doc.createElement('option');option.value=motivationEntryId(entry);option.textContent=entry.quote;select.append(option);});
  const currentId=motivationEntryId(current);select.value=dailyQuotes.some(entry=>motivationEntryId(entry)===currentId)?currentId:'';previewSelection();
 }
 async function run(mode){
  if(!isUnlocked()||busy)return;
  if(!clientSheetConnected()){status.textContent='Connect your Clients sheet to control motivation across devices.';return;}
  const ticket=generation;setBusy(true);status.textContent=mode==='reload'?'Loading…':'Saving…';
  try{
   const r=await sheetLibraryRequest(mode==='reload'?'dailyMotivationOwnerSettings':'saveDailyMotivationSettings',mode==='reload'?{}:{revision,mode,day:cairoDayNumber(new win.Date()),selection:select.value});
   if(ticket!==generation||!isUnlocked())return;
   if(r.capabilities?.motivationSelection!==1)throw Error('Deploy the updated combined Apps Script as a New version to activate message selection.');
   if(mode!=='reload'&&mode!=='resume'&&select.value&&r.settings?.selection!==select.value)throw Error('The selected message could not be confirmed. Reload settings before trying again.');
   revision=r.settings.revision;loaded=true;setMotivationSettings(r.settings);paint();
   status.textContent=mode==='reload'?'':mode==='resume'?'Weekly changes resumed.':mode==='week'?'Saved. This message will stay until next Monday.':'Frozen. This message will stay until you resume.';
   doc.dispatchEvent(new win.Event('daily-motivation-settings-changed'));
  }catch(e){if(ticket===generation)status.textContent=/Invalid action|Not authorized/.test(e.message)?'Deploy the updated combined Apps Script as a New version to activate these controls.':e.message;}
  finally{if(ticket===generation)setBusy(false);}
 }
 select.onchange=previewSelection;buttons.forEach(b=>b.onclick=()=>run(b.dataset.freeze));
 root.addEventListener('toggle',()=>{if(root.open)void run('reload');});doc.addEventListener('client-sheet-configured',()=>{if(root.open)void run('reload');});
 doc.addEventListener('daily-motivation-settings-changed',()=>{if(!busy)paint();});paint();setBusy(false);
 return {lock(){generation++;revision='0';loaded=false;setBusy(false);root.open=false;status.textContent='';}};
}
