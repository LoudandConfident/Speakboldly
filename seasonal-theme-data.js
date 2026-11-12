export const THEME_ARTS=['thanksgiving','christmas','new-year','winter','valentine','mothers','april-fools','spring','summer','autumn'];
export const DEFAULT_THEME_SCHEDULE=[
 {id:'new-year',start:'01-01',end:'01-14',art:'new-year',label:'Hello, {year}!',message:'Happy New Year {year}!'},
 {id:'winter-one',start:'01-15',end:'02-13',art:'winter',label:'Brrrr… it’s cold!',message:'Get under the blanket and take the course.'},
 {id:'valentine',start:'02-14',end:'02-14',art:'valentine',label:'Happy Valentine’s Day',message:'A little love. A little English.'},
 {id:'winter-two',start:'02-15',end:'03-20',art:'winter',label:'Still sweater weather',message:'Warm tea. Cosy blanket. Bold English.'},
 {id:'mothers',start:'03-21',end:'03-21',art:'mothers',label:'Happy Mother’s Day',message:'Moms: heroes of the world!'},
 {id:'spring-one',start:'03-22',end:'03-31',art:'spring',label:'A fresh start',message:'Let your English bloom.'},
 {id:'april-fools',start:'04-01',end:'04-01',art:'april-fools',label:'April Fools!',message:'Grammar is hard! Hahaa. You’ve got this.'},
 {id:'spring-two',start:'04-02',end:'04-30',art:'spring',label:'Hello, spring',message:'New words. Fresh possibilities.'},
 {id:'summer',start:'05-01',end:'08-31',art:'summer',label:'Summer is here!',message:'Sunshine, good conversations and you.'},
 {id:'autumn',start:'09-01',end:'10-31',art:'autumn',label:'A new season',message:'Turn a new leaf. Try a new word.'},
 {id:'thanksgiving',start:'11-01',end:'11-30',art:'thanksgiving',label:'Happy Thanksgiving',message:'We’re so grateful for you!'},
 {id:'christmas',start:'12-01',end:'12-31',art:'christmas',label:'Merry Christmas',message:'A little joy. A little magic. A bold new word.'}
];
export const DEFAULT_THEME_SETTINGS={revision:'0',mode:'automatic',schedule:DEFAULT_THEME_SCHEDULE};
export function validateThemeSchedule(input){
 if(!Array.isArray(input)||input.length<1||input.length>24)throw Error('Use 1–24 seasonal themes.');
 const used=new Set();return input.map((x,i)=>{if(!x||!THEME_ARTS.includes(x.art))throw Error('Choose an illustration for each theme.');
 const row={id:'theme-'+i};for(const key of ['start','end']){if(!/^\d{2}-\d{2}$/.test(x[key]||''))throw Error('Use MM-DD dates.');const d=new Date('2028-'+x[key]+'T12:00:00Z');if(!Number.isFinite(+d)||d.toISOString().slice(5,10)!==x[key])throw Error('Check your dates.');row[key]=x[key];}
 for(const[key,max]of[['label',55],['message',100]]){if(typeof x[key]!=='string'||!x[key].trim()||x[key].trim().length>max)throw Error('Keep titles within 55 characters and messages within 100.');row[key]=x[key].trim();}row.art=x.art;
 for(let d=new Date('2028-01-01T12:00:00Z');d.getUTCFullYear()===2028;d.setUTCDate(d.getUTCDate()+1)){const md=d.toISOString().slice(5,10);if(row.start<=row.end?md>=row.start&&md<=row.end:md>=row.start||md<=row.end){if(used.has(md))throw Error('Theme dates overlap. Give each date one theme.');used.add(md);}}return row;});
}
export function themeForDate(now=new Date(),settings=DEFAULT_THEME_SETTINGS){
 if(settings?.mode==='off')return null;const parts=new Intl.DateTimeFormat('en',{timeZone:'Africa/Cairo',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now),part=type=>parts.find(x=>x.type===type).value,md=part('month')+'-'+part('day');
 const row=(settings?.schedule||DEFAULT_THEME_SCHEDULE).find(x=>x.start<=x.end?md>=x.start&&md<=x.end:md>=x.start||md<=x.end);if(!row)return null;return {...row,label:row.label.replaceAll('{year}',part('year')),message:row.message.replaceAll('{year}',part('year'))};
}
