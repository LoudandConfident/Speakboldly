import {createCoachExcuses} from './coach-excuses.js?v=1';
const excuses=[
 'negotiating a coffee break with the microphone.',
 'trying to persuade the silent letters to introduce themselves.',
 'untangling the headphones. It’s a whole subplot.',
 'rehearsing “just one more try” for the seventeenth time.',
 'waiting for the phrasal verbs to stop talking over each other.',
 'helping “beach” and “peach” agree to disagree.',
 'giving the tongue twisters a little personal space.',
 'asking the microphone to stop taking everything so literally.',
 'trying to get the irregular verbs to follow a schedule.',
 'warming up. Even the speech bubbles are doing vocal exercises.'
];
export function initializeStudioPreview(doc){
 const root=doc.querySelector('#portal-studio');
 function open(){if(!root||root.querySelector('.studio-fun-status'))return;const fun=createCoachExcuses(doc,{excuses,lead:'SB Studio is ',heading:'STUDIO STATUS · UNOFFICIAL',note:'The practice rooms are still warming up. The excuses are ready to play.'});fun.classList.add('studio-fun-status');root.querySelector('.studio-preview-covered').before(fun);}
 return {open,lock(){}};
}
