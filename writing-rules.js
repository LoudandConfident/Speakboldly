// Conservative additions: explicit learner-error patterns, not guesses about intent.
const verbs={go:['went','gone','going'],eat:['ate','eaten','eating'],write:['wrote','written','writing'],speak:['spoke','spoken','speaking'],take:['took','taken','taking'],see:['saw','seen','seeing'],give:['gave','given','giving'],buy:['bought','bought','buying'],bring:['brought','brought','bringing'],think:['thought','thought','thinking'],teach:['taught','taught','teaching'],catch:['caught','caught','catching'],run:['ran','run','running'],swim:['swam','swum','swimming'],choose:['chose','chosen','choosing'],begin:['began','begun','beginning'],break:['broke','broken','breaking'],drive:['drove','driven','driving'],forget:['forgot','forgotten','forgetting'],know:['knew','known','knowing'],meet:['met','met','meeting'],feel:['felt','felt','feeling'],leave:['left','left','leaving'],find:['found','found','finding'],lose:['lost','lost','losing'],send:['sent','sent','sending'],build:['built','built','building'],understand:['understood','understood','understanding'],make:['made','made','making'],do:['did','done','doing'],have:['had','had','having']};
const caseLike=(a,b)=>/^[A-Z]/.test(a)?b[0].toUpperCase()+b.slice(1):b;
export function additionalWritingChecks(text,add){
 const rule=(regex,replace,why,category='Grammar')=>{for(const m of text.matchAll(regex)){const suggestion=typeof replace==='function'?replace(m):replace;if(suggestion!==m[0])add(m.index,m.index+m[0].length,suggestion,why,category);}};
 const forms={};for(const [base,[past,participle]]of Object.entries(verbs)){forms[base]=base;forms[past]=base;forms[participle]=base;forms[base+'s']=base;}
 rule(/\b(did|didn['’]t|does|doesn['’]t|don['’]t|can|can['’]t|cannot|could|couldn['’]t|should|shouldn['’]t|must|mustn['’]t|will|won['’]t|would|wouldn['’]t|may|might)\s+(not\s+)?([a-z]+)\b/gi,m=>forms[m[3].toLowerCase()]?m[1]+' '+(m[2]||'')+forms[m[3].toLowerCase()]:m[0],'Use the base verb after this auxiliary or modal.');
 rule(/\b(has|have|had)\s+(already\s+|just\s+|never\s+|not\s+)?(went|ate|wrote|spoke|took|saw|gave|ran|swam|chose|began|broke|drove|forgot|knew)\b/gi,m=>m[1]+' '+(m[2]||'')+verbs[forms[m[3].toLowerCase()]][1],'Perfect tenses use have/has/had + past participle.');
 rule(/\b(goed|eated|buyed|bringed|thinked|teached|catched|runned|swimmed|writed|speaked|taked|maked|choosed|breaked|drived|finded|feeled|leaved|sended|builded|understanded)\b/gi,m=>caseLike(m[0],({goed:'went',eated:'ate',buyed:'bought',bringed:'brought',thinked:'thought',teached:'taught',catched:'caught',runned:'ran',swimmed:'swam',writed:'wrote',speaked:'spoke',taked:'took',maked:'made',choosed:'chose',breaked:'broke',drived:'drove',finded:'found',feeled:'felt',leaved:'left',sended:'sent',builded:'built',understanded:'understood'})[m[0].toLowerCase()]),'This verb has an irregular past form.');
 rule(/\b(enjoy|enjoys|enjoyed|avoid|avoids|avoided|finish|finishes|finished|consider|considers|considered|keep|keeps|kept|mind)\s+to\s+(go|eat|write|speak|take|see|give|buy|run|swim|make|do|learn|study|read|work|play|cook)\b/gi,m=>m[1]+' '+(verbs[m[2].toLowerCase()]?.[2]||m[2].toLowerCase()+'ing'),'This verb is followed by an -ing form, rather than “to” + verb.');
 rule(/\b(look|looks|looking|looked)\s+forward\s+to\s+(see|meet|hear|work|visit|learn)\b/gi,m=>m[1]+' forward to '+({see:'seeing',meet:'meeting',hear:'hearing',work:'working',visit:'visiting',learn:'learning'})[m[2].toLowerCase()],'In “look forward to”, “to” is a preposition: follow it with a noun or an -ing form.');
 rule(/\b(am|is|are|was|were)\s+(studing|runing|swiming|writeing|makeing|comeing|takeing|begining)\b/gi,m=>m[1]+' '+({studing:'studying',runing:'running',swiming:'swimming',writeing:'writing',makeing:'making',comeing:'coming',takeing:'taking',begining:'beginning'})[m[2].toLowerCase()],'Check the spelling of this -ing form.');
 rule(/\b(more)\s+(better|worse|easier|harder|faster|slower|bigger|smaller|stronger|cheaper)\b/gi,m=>caseLike(m[1],m[2]),'Do not combine “more” with a comparative adjective.');
 rule(/\b(the)\s+(goodest|bestest|badest|worstest)\b/gi,m=>m[1]+' '+(/^(goodest|bestest)$/i.test(m[2])?'best':'worst'),'Use “best” and “worst” as the superlative forms.');
 rule(/\b(one|a|an|each|every)\s+(books|students|friends|lessons|courses|questions|sessions|days|weeks|months|years)\b/gi,m=>m[1]+' '+m[2].slice(0,-1),'Use a singular countable noun after one, a/an, each or every.');
 rule(/\b(these|those)\s+(book|student|friend|lesson|course|question|session)\b/gi,m=>m[1]+' '+m[2]+'s','Use a plural noun after “these” or “those”.');
 rule(/\b(everyone|everybody|someone|somebody|anyone|anybody|nobody|everything|something|nothing)\s+(are|have)\b/gi,m=>m[1]+' '+(/are/i.test(m[2])?'is':'has'),'This indefinite pronoun takes a singular verb.');
 rule(/\b(there)\s+is\s+(many|several|two|three|four|five)\b/gi,m=>m[1]+' are '+m[2],'Use “there are” with a plural noun phrase.');
 rule(/\b(there)\s+are\s+(a|an|one)\b/gi,m=>m[1]+' is '+m[2],'Use “there is” with a singular noun phrase.');
 rule(/\b(between)\s+you\s+and\s+I\b/gi,m=>m[1]+' you and me','Use the object pronoun “me” after a preposition.');
 const phrases=[
 [/\bdepend(s|ed|ing)?\s+of\b/gi,m=>'depend'+(m[1]||'')+' on','Use “depend on”.'],
 [/\binterested\s+(?:on|about)\b/gi,'interested in','Use “interested in”.'],
 [/\bgood\s+in\s+(speaking|writing|swimming|cooking|playing)\b/gi,m=>'good at '+m[1],'Use “good at” for a skill or activity.'],
 [/\blisten(s|ed|ing)?\s+(music|the teacher|my teacher|the recording)\b/gi,m=>'listen'+(m[1]||'')+' to '+m[2],'Use “listen to” before the thing or person you hear.'],
 [/\bmarried\s+with\s+(him|her|a man|a woman)\b/gi,m=>'married to '+m[1],'Use “married to” for a spouse.'],
 [/\baccording\s+me\b/gi,'in my opinion','Use “in my opinion” to introduce your own view.'],
 [/\bin\s+(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)\b/gi,m=>'on '+m[1],'Use “on” with days of the week.'],
 [/\bat\s+(January|February|March|April|May|June|July|August|September|October|November|December)\b/gi,m=>'in '+m[1],'Use “in” with a month.'],
 [/\bdespite\s+of\b/gi,'despite','Use “despite” without “of”, or “in spite of”.'],
 [/\balthough\s+of\b/gi,'although','“Although” introduces a clause without “of”.'],
 [/\breason\s+is\s+because\b/gi,'reason is that','Use “the reason is that” to introduce the explanation.']
 ];for(const [regex,replacement,why]of phrases)rule(regex,m=>caseLike(m[0],typeof replacement==='function'?replacement(m):replacement),why);
 rule(/\b(dont|doesnt|didnt|isnt|arent|wasnt|werent|hasnt|havent|hadnt|cant|couldnt|shouldnt|wouldnt|mustnt)\b/gi,m=>caseLike(m[0],m[0].toLowerCase().slice(0,-1)+"'t"),'This contraction needs an apostrophe.','Punctuation');
 rule(/\b(Im|Ive)\b/g,m=>({Im:"I'm",Ive:"I've"})[m[0]],'This contraction needs an apostrophe.','Punctuation');
}
