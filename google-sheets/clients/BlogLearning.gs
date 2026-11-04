// Article-specific glossary metadata. Only the owner can save; public readers receive published entries.
function sbPortalBlogLearningEvent(event){
 let data;try{data=JSON.parse(event?.postData?.contents||'null');}catch{return null;}
 if(!data||!['boldlyNotes','listBoldlyNotes','saveBoldlyNote'].includes(data.action))return null;
 const json=value=>ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
 const learning=post=>{
  const store=sbNotesRows(),saved=store.posts.find(p=>p.id===post.id);let tools;
  if(saved&&store.sheet.getLastColumn()>=9){const raw=store.sheet.getRange(saved.row,9).getValue();if(raw)try{tools=JSON.parse(String(raw));}catch{}}
  return tools||SB_PORTAL_BLOG_LEARNING_DEFAULTS[post.id]||{vocabulary:[],expressions:[]};
 };
 try{
  if(data.action==='boldlyNotes'){const result=sbNotesPublic(data);if(result.post)result.post.learningTools=learning(result.post);return json(result);}
  sbRequireClientConnection(data);
  if(data.action==='listBoldlyNotes'){const result=sbNotesOwner(data);result.posts=result.posts.map(post=>({...post,learningTools:learning(post)}));return json(result);}
  if(typeof data.published!=='boolean')throw Error('Choose draft or published.');
  const tools=sbPortalValidateLearningTools(data.learningTools||SB_PORTAL_BLOG_LEARNING_DEFAULTS[data.id],data.pages,data.published===true);
  // Keep the article a draft until its glossary has been stored successfully.
  const published=data.published,result=sbNotesOwner({...data,published:false}),store=sbNotesRows(),saved=store.posts.find(p=>p.id===result.post.id);
  if(!saved)throw Error('The article could not be found after saving. It remains a draft.');
  store.sheet.getRange(1,9).setValue('Learning tools JSON');store.sheet.getRange(saved.row,9).setValue(JSON.stringify(tools));
  if(published)store.sheet.getRange(saved.row,6).setValue(true);
  result.post.published=published;result.post.learningTools=tools;return json(result);
 }catch(error){return json({ok:false,error:String(error.message||error)});}
}
function sbPortalValidateLearningTools(value,pages,published){
 if(!value||!Array.isArray(value.vocabulary)||!Array.isArray(value.expressions))throw Error('Add vocabulary and useful expressions for this article.');
 if(value.vocabulary.length>30||value.expressions.length>12)throw Error('Keep draft learning tools under 30 words and 12 expressions.');
 if(published&&(value.vocabulary.length<12||value.vocabulary.length>18||value.expressions.length<4||value.expressions.length>6))throw Error('Before publishing, add about 15 words and 5 useful expressions, with definitions and examples.');
 const text=(pages||[]).join(' '),seen={};
 const parse=(rows,key)=>rows.map(item=>{
  const result={};for(const field of [key,'definition','example',...(key==='word'?['part']:[])]){const input=item?.[field],max=field==='example'?700:field==='definition'?600:field==='part'?60:100;if(typeof input!=='string'||!input.trim()||input.length>max)throw Error('Check each glossary term, definition and example.');result[field]=input.trim();}
  const term=result[key],pattern=term.replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/['’]/g,"['’]").replace(/\s+/g,'\\s+');
  if(seen[term.toLowerCase()]||!new RegExp('\\b'+pattern+'\\b','i').test(text))throw Error('Use each glossary term in the article once, and avoid duplicate entries: '+term);
  seen[term.toLowerCase()]=true;return result;
 });return {vocabulary:parse(value.vocabulary,'word'),expressions:parse(value.expressions,'phrase')};
}

