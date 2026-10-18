// Contextual illustrations and navigation; existing booking/exam controls remain in charge.
const symbols={
 book:'<path d="M7 11q12-6 23 0 12-6 23 0v34q-12-6-23 0-11-6-23 0ZM30 11v34M13 22h11M36 22h11M13 30h11M36 30h11"/>',
 ladder:'<path d="M10 47 24 7M34 47 48 7M15 33h24M19 21h24M23 9h24M11 45h24"/>',
 support:'<path d="m5 34 12-5 10 6 9-5 18 7-17 15-20-9-10 3M17 29l9-10 13 1 14 12M27 35l10 9M17 43l5-7"/><circle cx="29" cy="9" r="5"/>',
 speech:'<path d="M7 8h46v29H31L17 49V37H7ZM15 18h29M15 27h20"/>',
 star:'<path d="m30 5 7 16 18 2-14 12 4 18-15-9-16 9 4-18L4 23l19-2Z"/>',
 headphones:'<path d="M10 34V23a20 20 0 0 1 40 0v11M10 26h9v20h-9ZM41 26h9v20h-9ZM50 44c0 9-9 10-17 10"/>',
 calendar:'<rect x="7" y="11" width="46" height="40" rx="4"/><path d="M7 23h46M18 5v13M42 5v13M16 32h5M28 32h5M40 32h5M16 42h5M28 42h5"/>',
 people:'<circle cx="22" cy="17" r="9"/><circle cx="44" cy="20" r="7"/><path d="M5 50V39c0-17 34-17 34 0v11M42 33c11-2 14 6 14 17"/>',
 globe:'<circle cx="30" cy="29" r="24"/><path d="M6 29h48M30 5c-17 16-17 32 0 48M30 5c17 16 17 32 0 48M30 5v48M11 15h38M11 43h38"/>',
 board:'<rect x="7" y="7" width="46" height="32" rx="2"/><path d="M15 17h23M15 25h13M30 39v14M17 53h26"/>',
 folder:'<path d="M5 15V8h20l7 8h23v33H5ZM5 23h50"/>',
 compass:'<circle cx="30" cy="29" r="24"/><path d="m40 17-5 17-17 8 7-19ZM30 5v5M30 48v5M6 29h5M49 29h5"/>'
};
const svg=name=>'<svg viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(symbols[name]||symbols.book)+'</svg>';
const studentTitle=document.querySelector('#student-folder-title');if(studentTitle){const fix=()=>{if(/welcome back/i.test(studentTitle.textContent))studentTitle.textContent='Your next chapter.';};fix();new MutationObserver(fix).observe(studentTitle,{childList:true});}
const dashboard=document.querySelector('#admin-dashboard');
if(dashboard){
 // Use one clear symbol in each expandable tool heading.
 const decorate=()=>{for(const details of dashboard.querySelectorAll('details.admin-detail,details.native-english-editor,details.full-library')){const summary=details.querySelector(':scope>summary');if(!summary||summary.querySelector('.panel-symbol'))continue;const text=summary.textContent.toLowerCase();const icon=/calendar/.test(text)?'calendar':/password|dim|access/.test(text)?'support':/native|listen/.test(text)?'headphones':/review|note/.test(text)?'speech':/sheet/.test(text)?'board':'folder';const mark=document.createElement('span');mark.className='panel-symbol';mark.innerHTML=svg(icon);summary.prepend(mark);}};decorate();new MutationObserver(decorate).observe(dashboard,{childList:true,subtree:true});}
// Distinct visual signposts for examination sections; no answer content is changed.
const examHost=document.querySelector('#portal-exams');if(examHost){const decorate=()=>{examHost.querySelectorAll('.exam-text-page').forEach((section,i)=>{if(section.querySelector(':scope>.exam-section-symbol'))return;const mark=document.createElement('div');mark.className='exam-section-symbol';mark.innerHTML=svg(['ladder','book','speech','star','support','headphones'][i%6]);section.prepend(mark);});};decorate();new MutationObserver(decorate).observe(examHost,{childList:true,subtree:true});}

const monthlyCard=document.querySelector('#portal-tab-monthly>svg');if(monthlyCard){const month=Number(new Intl.DateTimeFormat('en',{timeZone:'Africa/Cairo',month:'numeric'}).format(new Date()))-1;monthlyCard.outerHTML=svg(['globe','headphones','book','speech','compass','people','ladder','board','support','calendar','folder','star'][month]);}
