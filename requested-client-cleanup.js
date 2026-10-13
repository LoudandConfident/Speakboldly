// One-time instructor-requested removals from this device's portal records.
// The instructor removes the matching rows from Google Sheets separately.
const KEY='speak-boldly-requested-removals-2026-10-13';
const NAMES=['mira nasser','mira louis','martina'];
const normalize=name=>String(name||'').normalize('NFKC').trim().replace(/\s+/gu,' ').toLowerCase();
export function removedPortalClientIds(storage){try{return new Set(Object.values(JSON.parse(storage.getItem(KEY)||'{}')));}catch{return new Set();}}
export function cleanupRequestedPortalClients(records,storage){
 let removed={};try{removed=JSON.parse(storage.getItem(KEY)||'{}');}catch{}
 for(const name of NAMES){if(removed[name])continue;const matches=records.filter(client=>normalize(client.name)===name);if(matches.length===1)removed[name]=matches[0].id;}
 const ids=new Set(Object.values(removed));
 try{storage.setItem(KEY,JSON.stringify(removed));const sessions=JSON.parse(storage.getItem('speak-boldly-admin-sessions-v1')||'[]');if(Array.isArray(sessions))storage.setItem('speak-boldly-admin-sessions-v1',JSON.stringify(sessions.filter(session=>!ids.has(session.clientId))));}catch{}
 return records.filter(client=>!ids.has(client.id));
}
