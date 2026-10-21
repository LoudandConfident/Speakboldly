// Common-error checks run locally; no correction API receives the writing.
const baseVerbs={goes:'go',went:'go',gone:'go',has:'have',had:'have',does:'do',did:'do',done:'do',likes:'like',liked:'like',wants:'want',wanted:'want',needs:'need',needed:'need',works:'work',worked:'work',studies:'study',studied:'study',speaks:'speak',spoke:'speak',spoken:'speak',writes:'write',wrote:'write',written:'write',eats:'eat',ate:'eat',eaten:'eat',takes:'take',took:'take',taken:'take',makes:'make',made:'make',comes:'come',came:'come',gets:'get',got:'get',learns:'learn',learned:'learn',plays:'play',played:'play',buys:'buy',bought:'buy'};
const spellings={recieve:'receive',recieved:'received',becuase:'because',beacuse:'because',definately:'definitely',seperate:'separate',alot:'a lot',enviroment:'environment',freind:'friend',wierd:'weird',langauge:'language',grammer:'grammar',sentance:'sentence',begining:'beginning',untill:'until',succesful:'successful',writting:'writing',studing:'studying',tommorow:'tomorrow',tommorrow:'tomorrow',yestarday:'yesterday',intresting:'interesting',pronounciation:'pronunciation'};
const caps=(source,target)=>(/^[A-Z]/.test(source)||source==='i')?target[0].toUpperCase()+target.slice(1):target;
export function countSentences(value){const source=String(value).replace(/\b(?:Mr|Mrs|Ms|Dr|Prof|e\.g|i\.e)\./gi,m=>m.replaceAll('.','')).replace(/(\d)\.(\d)/g,'$1$2');return (source.match(/[^.!?]+[.!?]+(?:[”"’']|$)?/g)||[]).filter(s=>(s.match(/[A-Za-z]+(?:['’][A-Za-z]+)*/g)||[]).length>=2).length;}
export function checkWriting(value){const text=String(value).slice(0,12000),issues=[];const add=(start,end,suggestion,explanation)=>{if(text.slice(start,end)===suggestion||issues.some(i=>start<i.end&&end>i.start))return;issues.push({start,end,original:text.slice(start,end),suggestion,explanation});};const rule=(pattern,replacement,why)=>{for(const m of text.matchAll(pattern))add(m.index,m.index+m[0].length,typeof replacement==='function'?replacement(m):replacement,why);};
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
 rule(/\bi\b/g,'I','Capitalize the pronoun “I”.');
 rule(/\ba\s+(apple|orange|egg|umbrella|hour|honest|idea|example|interesting|important|English)\b/gi,m=>caps(m[0],'an '+m[1]),'Use “an” before a vowel sound.');
 rule(/\ban\s+(university|uniform|European|useful|user)\b/gi,m=>caps(m[0],'a '+m[1]),'Use “a” before this consonant sound.');
 rule(/\bmuch\s+(people|friends|books|students|things)\b/gi,m=>caps(m[0],'many '+m[1]),'Use “many” with plural countable nouns.');
 rule(/\bsince\s+(\d+|two|three|four|five|six|several)\s+(days|weeks|months|years)\b/gi,m=>caps(m[0],'for '+m[1]+' '+m[2]),'Use “for” with a duration.');
 rule(/\b(go|goes|went|going|come|came)\s+to\s+home\b/gi,m=>m[1]+' home','Do not use “to” before “home” after these movement verbs.');
 for(const m of text.matchAll(/\b[A-Za-z]+\b/g)){const word=spellings[m[0].toLowerCase()];if(word)add(m.index,m.index+m[0].length,caps(m[0],word),'Check the spelling of this word.');}
 rule(/\b([A-Za-z]+)\s+\1\b/gi,m=>/^(had|that)$/i.test(m[1])?m[0]:m[1],'This word may have been repeated accidentally.');
 for(const m of text.matchAll(/(?:^|[.!?][”"’']?\s+)([a-z])/g)){const p=m.index+m[0].length-1,existing=issues.find(i=>i.start===p);if(existing)existing.suggestion=existing.suggestion[0].toUpperCase()+existing.suggestion.slice(1);else add(p,p+1,m[1].toUpperCase(),'Start a sentence with a capital letter.');}
 rule(/\s+([,;:!?])/g,m=>m[1],'Remove the space before punctuation.');
 rule(/([,;:!?])([A-Za-z])/g,m=>m[1]+' '+m[2],'Add a space after punctuation.');
 if(text.trim()&&!/[.!?][”"’']?$/.test(text.trim())){const end=text.trimEnd().length;issues.push({start:end,end,original:'',suggestion:'.',explanation:'Finish the last sentence with punctuation.'});}
 issues.sort((a,b)=>a.start-b.start);let suggestedText=text;for(const item of [...issues].reverse())suggestedText=suggestedText.slice(0,item.start)+item.suggestion+suggestedText.slice(item.end);return {issues,suggestedText,sentenceCount:countSentences(text)};
}