const SB_PORTAL_BLOG_LEARNING_DEFAULTS={
  "your-english-is-not-your-worth": {
    "vocabulary": [
      {
        "word": "sophisticated",
        "part": "adjective",
        "definition": "Experienced and knowledgeable about culture and social situations; polished or refined.",
        "example": "He used formal English expressions to sound sophisticated and impress his colleagues."
      },
      {
        "word": "proficiency",
        "part": "noun",
        "definition": "The ability to do something well, developed through learning and practice.",
        "example": "The job requires English proficiency: you need to understand customer calls and write clear replies."
      },
      {
        "word": "subtle",
        "part": "adjective",
        "definition": "Not immediately obvious or easy to notice.",
        "example": "She said my answer was fine, but her raised eyebrow was a subtle sign that she disagreed."
      },
      {
        "word": "inadequate",
        "part": "adjective",
        "definition": "Not sufficient or good enough for a particular purpose.",
        "example": "I could not explain the problem on the phone because my vocabulary was inadequate for that conversation."
      },
      {
        "word": "inferior",
        "part": "adjective",
        "definition": "Lower in quality, status or importance; often used for a feeling rather than a fact.",
        "example": "I felt inferior when my colleagues spoke fluent English, even though I knew the topic better."
      },
      {
        "word": "pedestal",
        "part": "noun",
        "definition": "A raised base; in “put someone on a pedestal”, treating someone as if they are perfect.",
        "example": "He puts native speakers on a pedestal and assumes every sentence they say must be correct."
      },
      {
        "word": "ridicule",
        "part": "noun",
        "definition": "Unkind laughter or comments intended to make someone seem foolish.",
        "example": "When I mispronounced a word, two classmates laughed. Their ridicule made me afraid to speak again."
      },
      {
        "word": "humiliated",
        "part": "adjective",
        "definition": "Made to feel deeply embarrassed or ashamed.",
        "example": "The teacher laughed at his mistakes in front of the class, and he felt humiliated."
      },
      {
        "word": "competent",
        "part": "adjective",
        "definition": "Having the skills and knowledge needed to do something well.",
        "example": "She is a competent accountant: she finds errors quickly and explains the numbers clearly, even in simple English."
      },
      {
        "word": "fluency",
        "part": "noun",
        "definition": "The ability to speak or write smoothly and with ease.",
        "example": "I used to pause after every few words. Regular conversation practice helped me speak with greater fluency."
      },
      {
        "word": "self-worth",
        "part": "noun",
        "definition": "The sense that you have value as a person.",
        "example": "A low English score upset him, but it did not change his self-worth: he knew he was still a capable person."
      },
      {
        "word": "substance",
        "part": "noun",
        "definition": "Meaningful ideas or useful content beneath the surface.",
        "example": "The presentation sounded impressive but had no substance: there were no facts, examples or practical ideas."
      },
      {
        "word": "flawless",
        "part": "adjective",
        "definition": "Without mistakes or imperfections.",
        "example": "Her presentation sounded flawless, but the team still needed facts to support her ideas."
      },
      {
        "word": "clarity",
        "part": "noun",
        "definition": "The quality of being easy to hear or understand.",
        "example": "She slowed down and explained the plan in short steps, which gave her message more clarity."
      },
      {
        "word": "perspective",
        "part": "noun",
        "definition": "A particular way of understanding or thinking about something.",
        "example": "Learning another language gave him a new perspective on conversations he used to avoid."
      }
    ],
    "expressions": [
      {
        "phrase": "make fun of",
        "definition": "To laugh at someone in an unkind way.",
        "example": "A good coach will never make fun of your accent."
      },
      {
        "phrase": "out of place",
        "definition": "Feeling that you do not fit into a situation or group.",
        "example": "I felt out of place at first, but a friendly conversation helped me relax."
      },
      {
        "phrase": "get something straight",
        "definition": "To make a fact or position clear so there is no misunderstanding.",
        "example": "Let’s get something straight: making a mistake does not make you less intelligent."
      },
      {
        "phrase": "comfort zone",
        "definition": "A situation in which you feel familiar, safe and comfortable.",
        "example": "Speaking to a new colleague in English took her outside her comfort zone."
      },
      {
        "phrase": "a work in progress",
        "definition": "Something or someone still developing and improving.",
        "example": "My English is a work in progress, and I can use it while I improve."
      }
    ]
  },
  "the-quiet-power-of-consistency": {
    "vocabulary": [
      {
        "word": "intentional",
        "part": "adjective",
        "definition": "Done deliberately, with a clear purpose.",
        "example": "I made an intentional choice to practise English for ten minutes before work."
      },
      {
        "word": "consciously",
        "part": "adverb",
        "definition": "With deliberate thought and awareness of what you are doing.",
        "example": "At first, I consciously checked the verb tense before answering."
      },
      {
        "word": "equivalent",
        "part": "noun",
        "definition": "A word, expression or thing with a similar meaning or function.",
        "example": "There is no single English equivalent for every Arabic expression."
      },
      {
        "word": "underestimated",
        "part": "adjective",
        "definition": "Judged to be less important, powerful or useful than it really is.",
        "example": "The value of a short daily conversation is often underestimated."
      },
      {
        "word": "retrieve",
        "part": "verb",
        "definition": "To bring stored information back into your mind.",
        "example": "Try to retrieve yesterday’s new phrase before looking at your notes."
      },
      {
        "word": "accessible",
        "part": "adjective",
        "definition": "Easy to reach, understand or use.",
        "example": "Regular practice makes familiar expressions more accessible during a conversation."
      },
      {
        "word": "transformation",
        "part": "noun",
        "definition": "A significant change in form, character or ability.",
        "example": "The transformation was gradual: she moved from avoiding calls to leading discussions."
      },
      {
        "word": "precision",
        "part": "noun",
        "definition": "The quality of being exact and clear.",
        "example": "Saying “I’m disappointed” instead of “I feel bad” can give your message more precision."
      },
      {
        "word": "instinctive",
        "part": "adjective",
        "definition": "Happening naturally, without needing much conscious thought.",
        "example": "After practising the greeting many times, her response became instinctive."
      },
      {
        "word": "decode",
        "part": "verb",
        "definition": "To work out the meaning of something that is difficult to understand.",
        "example": "I replayed the short recording to decode the phrase I had missed."
      },
      {
        "word": "milestones",
        "part": "plural noun",
        "definition": "Important stages or achievements that show progress.",
        "example": "Understanding my first English film without subtitles was one of my learning milestones."
      },
      {
        "word": "closure",
        "part": "noun",
        "definition": "A sense of resolution or completion after an experience.",
        "example": "Talking honestly about the disagreement gave her a sense of closure."
      },
      {
        "word": "acknowledged",
        "part": "verb / adjective",
        "definition": "Recognised, accepted or shown to have been noticed.",
        "example": "When my coach acknowledged the effort I had made, I felt understood."
      },
      {
        "word": "concise",
        "part": "adjective",
        "definition": "Expressing the necessary information clearly in few words.",
        "example": "Keep your email concise: explain the problem and say what you need."
      },
      {
        "word": "linear",
        "part": "adjective",
        "definition": "Following a straight, steady sequence rather than moving up and down.",
        "example": "Language progress is not always linear; a difficult week can follow an easy one."
      }
    ],
    "expressions": [
      {
        "phrase": "kept showing up",
        "definition": "Continued returning and making an effort, even when progress was hard to notice.",
        "example": "She kept showing up for short practice sessions, even during a busy month."
      },
      {
        "phrase": "bring it up",
        "definition": "To introduce a topic into a conversation.",
        "example": "If you do not understand the homework, bring it up with your coach."
      },
      {
        "phrase": "let it slide",
        "definition": "To choose not to address a small problem or mistake on that occasion.",
        "example": "He arrived two minutes late, so we decided to let it slide this time."
      },
      {
        "phrase": "the ball is in your court",
        "definition": "It is now your turn to decide or take the next action.",
        "example": "I have sent the available times; the ball is in your court."
      },
      {
        "phrase": "slipped my mind",
        "definition": "Was forgotten, usually unintentionally.",
        "example": "I meant to reply yesterday, but it slipped my mind."
      }
    ]
  }
};
