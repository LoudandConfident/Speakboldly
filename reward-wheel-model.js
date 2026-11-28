export const WHEEL_PRIZES=[
 {id:'discount',title:'10% off an eligible program',short:'10% off',description:'Your coach confirms the price before issuing your personal discount. Offers cannot be combined.'},
 {id:'practice',title:'A free English practice pack',short:'Practice pack',description:'Speaking prompts, a short reading, useful expressions and practice with answers.'}
];
export const WHEEL_SECTORS=['discount','practice','discount','practice','discount','practice'];
export const WHEEL_STORAGE_KEY='speak-boldly-wheel-result-v1';
export const PRACTICE_PACK_URL='/resources/Speak-Boldly-Practice-Pack.pdf';
export function rewardMonth(now=new Date()){
 const parts=new Intl.DateTimeFormat('en',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit'}).formatToParts(now);
 return parts.find(p=>p.type==='year').value+'-'+parts.find(p=>p.type==='month').value;
}
export function readMonthlySpin(storage,now=new Date()){
 try{const result=JSON.parse(storage?.getItem(WHEEL_STORAGE_KEY)||'null');return result?.version===1&&result.month===rewardMonth(now)&&Number.isInteger(result.sector)&&result.sector>=0&&result.sector<WHEEL_SECTORS.length&&result.prizeId===WHEEL_SECTORS[result.sector]&&/^SBW-\d{6}-[A-Z0-9]{6,20}$/.test(result.reference)?result:null;}catch{return null;}
}
export function drawMonthlySpin(storage,{now=new Date(),random=Math.random,reference=()=>Math.random().toString(36).slice(2,12).toUpperCase()}={}){
 const saved=readMonthlySpin(storage,now);if(saved)return {...saved,persisted:true};
 const month=rewardMonth(now),sector=Math.max(0,Math.min(WHEEL_SECTORS.length-1,Math.floor(random()*WHEEL_SECTORS.length))),suffix=String(reference()).replace(/[^a-z0-9]/gi,'').toUpperCase().slice(0,12).padEnd(6,'0');
 const result={version:1,month,sector,prizeId:WHEEL_SECTORS[sector],reference:'SBW-'+month.replace('-','')+'-'+suffix,createdAt:now.toISOString()};
 try{storage.setItem(WHEEL_STORAGE_KEY,JSON.stringify(result));return {...result,persisted:true};}catch{return {...result,persisted:false};}
}
export function safeRewardShareUrl(value){
 try{const url=new URL(value);return url.origin==='https://speakboldly.space'&&/^\/(?:$|programs(?:\/|$)|motivation(?:\/|$)|learn\/daily-quotes(?:\/|$)|blog(?:\/|$)|literatespace(?:\/|$))/.test(url.pathname)?url.origin+url.pathname:'https://speakboldly.space/programs/';}catch{return 'https://speakboldly.space/programs/';}
}
export function rewardWhatsAppUrl(result,source){
 const prize=WHEEL_PRIZES.find(item=>item.id===result.prizeId);if(!prize)throw Error('Unknown reward.');
 const message='Hi, I’d like to claim my wheel reward. I shared this page: '+safeRewardShareUrl(source)+'\n\nMy wheel result: '+prize.title+'\nMonth: '+result.month+'\nResult reference: '+result.reference+'\n\nI’ll send the shared-post link or screenshot here. Please check my eligibility and confirm my reward.';
 return 'https://wa.me/201283786904?text='+encodeURIComponent(message);
}
export function wheelRestAngle(sector){return 360-(sector+.5)*(360/WHEEL_SECTORS.length);}
