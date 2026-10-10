// Connection details stay in this owner's browser; never put the key in published code.
const CONNECTION_STORAGE_KEY = 'speak-boldly-client-sheet-connection-v1';
let endpoint = '', key = '';
export const clientSheetConnected = () => !!(endpoint && key);
export function clearClientSheet() {endpoint = '';key = '';}
export async function syncClientToSheet(client,fetcher = globalThis.fetch) {
 if (!clientSheetConnected()) throw new Error('Connect your client sheet first.');
 const controller = new AbortController(), timer = setTimeout(()=>controller.abort(),30000);
 try {
  const response = await fetcher(endpoint,{method:'POST',credentials:'omit',redirect:'follow',headers:{'Content-Type':'text/plain;charset=UTF-8'},body:JSON.stringify({action:'upsertClient',key,client}),signal:controller.signal});
  let result;
  try {result = await response.json();} catch {throw new Error('The client sheet could not be reached. Check its deployment.');}
  if (!response.ok || !result.ok || result.clientId !== client.id) throw new Error(result.error || 'The client was not saved to the sheet.');
  return result;
 } catch(error) {
  if(error.name === 'AbortError') throw new Error('Google Sheets took too long to respond. Retry syncing; existing rows will not be duplicated.');
  if(error instanceof TypeError) throw new Error('Could not reach Apps Script. Check that the deployed Web app has access set to Anyone and that this is the Clients deployment URL.');
  throw error;
 } finally {clearTimeout(timer);}
}
export function initializeClientSheet(doc) {
 const form = doc.querySelector('#client-sheet-connect');
 if (!form) return;
 const status = doc.querySelector('#client-sheet-status'), change = doc.querySelector('#client-sheet-change');
 const validUrl = url => /^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url);
 function restore() {
  try {
   const saved = JSON.parse(doc.defaultView.localStorage.getItem(CONNECTION_STORAGE_KEY)||'null');
   if(saved && validUrl(saved.endpoint) && typeof saved.key === 'string' && saved.key) {
    endpoint = saved.endpoint;key = saved.key;form.elements.endpoint.value = endpoint;
    form.hidden = true;if(change)change.hidden = false;
    status.textContent = 'Saved sheet connection loaded. Saving or syncing a student will check delivery.';
   }
  }catch{}
 }
 change?.addEventListener('click',()=>{form.hidden = false;form.elements.endpoint.value = endpoint||form.elements.endpoint.defaultValue;form.elements.key.value = '';form.elements.key.focus();});
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const url = form.elements.endpoint.value.trim(), secret = form.elements.key.value.trim();
  if (!validUrl(url) || !secret) {status.textContent = 'Enter your Apps Script web app URL and private connection key.';return;}
  endpoint = url;key = secret;form.elements.key.value = '';
  try {doc.defaultView.localStorage.setItem(CONNECTION_STORAGE_KEY,JSON.stringify({endpoint,key}));}
  catch {status.textContent = 'Your browser could not remember the connection. It will work only for this visit.';}
  form.hidden = true;if(change)change.hidden = false;
  doc.dispatchEvent(new doc.defaultView.Event('client-sheet-configured'));
 });
 return {restore,lock(){clearClientSheet();form.reset();form.hidden = false;if(change)change.hidden = true;status.textContent = '';}};
}
