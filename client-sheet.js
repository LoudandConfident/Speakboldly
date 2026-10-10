// The private connection key is kept only in memory, never in published code or browser storage.
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
 form.addEventListener('submit',event=>{
  event.preventDefault();
  const url = form.elements.endpoint.value.trim(), secret = form.elements.key.value.trim();
  const status = doc.querySelector('#client-sheet-status');
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec$/.test(url) || !secret) {status.textContent = 'Enter your Apps Script web app URL and private connection key.';return;}
  endpoint = url;key = secret;form.elements.key.value = '';
  status.textContent = 'Connection details set for this visit. New and edited clients will be sent to your sheet when saved. The first save will verify the connection.';
 });
 return {lock(){clearClientSheet();form.reset();doc.querySelector('#client-sheet-status').textContent = '';}};
}
