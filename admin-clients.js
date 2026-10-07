export const CLIENT_LEVELS=['Not assessed','A1','A2','B1','B2','C1','C2'];
export const PAYMENT_STATUSES=['Unpaid','Part paid','Paid'];
export function validateClient(input,clients=[],editingId=null){
 const name=String(input.name||'').trim(),email=String(input.email||'').trim().toLowerCase();
 const level=String(input.level||''),payment=String(input.payment||'');
 if(!name||name.length>100)throw new Error('Enter a client name (up to 100 characters).');
 if(email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))throw new Error('Enter a valid email address.');
 if(clients.some(c=>c.id!==editingId&&c.email.toLowerCase()===email))throw new Error('This email already belongs to a client. Edit that client instead.');
 if(!CLIENT_LEVELS.includes(level)||!PAYMENT_STATUSES.includes(payment))throw new Error('Choose a valid level and payment status.');
 const hours=Number(input.hours);if(input.hours===''||!Number.isFinite(hours)||hours<0||hours>100000||Math.abs(hours*100-Math.round(hours*100))>0.000001)throw new Error('Enter hours from 0 to 100000, with up to two decimal places.');
 return{name,email,level,payment,hours};
}
export function clientTotals(clients){return{clients:clients.length,hours:Math.round(clients.reduce((sum,c)=>sum+c.hours,0)*100)/100};}
