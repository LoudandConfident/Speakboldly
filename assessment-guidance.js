const placementGuidance = {
 'Below A1': {structure:'Practise I am, I have, and simple questions.',vocabulary:'Learn five everyday phrases at a time.',use:'Introduce yourself and ask for basic help.',routine:'Listen to five phrases. Repeat them, then change one detail.'},
 'A1–A2': {structure:'Work on word order, questions, and present and past forms.',vocabulary:'Learn phrases for your day, work, and shopping.',use:'Describe your day and ask a follow-up question.',routine:'Listen to a short conversation. Reuse three phrases in your own recording.'},
 'A2–B1': {structure:'Practise past simple vs present perfect. Join ideas with because and although.',vocabulary:'Learn common word pairs, such as make a decision.',use:'Tell a short story and explain your choices.',routine:'Retell a short story. Check one mistake, then try again.'},
 'B1–B2': {structure:'Practise conditionals, relative clauses, and passive forms.',vocabulary:'Use collocations and phrasal verbs in your own examples.',use:'Give an opinion with a reason and an example.',routine:'Record a one-minute response to an article. Improve two sentences.'},
 'B2–C1': {structure:'Refine complex sentences, tense choices, and emphasis.',vocabulary:'Choose precise phrases and match your tone to your audience.',use:'Summarise a complex idea clearly and respond to another viewpoint.',routine:'Summarise an interview. Review clarity and phrasing, then record it again.'}
};
export function practiceForLevel(level){const guidance=placementGuidance[level];if(!guidance)throw new Error('Unknown estimated level range');return guidance;}
export const learnerCourseGuidance = {
 visual:['Clear examples and diagrams, followed by practice.'],
 listening:['Short recordings, conversation, and pronunciation feedback.'],
 reflective:['Reading models, preparation time, and clear written feedback.'],
 practical:['Real tasks, role-plays, and a chance to retry after feedback.']
};
export const learnerQuickPractice = {
 visual:'Make a small word map. Use three phrases to describe a picture aloud.',
 listening:'Listen to a short clip. Record a reply using two phrases you heard.',
 reflective:'Read a short text. Note the main idea, then explain it aloud without looking.',
 practical:'Role-play a real task. Check a model, then repeat with one improvement.'
};
