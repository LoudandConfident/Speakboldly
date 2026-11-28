// Values remain compatible with saved bookings and the deployed calendar API.
export function bookingProgramLabel(value){
 return value==='General English — 8 sessions'?'General English · twice a week':value==='General English — 4 sessions'?'General English · once a week':value;
}
