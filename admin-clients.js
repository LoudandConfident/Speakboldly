export const CLIENT_LEVELS=[...Array.from({length:12},(_,i)=>String(i+1)),'E-mail and business writing','Public speaking','Interview training','IELTS'];
const LEGACY_CLIENT_LEVELS=['Not assessed','A1','A2','B1','B2','C1','C2'];
export const PAYMENT_STATUSES=['Unpaid','Part paid','Paid'];
export function validateClient(input,clients=[],editingId=null,{allowLegacy=false}={}){
 const name=String(input.name||'').trim(),email=String(input.email||'').trim().toLowerCase();
 const level=String(input.level||''),payment=String(input.payment||'');
 const code=String(input.code||'').trim();
 if(!(allowLegacy&&!code)&&!/^\d{4}$/.test(code))throw new Error('Choose a 4-digit Student Code.');
 if(code==='1962'&&!allowLegacy)throw new Error('1962 is reserved for full portal access. Choose another client code.');
 if(code&&clients.some(c=>c.id!==editingId&&c.code===code))throw new Error('That Student Code is already assigned. Choose a different code.');
 const permissions=Array.isArray(input.permissions)?[...new Set(input.permissions.filter(p=>typeof p==='string'&&(p.startsWith('section:')||p.startsWith('file:'))))]:[];
 if(!name||name.length>100)throw new Error('Enter a client name (up to 100 characters).');
 const normalizedName=value=>String(value||'').normalize('NFKC').trim().replace(/\s+/gu,' ').toLocaleLowerCase();
 if(!allowLegacy&&clients.some(c=>c.id!==editingId&&normalizedName(c.name)===normalizedName(name)))throw new Error('This client name is already registered. Edit that client instead.');
 if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');
 if(clients.some(c=>c.id!==editingId&&c.email.toLowerCase()===email))throw new Error('This email already belongs to a client. Edit that client instead.');
 if(!(CLIENT_LEVELS.includes(level)||/^[1-9]\d{0,3}$/.test(level)||((allowLegacy||editingId)&&LEGACY_CLIENT_LEVELS.includes(level)))||!PAYMENT_STATUSES.includes(payment))throw new Error('Choose a valid level and payment status.');
 const hours=Number(input.hours);if(input.hours===''||!Number.isFinite(hours)||hours<0||hours>100000||Math.abs(hours*100-Math.round(hours*100))>0.000001)throw new Error('Enter hours from 0 to 100000, with up to two decimal places.');
 const amountPaid=Number(input.amountPaid??0);if(input.amountPaid===''||!Number.isFinite(amountPaid)||amountPaid<0||amountPaid>100000000||Math.abs(amountPaid*100-Math.round(amountPaid*100))>0.000001)throw new Error('Enter an amount paid from 0 to 100000000, with up to two decimal places.');
 return{name,email,level,payment,amountPaid,hours,code,permissions};
}
export function clientTotals(clients){return{clients:clients.length,hours:Math.round(clients.reduce((sum,c)=>sum+c.hours,0)*100)/100};}
export function removeBrowserClient(storage,id) {
 const clientKey='speak-boldly-admin-clients-v1',sessionKey='speak-boldly-admin-sessions-v1';
 const oldClients=storage.getItem(clientKey),oldSessions=storage.getItem(sessionKey);
 const clients=JSON.parse(oldClients||'[]'),sessions=JSON.parse(oldSessions||'[]');
 if(!Array.isArray(clients)||!Array.isArray(sessions))throw new Error('Saved records could not be read. Nothing was deleted.');
 try {
  storage.setItem(sessionKey,JSON.stringify(sessions.filter(session=>session.clientId!==id)));
  storage.setItem(clientKey,JSON.stringify(clients.filter(client=>client.id!==id)));
 }catch(error){
  try{if(oldSessions===null)storage.removeItem(sessionKey);else storage.setItem(sessionKey,oldSessions);}catch{}
  throw new Error('Browser storage could not be updated. The client was not deleted.');
 }
}
