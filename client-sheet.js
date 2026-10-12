// Connection details stay in this owner's browser; never put the key in published code.
import {validateClient} from './admin-clients.js?v=four-digit-restored';
const CONNECTION_STORAGE_KEY = 'speak-boldly-client-sheet-connection-v1';
let endpoint = '', key = '';
export const clientSheetConnected = () => !!(endpoint && key);
export function clearClientSheet() {endpoint = '';key = '';}
async function sheetRequest(url,secret,payload,fetcher = globalThis.fetch) {
 const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),30000);
 try {
  const response = await fetcher(url,{method:'POST',credentials:'omit',redirect:'follow',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({...payload,key:secret}),signal:controller.signal});
  let result;
  try {result = await response.json();} catch {throw new Error('The client sheet could not be reached. Check its deployment.');}
  if (!response.ok || !result.ok) throw new Error(result.error || 'The client sheet request failed.');
  return result;
 } catch(error) {
  if(error.name === 'AbortError') throw new Error('Google Sheets took too long to respond. Retry syncing; existing rows will not be duplicated.');
  if(error instanceof TypeError) throw new Error('Could not reach Apps Script. Check that the deployed Web app has access set to Anyone and that this is the Clients deployment URL.');
  throw error;
 } finally {clearTimeout(timer);}
}
export async function syncClientToSheet(client,fetcher = globalThis.fetch) {
 if (!clientSheetConnected()) throw new Error('Connect your client sheet first.');
 const result = await sheetRequest(endpoint,key,{action:'upsertClient',client},fetcher);
 if(result.clientId !== client.id) throw new Error('The client was not saved to the sheet.');
 return result;
}

export async function loadClientsFromSheet(fetcher = globalThis.fetch) {
 if (!clientSheetConnected()) throw new Error('Connect your client sheet on this device first.');
 const result = await sheetRequest(endpoint,key,{action:'listClients'},fetcher);
 if (!Array.isArray(result.clients)) throw new Error('Update your Clients Apps Script deployment to support loading students.');
 const records=[];
 for(const entry of result.clients){
  if(!entry || typeof entry.id!=='string' || !/^[a-zA-Z0-9-]{1,100}$/.test(entry.id) || records.some(c=>c.id===entry.id)) throw new Error('The sheet contains an invalid or duplicate Client ID.');
  records.push({id:entry.id,...validateClient(entry,records,entry.id,{allowLegacy:true})});
 }
 return records;
}
export function mergeSheetClients(local,remote) {
 // Sheet values take precedence; retain browser records that have never been synced.
 const ids=new Set(remote.map(c=>c.id)),emails=new Set(remote.map(c=>c.email.toLowerCase()));
 return [...remote,...local.filter(c=>!ids.has(c.id)&&!emails.has(c.email.toLowerCase()))];
}

export function initializeClientSheet(doc) {
 const form = doc.querySelector('#client-sheet-connect');
 if (!form) return;
 const status = doc.querySelector('#client-sheet-status'), change = doc.querySelector('#client-sheet-change');
 const validUrl = url => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url);
 function restore() {
  try {
   const saved = JSON.parse(doc.defaultView.localStorage.getItem(CONNECTION_STORAGE_KEY)||'null');
   if(saved && saved.endpoint !== form.elements.endpoint.defaultValue) {
    clearClientSheet();doc.defaultView.localStorage.removeItem(CONNECTION_STORAGE_KEY);
    form.elements.endpoint.value = form.elements.endpoint.defaultValue;form.hidden = false;
    status.textContent = 'New Clients sheet ready. Enter its private connection key to connect.';return;
   }
   if(saved && validUrl(saved.endpoint) && typeof saved.key === 'string' && saved.key) {
    endpoint = saved.endpoint;key = saved.key;form.elements.endpoint.value = endpoint;
    form.hidden = true;if(change)change.hidden = false;
    status.textContent = 'Saved sheet connection loaded.';
   }
  }catch{}
 }
 change?.addEventListener('click',()=>{form.hidden = false;form.elements.endpoint.value = endpoint||form.elements.endpoint.defaultValue;form.elements.key.value = '';form.elements.key.focus();});
 form.addEventListener('submit',async event=>{
  event.preventDefault();
  const url = form.elements.endpoint.value.trim(), secret = form.elements.key.value.trim();
  if (!validUrl(url) || !secret) {status.textContent = 'Enter your Apps Script web app URL and private connection key.';return;}
  const button = form.querySelector('[type=submit]');button.disabled = true;
  status.textContent = 'Checking your sheet connection…';
  try {
   const result = await sheetRequest(url,secret,{action:'checkConnection'});
   if(result.connected !== true) throw new Error('The Clients sheet did not confirm the connection.');
  } catch(error) {status.textContent = error.message;return;}
  finally {button.disabled = false;}
  endpoint = url;key = secret;form.elements.key.value = '';
  status.textContent = 'Sheet connected. Loading students…';
  try {doc.defaultView.localStorage.setItem(CONNECTION_STORAGE_KEY,JSON.stringify({endpoint,key}));}
  catch {status.textContent = 'Your browser could not remember the connection. It will work only for this visit.';}
  form.hidden = true;if(change)change.hidden = false;
  doc.dispatchEvent(new doc.defaultView.Event('client-sheet-configured'));
 });
 return {restore,lock(){clearClientSheet();form.reset();form.hidden = false;if(change)change.hidden = true;status.textContent = '';}};
}

export async function loadSheetSessions(fetcher=globalThis.fetch){if(!clientSheetConnected())throw new Error('Connect your client sheet first.');return sheetRequest(endpoint,key,{action:'listSessions'},fetcher);}
export async function saveSheetSession(session,fetcher=globalThis.fetch,options={}){if(!clientSheetConnected())throw new Error('Connect your client sheet first.');return sheetRequest(endpoint,key,{action:'saveSession',session,importPast:options.importPast===true},fetcher);}
export async function cancelSheetSession(sessionId,fetcher=globalThis.fetch){if(!clientSheetConnected())throw new Error('Connect your client sheet first.');return sheetRequest(endpoint,key,{action:'cancelSession',sessionId},fetcher);}

export async function loadSheetTeacherDocuments(fetcher=globalThis.fetch){if(!clientSheetConnected())throw new Error('Connect your client sheet first.');return sheetRequest(endpoint,key,{action:'listTeacherDocuments'},fetcher);}
export async function saveSheetTeacherDocument(record,expectedVersion=0,fetcher=globalThis.fetch){if(!clientSheetConnected())throw new Error('Connect your client sheet first.');return sheetRequest(endpoint,key,{action:'saveTeacherDocument',record,expectedVersion},fetcher);}
