import {cairoMissionDate} from './daily-mission-data.js?v=five-practices';
const drawings=[
 '<path d="M20 48q28-14 55 0 27-14 55 0v61q-28-13-55 0-27-13-55 0ZM75 48v61M31 65h28M31 78h21M90 65h27M90 78h21"/><path d="m108 20 7-7 22 28-8 6Z" fill="#d5ed98"/>',
 '<path d="M75 113V61M75 83Q29 82 34 43q40 0 41 40ZM75 69q0-39 38-41 7 35-38 41M48 115h54M55 115l-8-25h56l-8 25"/><path d="M75 83Q29 82 34 43q40 0 41 40Z" fill="#d5ed98"/>',
 '<path d="M27 114h25V89h25V64h25V39h24M24 30l6 10 12 2-9 8 2 12-11-6-11 6 2-12-9-8 12-2ZM104 17l8-8 8 8M112 9v19" fill="#edf0e6"/>',
 '<path d="M58 88c0-14-18-22-18-40a35 35 0 0 1 70 0c0 18-18 26-18 40ZM58 96h34M62 106h26M68 116h14M75 3v-9M19 48H8M131 48h11M27 13l-8-8M123 13l8-8"/><path d="M75 88V55M75 65 62 52M75 65l13-13" stroke="#8fa85b"/>',
 '<path d="M41 98q15-52 65-73 4 53-47 76ZM61 81 38 63l-15 6 24 25M79 48l23 8 19 23-4 13-27-20M41 106l-9 12M54 113l-3 12M28 94l-12 5" fill="#edf0e6"/><circle cx="85" cy="51" r="9" fill="#d5ed98"/>',
 '<path d="M24 34h102v65H86l-23 19V99H24ZM39 51h72M39 65h56M39 79h34" fill="#edf0e6"/><path d="m107 14 5 10 11 2-8 8 2 11-10-5-10 5 2-11-8-8 11-2Z" fill="#d5ed98"/>'
];
const captions=['Little steps. Bold progress.','Your effort is taking root.','One step further today.','Let your ideas light up.','A little courage goes far.','Say it your way.','Practice makes possibilities.','Keep showing up for you.','Small wins count.','Curiosity looks good on you.','Give your English some room.','You’re building something.'];
export function encouragementForDate(date=new Date()){const day=Math.floor(Date.parse(cairoMissionDate(date)+'T00:00:00Z')/86400000);return {drawing:drawings[((day%drawings.length)+drawings.length)%drawings.length],caption:captions[((day%captions.length)+captions.length)%captions.length]};}
export function createDailyEncouragement(doc,date=new doc.defaultView.Date()){const item=encouragementForDate(date),figure=doc.createElement('figure');figure.className='daily-encouragement';figure.innerHTML='<svg viewBox="0 0 150 135" fill="none" stroke="#193c32" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+item.drawing+'</svg>';const caption=doc.createElement('figcaption');caption.textContent=item.caption;figure.append(caption);return figure;}
