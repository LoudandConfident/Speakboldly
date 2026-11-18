// Each dashboard destination has a real page on the static host.
export const LEARNING_HUB_ROUTES = Object.freeze({
 mission:{path:'/learn/daily-challenges/',title:'Daily Challenge',description:'Read, listen and practise with a fresh English challenge for your level.'},
 monthly:{path:'/learn/culture-corner/',title:'Culture Corner',description:'Explore English through reading, listening, novels and films.'},
 studio:{path:'/learn/sb-studio/',title:'SB Studio',description:'A preview of independent voice and conversation practice. Stay Tuned.',noindex:true},
 calendar:{path:'/learn/session-calendar/',title:'Session Calendar',description:'Book a placement or manage your upcoming Speak Boldly sessions.',noindex:true},
 contact:{path:'/learn/ask-your-coach/',title:'Ask Your Coach',description:'Ask your coach a question or share your learning activity for feedback.',noindex:true},
 'student-zone':{path:'/learn/sb-student-zone/',title:'SB Student Zone',description:'An upcoming practice space for enrolled Speak Boldly students. Stay Tuned.',noindex:true},
 listening:{path:'/learn/listening/',title:'Listening',description:'Find the listening practice for your Speak Boldly level.',noindex:true},
 exercises:{path:'/learn/practice-zone/',title:'Practice Zone',description:'Open the practice activities selected for your Speak Boldly course.',noindex:true},
 exams:{path:'/learn/test-yourself/',title:'Test Yourself',description:'Open your Speak Boldly end-of-level assessment.',noindex:true},
 material:{path:'/learn/learning-library/',title:'Learning Library',description:'Find course books, audio and learning materials for your Speak Boldly program.',noindex:true}
});

export function learningHubRoute(id){return Object.hasOwn(LEARNING_HUB_ROUTES,id)?LEARNING_HUB_ROUTES[id]:null;}
export function learningHubPanel(pathname){return Object.keys(LEARNING_HUB_ROUTES).find(id=>LEARNING_HUB_ROUTES[id].path===pathname)||null;}
export function learningCardFromHash(hash){const match=/^#?students-portal\/student\/([a-z-]+)$/.exec(hash||'');return match&&learningHubRoute(match[1])?match[1]:null;}
