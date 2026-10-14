const placementGuidance = {
 'Below A1': {
  structure: 'Build short sentences with a subject and verb. Practise be, have, simple questions, and negatives.',
  vocabulary: 'Start with everyday words for people, places, routines, and things you need. Learn them in short phrases.',
  use: 'Practise introductions, numbers, and asking for basic help. Listen to short examples and give a simple reply.',
  routine: 'Choose five useful phrases, listen to a model, then use each phrase in a sentence about your day.'
 },
 'A1–A2': {
  structure: 'Make everyday sentences more reliable: word order, present and past forms, questions, articles, and basic prepositions.',
  vocabulary: 'Build useful phrases for daily routines, travel, shopping, and work. Revisit common verbs in different situations.',
  use: 'Describe your day, ask follow-up questions, and give short answers that add a little detail.',
  routine: 'Listen to a short everyday conversation, note three phrases, and record your own version using them.'
 },
 'A2–B1': {
  structure: 'Connect ideas with because, although, and if. Practise choosing tenses consistently, including past simple and present perfect.',
  vocabulary: 'Learn word combinations for familiar topics and practise describing a word when you cannot remember it.',
  use: 'Tell a short story, explain a choice, and understand the main point of a conversation. Ask for clarification when needed.',
  routine: 'Read or listen to a short story, retell it without looking, then check one grammar pattern and reuse it.'
 },
 'B1–B2': {
  structure: 'Develop control of conditionals, relative clauses, modals, and passive forms. Link longer ideas without losing clarity.',
  vocabulary: 'Build collocations, phrasal verbs, and topic-specific language. Choose words that make your meaning more precise.',
  use: 'Support an opinion with examples, compare alternatives, and practise natural follow-up responses in longer discussions.',
  routine: 'Respond to a short article or interview, review your recording or writing, and repeat it with two specific improvements.'
 },
 'B2–C1': {
  structure: 'Refine complex sentences, tense choices, and language for certainty, emphasis, and nuance. Keep accuracy in extended speech and writing.',
  vocabulary: 'Expand precise collocations and expressions. Practise choosing language that suits the audience, topic, and level of formality.',
  use: 'Summarise complex ideas, respond to different viewpoints, and adjust your tone in professional and informal situations.',
  routine: 'Choose a demanding topic, give a concise summary and response, then review precision, organisation, and natural phrasing.'
 }
};
export function practiceForLevel(level) {
 const guidance = placementGuidance[level];
 if (!guidance) throw new Error('Unknown estimated level range');
 return guidance;
}
export const learnerCourseGuidance = {
 visual: ['Clear examples, diagrams, and visible lesson goals, followed by speaking and writing practice.', 'Side-by-side corrections and a chance to explain the pattern in your own words.'],
 listening: ['Short listening models, conversation, and time to rehearse pronunciation with feedback.', 'A teacher who lets you ask follow-up questions and connects spoken practice to reading and writing.'],
 reflective: ['Reading models and a little preparation time before discussing or writing a response.', 'Clear written feedback, useful notes to revisit, and opportunities to speak beyond your prepared draft.'],
 practical: ['Realistic tasks, role-plays, and projects with a clear purpose.', 'A chance to try a task, receive specific feedback, and try again using what you learned.']
};
