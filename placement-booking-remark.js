export const PLACEMENT_BOOKING_NOTE='For a more personalised assessment and individual feedback, book an SB placement test. Your coach will assess your spoken and written English, discuss your goals, and recommend how to begin with Speak Boldly.';
export function createPlacementBookingRemark(doc,win){
 const section=doc.createElement('section');section.className='placement-booking-remark';
 const note=doc.createElement('p');note.textContent=PLACEMENT_BOOKING_NOTE;
 const button=doc.createElement('a');button.className='button';button.href='#students-portal/calendar';button.textContent='Book an SB placement test';
 button.addEventListener('click',()=>{const calendar=doc.querySelector('#portal-calendar');if(calendar)calendar.dataset.requestedBookingType='placement';try{win.sessionStorage.setItem('speak-boldly-booking-type','placement');}catch{}const dialog=button.closest('dialog');if(dialog?.open)dialog.close();});
 section.append(note,button);return section;
}
