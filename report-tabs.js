const TYPES=new Set(['progress','final','registration','notes','actionplan']);
export const REPORT_TAB_PREFIX='speak-boldly-report-tab-';
export function openClientReportTab(win,type,client,endpointDefault=''){
 if(!TYPES.has(type)||!client?.id)throw new Error('Choose a client and report first.');
 const token=win.crypto.randomUUID(),key=REPORT_TAB_PREFIX+token;
 const appMode=new URL(win.location.href).pathname.endsWith('/instructor.html');
 const payload={type,returnUrl:win.location.href,client:{id:client.id,name:client.name,email:client.email},endpointDefault,createdAt:Date.now()};
 if(appMode)payload.appMode=true;
 win.sessionStorage.setItem(key,JSON.stringify(payload));
 const url=new URL('./report-editor.html',win.document?.baseURI||win.location.origin||win.location.href);url.hash=token;
 if(appMode){win.location.assign(url.href);return win;}
 const tab=win.open(url.href,'_blank');
 if(!tab){win.sessionStorage.removeItem(key);throw new Error('Allow pop-ups for Speak Boldly, then select the report again to open a new tab.');}
 // The new same-origin tab receives its own copy of sessionStorage when opened.
 win.sessionStorage.removeItem(key);
 return tab;
}
export function readReportTab(win){
 const token=win.location.hash.slice(1);if(!/^[a-zA-Z0-9-]{1,100}$/.test(token))return null;
 try{const payload=JSON.parse(win.sessionStorage.getItem(REPORT_TAB_PREFIX+token)||'null');if(!payload||!TYPES.has(payload.type)||!payload.client?.id||!Number.isFinite(payload.createdAt)||Date.now()-payload.createdAt>8*60*60*1000)return null;return payload;}catch{return null;}
}
