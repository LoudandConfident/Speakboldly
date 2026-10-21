// Common-error checks run locally; no correction API receives the writing.
const baseVerbs={goes:'go',went:'go',gone:'go',has:'have',had:'have',does:'do',did:'do',done:'do',likes:'like',liked:'like',wants:'want',wanted:'want',needs:'need',needed:'need',works:'work',worked:'work',studies:'study',studied:'study',speaks:'speak',spoke:'speak',spoken:'speak',writes:'write',wrote:'write',written:'write',eats:'eat',ate:'eat',eaten:'eat',takes:'take',took:'take',taken:'take',makes:'make',made:'make',comes:'come',came:'come',gets:'get',got:'get',learns:'learn',learned:'learn',plays:'play',played:'play',buys:'buy',bought:'buy'};
const spellings={recieve:'receive',recieved:'received',becuase:'because',beacuse:'because',definately:'definitely',seperate:'separate',alot:'a lot',enviroment:'environment',freind:'friend',wierd:'weird',langauge:'language',grammer:'grammar',sentance:'sentence',begining:'beginning',untill:'until',succesful:'successful',writting:'writing',studing:'studying',tommorow:'tomorrow',tommorrow:'tomorrow',yestarday:'yesterday',intresting:'interesting',pronounciation:'pronunciation'};
const caps=(source,target)=>(/^[A-Z]/.test(source)||source==='i')?target[0].toUpperCase()+target.slice(1):target;
export function countSentences(value){const source=String(value).replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|e\.g|i\.e)\./gi,m=>m.replaceAll('.','')).replace(/(\d)\.(\d)/g,'$1$2');return (source.match(/[^.!?]+[.!?]+(?:[”"’']|$)?/g)||[]).filter(s=>(s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).length>=2).length;}
export function checkWriting(value){const text=String(value).slice(0,12000),issues=[];let category='Grammar';const add=(start,end,suggestion,explanation)=>{if(text.slice(start,end)===suggestion||issues.some(i=>start<i.end&&end>i.start))return;issues.push({start,end,original:text.slice(start,end),suggestion,explanation,category});};const rule=(pattern,replacement,why)=>{for(const m of text.matchAll(pattern))add(m.index,m.index+m[0].length,typeof replacement==='function'?replacement(m):replacement,why);};
 rule(/\bi\s+(?:is|are)\b/gi,'I am','Use “am” with “I”.');
 rule(/\b(he|she|it)\s+(?:are|am)\b/gi,m=>caps(m[1],m[1].toLowerCase()+' is'),'Use “is” with he, she and it.');
 rule(/\b(you|we|they)\s+(?:is|am)\b/gi,m=>caps(m[1],m[1].toLowerCase()+' are'),'Use “are” with you, we and they.');
 rule(/\b(he|she|it)\s+have\b/gi,m=>/\b(?:does|did|can|could|should|will|would|may|might|must)\s*$/i.test(text.slice(0,m.index))?m[0]:caps(m[1],m[1].toLowerCase()+' has'),'Use “has” with he, she and it.');
 rule(/\b(I|you|we|they)\s+has\b/gi,m=>caps(m[1],m[1].toLowerCase()+' have'),'Use “have” with I, you, we and they.');
 rule(/\b(he|she|it)\s+don['’]t\b/gi,m=>caps(m[1],m[1].toLowerCase()+" doesn't"),'Use “doesn’t” with he, she and it.');
 rule(/\b(I|you|we|they)\s+doesn['’]t\b/gi,m=>caps(m[1],m[1].toLowerCase()+" don't"),'Use “don’t” with I, you, we and they.');
 rule(/\b(you|we|they)\s+was\b/gi,m=>caps(m[1],m[1].toLowerCase()+' were'),'Use “were” with you, we and they.');
 rule(/\b(can|could|must|should|will|would|may|might)\s+to\s+([a-z]+)\b/gi,m=>caps(m[1],m[1].toLowerCase()+' '+m[2]),'After a modal verb, use the base verb without “to”.');
 rule(/\b(did|didn['’]t|doesn['’]t|don['’]t|can|could|must|should|will|would)\s+([a-z]+)\b/gi,m=>baseVerbs[m[2].toLowerCase()]?m[1]+' '+baseVerbs[m[2].toLowerCase()]:m[0],'Use the base verb after this auxiliary or modal.');
 rule(/\bwould\s+like\s+(learn|go|speak|write|study|work|visit|try|buy|read)\b/gi,m=>caps(m[0],'would like to '+m[1]),'Use “would like to” before a verb.');
 rule(/\b(he|she|it)\s+(go|do|want|like|need|work|speak|live|play|eat|study|learn)\b/gi,m=>{if(/\b(?:does|did|can|could|should|will|would|may|might|must|that)\s*$/i.test(text.slice(0,m.index)))return m[0];const v=m[2].toLowerCase();return caps(m[1],m[1].toLowerCase()+' '+(v==='go'?'goes':v==='do'?'does':v==='study'?'studies':v+'s'));},'In the present simple, use -s or -es with he, she and it.');

 // High-confidence agreement, auxiliary and verb-pattern errors in free paragraphs.
 rule(/\b(I|you|we|they)\s+(goes|does|wants|likes|needs|works|speaks|lives|plays|eats|studies|learns)\b/gi,m=>caps(m[1],m[1].toLowerCase()+' '+({goes:'go',does:'do',studies:'study'}[m[2].toLowerCase()]||m[2].toLowerCase().slice(0,-1))),'Use the base present-tense verb with I, you, we and they.');
 rule(/\b(am|is|are|was|were)\s+(go|work|study|play|speak|eat|watch|wait)\b/gi,m=>m[1]+' '+({study:'studying'}[m[2].toLowerCase()]||m[2].toLowerCase()+'ing'),'Use an -ing verb after “be” for an action in progress.');
 rule(/\b(I|you|he|she|it|we|they)\s+(happy|tired|hungry|ready|afraid|angry)\b/gi,m=>caps(m[1],m[1].toLowerCase()+' '+(m[1].toLowerCase()==='i'?'am':/^(he|she|it)$/i.test(m[1])?'is':'are')+' '+m[2]),'A statement with a subject and an adjective needs a form of “be”.');
 rule(/\b(childs|childrens|womans|mans|foots|tooths)\b/gi,m=>caps(m[0],({childs:'children',childrens:'children',peoples:'people',womans:'women',mans:'men',foots:'feet',tooths:'teeth'})[m[0].toLowerCase()]),'Check this irregular plural. Keep “peoples” if you mean distinct ethnic or national groups.');
 rule(/\b(want|wants|wanted|need|needs|needed|decide|decides|decided)\s+(learn|study|speak|improve|visit|buy|go|eat)\b/gi,m=>m[1]+' to '+m[2],'Use “to” before the following verb with want, need and decide.');
 rule(/\b(can|could|should|would|will|must)\s+(?:not\s+)?(went|gone|ate|eaten|wrote|written|spoke|spoken|took|taken|bought|made|did|done|had)\b/gi,m=>m[0].slice(0,-m[2].length)+baseVerbs[m[2].toLowerCase()],'Use the base verb after a modal.');
 // Contextual suggestions preserve legitimate uses such as “writing to my teacher”.
 category='Vocabulary';
 rule(/\b(like|likes|love|loves|eat|eats|ate|eating|cook|cooks|cooking)\s+fishes\b/gi,m=>m[1]+' fish','Usually use “fish” for food or fish in general. “Fishes” can refer to different species; keep it if that is your meaning.');
 rule(/\b(writing|write|writes|wrote)\s+to\s+((?:my|your|his|her|our|their|the)\s+(?:tasks?|homework|assignments?))\b/gi,m=>caps(m[1],{writing:'doing',write:'do',writes:'does',wrote:'did'}[m[1].toLowerCase()])+' '+m[2],'For completing tasks or homework, use “do”, not “write to”. If you mean composing an assignment, use “write my assignment” without “to”.');
 rule(/\b(do|does|did|doing)\s+(a\s+mistake|mistakes)\b/gi,m=>({do:'make',does:'makes',did:'made',doing:'making'}[m[1].toLowerCase()]?caps(m[1],{do:'make',does:'makes',did:'made',doing:'making'}[m[1].toLowerCase()]):m[1])+' '+m[2],'Use “make a mistake”, rather than “do a mistake”.');
 rule(/\b(say|says|said|saying)\s+me\b/gi,m=>caps(m[1],({say:'tell',says:'tells',said:'told',saying:'telling'})[m[1].toLowerCase()])+' me','Use “tell me”, or “say something to me”.');
 rule(/\b(discuss|discusses|discussed|discussing)\s+about\b/gi,m=>m[1],'Use “discuss something” without “about”.');
 category='Grammar';
 rule(/\b(enjoy|enjoys|enjoyed)\s+to\s+(learn|swim|read|write|work|play|cook)\b/gi,m=>m[1]+' '+({swim:'swimming',write:'writing'}[m[2].toLowerCase()]||m[2].toLowerCase()+'ing'),'After “enjoy”, use the -ing form.');
 rule(/\b(informations|advices|homeworks|equipments)\b/gi,m=>caps(m[0],m[0].toLowerCase().slice(0,-1)),'This noun is normally uncountable in English; use its singular form.');
 category='Grammar';
 rule(/\ba\s+(apple|orange|egg|umbrella|hour|honest|idea|example|interesting|important|English)\b/gi,m=>caps(m[0],'an '+m[1]),'Use “an” before a vowel sound.');
 rule(/\ban\s+(university|uniform|European|useful|user)\b/gi,m=>caps(m[0],'a '+m[1]),'Use “a” before this consonant sound.');
 rule(/\bmuch\s+(people|friends|books|students|things)\b/gi,m=>caps(m[0],'many '+m[1]),'Use “many” with plural countable nouns.');
 rule(/\bsince\s+(\d+|two|three|four|five|six|several)\s+(days|weeks|months|years)\b/gi,m=>caps(m[0],'for '+m[1]+' '+m[2]),'Use “for” with a duration.');
 rule(/\b(go|goes|went|going|come|came)\s+to\s+home\b/gi,m=>m[1]+' home','Do not use “to” before “home” after these movement verbs.');
 category='Vocabulary';
 for(const m of text.matchAll(/\b[A-Za-z]+\b/g)){const word=spellings[m[0].toLowerCase()];if(word)add(m.index,m.index+m[0].length,caps(m[0],word),'Check the spelling of this word.');}
 rule(/\b([A-Za-z]+)\s+\1\b/gi,m=>/^(had|that)$/i.test(m[1])?m[0]:m[1],'This word may have been repeated accidentally.');
 category='Punctuation';
 const capitalize=(start,end,suggestion,explanation)=>{const existing=issues.find(i=>start>=i.start&&end<=i.end);if(existing){const original=text.slice(start,end);existing.suggestion=existing.suggestion.replace(new RegExp('\\b'+original+'\\b','u'),suggestion);existing.explanation+=' '+explanation;}else add(start,end,suggestion,explanation);};
 category='Capitalization';
 for(const m of text.matchAll(/\bi\b/g))capitalize(m.index,m.index+1,'I','The pronoun “I” always wears a capital letter—even in contractions like “I’m”.');
 const properNames={ahmed:'Ahmed',mohamed:'Mohamed',mohammed:'Mohammed',sara:'Sara',sarah:'Sarah',omar:'Omar',nora:'Nora',mira:'Mira',john:'John',mary:'Mary',london:'London',cairo:'Cairo',egypt:'Egypt',english:'English',french:'French',monday:'Monday',tuesday:'Tuesday',wednesday:'Wednesday',thursday:'Thursday',friday:'Friday',saturday:'Saturday',sunday:'Sunday'};
 for(const m of text.matchAll(/\b[A-Za-z]+\b/g)){const name=properNames[m[0].toLowerCase()];if(name&&name!==m[0])capitalize(m.index,m.index+m[0].length,name,'Names, places, languages and days begin with a capital letter. Give this one its name badge!');}
 // Names after explicit introductions can be unfamiliar; do not guess from every noun.
 for(const m of text.matchAll(/\b(?:my name is|his name is|her name is|their name is|my friend is called|mr\.|mrs\.|ms\.|dr\.)\s+([\p{Ll}][\p{L}’'-]*)/giu)){const word=m[1];if(!/^(?:a|an|the)$/i.test(word)){const start=m.index+m[0].length-word.length;capitalize(start,start+word.length,word[0].toUpperCase()+word.slice(1),'A person’s name starts with a capital letter. Tiny name, VIP entrance!');}}
 for(const m of text.matchAll(/(?:^\s*[“"‘']?|[.!?][”"’']?\s+[“"‘']?|\n\s*[“"‘']?)([a-z])/g)){const p=m.index+m[0].length-1;capitalize(p,p+1,m[1].toUpperCase(),'Start a sentence with a capital letter. Let the first letter stand tall!');}
 category='Punctuation';
 rule(/[^.!?\n]*[.!?]/g,m=>{const sentence=m[0];return /^\s*(?:do|does|did|is|are|am|was|were|can|could|will|would|should|have|has)\s+(?:I|you|he|she|it|we|they)\b/i.test(sentence)&&sentence.endsWith('.')?sentence.slice(0,-1)+'?':sentence;},'End a direct question with a question mark.');
 rule(/\s+([,;:!?])/g,m=>m[1],'Remove the space before punctuation.');
 rule(/([,;:!?])([A-Za-z])/g,m=>m[1]+' '+m[2],'Add a space after punctuation.');
 if(text.trim()&&!/[.!?][”"’']?$/.test(text.trim())){const end=text.trimEnd().length;issues.push({start:end,end,original:'',suggestion:'.',category:'Punctuation',explanation:'Finish the last sentence with punctuation.'});}
 for(const issue of issues){const openers={Grammar:'Grammar gremlin spotted!',Vocabulary:'Word wardrobe check!',Punctuation:'Punctuation pit stop!',Capitalization:'Capital letters to the rescue!'};issue.explanation=(openers[issue.category]||'Tiny tune-up!')+' '+issue.explanation;}
 issues.sort((a,b)=>a.start-b.start);let suggestedText=text;for(const item of [...issues].reverse())suggestedText=suggestedText.slice(0,item.start)+item.suggestion+suggestedText.slice(item.end);return {issues,suggestedText,sentenceCount:countSentences(text)};
}
