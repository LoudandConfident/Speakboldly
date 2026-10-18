export const learnerProfiles = {
 visual: {name:'The Visual Organizer', summary:'You tend to choose examples you can see and arrange. Clear connections and a visible plan may help you get started.', tips:['Make a small word map for a topic you need: work, travel, or everyday conversation. Add an example sentence for each expression.','Use a short captioned video, then turn the captions off and listen again.','Colour-code corrections in your own sentences, then explain the pattern aloud.'], routine:'Draw a quick word map, listen to a short clip, then describe its main idea aloud without looking.'},
 listening: {name:'The Conversational Explorer', summary:'You tend to choose listening, speaking, and discussion. A spoken explanation and a chance to discuss it may help you get started.', tips:['Listen to a 30–60 second clip twice. Notice useful phrases, then check the transcript.','Record a short reply to the clip. Listen back and choose one thing to improve.','Try a brief conversation or voice-note exchange. Reuse two expressions from your listening practice.'], routine:'Listen, check the transcript, record a reply, and write one useful expression in a new sentence.'},
 reflective: {name:'The Reflective Reader', summary:'You tend to choose reading, notes, and time to think. A written example and time to reflect may help you get started.', tips:['Read a short message or article, then close it and explain the main point aloud.','Keep a small mistake log: your sentence, the corrected version, and one new example.','Write a short reply, then say the same idea naturally without reading your draft.'], routine:'Read a short text, recall its meaning, write three sentences, then speak for one minute without your notes.'},
 practical: {name:'The Practical Experimenter', summary:'You tend to choose real tasks and trying things out. A clear purpose may help you stay involved.', tips:['Practise a real task: ordering food, introducing yourself, asking for help, or explaining a work problem.','Try the task first, check a model, then try again using one improvement.','Role-play the situation or record yourself. Ask for feedback on one specific point.'], routine:'Choose a real situation, try it aloud, check a model, then repeat with a new detail.'}
};
const q = (prompt,visual,listening,reflective,practical) => ({scope:'general',prompt,options:[{profile:'visual',text:visual},{profile:'listening',text:listening},{profile:'reflective',text:reflective},{profile:'practical',text:practical}]});
const english = (...args) => ({...q(...args),scope:'english'});
// Original preference questions: 24 general-learning situations and 6 English situations.
// These are self-reported preferences, not a validated measure of ability or fixed learning styles.
export const learnerQuestions = [
  {
    "scope": "general",
    "prompt": "Learning a new device?",
    "options": [
      {
        "profile": "visual",
        "text": "See a labelled picture."
      },
      {
        "profile": "listening",
        "text": "Hear an explanation."
      },
      {
        "profile": "reflective",
        "text": "Read the instructions."
      },
      {
        "profile": "practical",
        "text": "Try it out."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "Finding a new place?",
    "options": [
      {
        "profile": "listening",
        "text": "Ask for spoken directions."
      },
      {
        "profile": "reflective",
        "text": "Read step-by-step directions."
      },
      {
        "profile": "practical",
        "text": "Walk the route once."
      },
      {
        "profile": "visual",
        "text": "Follow a map."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "An idea feels confusing. What helps?",
    "options": [
      {
        "profile": "reflective",
        "text": "A written explanation."
      },
      {
        "profile": "practical",
        "text": "A practical example to try."
      },
      {
        "profile": "visual",
        "text": "A clear diagram."
      },
      {
        "profile": "listening",
        "text": "Talking it through."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "How would you remember a process?",
    "options": [
      {
        "profile": "practical",
        "text": "Practise the steps."
      },
      {
        "profile": "visual",
        "text": "Draw a flowchart."
      },
      {
        "profile": "listening",
        "text": "Explain it aloud."
      },
      {
        "profile": "reflective",
        "text": "Write a checklist."
      }
    ]
  },
  {
    "scope": "english",
    "prompt": "Starting a new English topic?",
    "options": [
      {
        "profile": "visual",
        "text": "See illustrated examples."
      },
      {
        "profile": "listening",
        "text": "Hear and discuss examples."
      },
      {
        "profile": "reflective",
        "text": "Read and take notes."
      },
      {
        "profile": "practical",
        "text": "Try a short task."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "Learning a new hobby?",
    "options": [
      {
        "profile": "listening",
        "text": "Ask someone to explain."
      },
      {
        "profile": "reflective",
        "text": "Read a short guide."
      },
      {
        "profile": "practical",
        "text": "Try a guided activity."
      },
      {
        "profile": "visual",
        "text": "Use a picture guide."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "Reviewing a lesson?",
    "options": [
      {
        "profile": "reflective",
        "text": "Write a short summary."
      },
      {
        "profile": "practical",
        "text": "Use it in a task."
      },
      {
        "profile": "visual",
        "text": "Draw the key ideas."
      },
      {
        "profile": "listening",
        "text": "Discuss the key ideas."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "Comparing your options?",
    "options": [
      {
        "profile": "practical",
        "text": "Try each option."
      },
      {
        "profile": "visual",
        "text": "Look at a comparison chart."
      },
      {
        "profile": "listening",
        "text": "Talk about each option."
      },
      {
        "profile": "reflective",
        "text": "Read a pros-and-cons list."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "Learning a new routine?",
    "options": [
      {
        "profile": "visual",
        "text": "See pictures of the steps."
      },
      {
        "profile": "listening",
        "text": "Hear someone explain it."
      },
      {
        "profile": "reflective",
        "text": "Read a checklist."
      },
      {
        "profile": "practical",
        "text": "Rehearse the steps."
      }
    ]
  },
  {
    "scope": "english",
    "prompt": "Remembering new English expressions?",
    "options": [
      {
        "profile": "listening",
        "text": "Hear and repeat them."
      },
      {
        "profile": "reflective",
        "text": "Write meanings and examples."
      },
      {
        "profile": "practical",
        "text": "Use them in a situation."
      },
      {
        "profile": "visual",
        "text": "Link them to pictures."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You are learning about how something works. Which resource would you pick first?",
    "options": [
      {
        "profile": "reflective",
        "text": "An article explaining its parts."
      },
      {
        "profile": "practical",
        "text": "A model or simulation whose parts I can explore."
      },
      {
        "profile": "visual",
        "text": "A labelled diagram showing its parts."
      },
      {
        "profile": "listening",
        "text": "An audio explanation describing its parts."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You want to remember new information for later. Which review activity would you choose?",
    "options": [
      {
        "profile": "practical",
        "text": "Use it in a practice task, then check my attempt."
      },
      {
        "profile": "visual",
        "text": "Draw a visual overview from memory, then check it."
      },
      {
        "profile": "listening",
        "text": "Explain it aloud from memory, then check it."
      },
      {
        "profile": "reflective",
        "text": "Write a summary from memory, then check it."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "During a group learning activity, which contribution would you most enjoy?",
    "options": [
      {
        "profile": "visual",
        "text": "Sketching the ideas so the group can see the connections."
      },
      {
        "profile": "listening",
        "text": "Discussing the ideas and asking follow-up questions."
      },
      {
        "profile": "reflective",
        "text": "Making notes that organise the ideas clearly."
      },
      {
        "profile": "practical",
        "text": "Testing the ideas through a small practical task."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You have been shown a new skill and are ready for more practice. What would you choose next?",
    "options": [
      {
        "profile": "listening",
        "text": "Talk through the skill with someone who can explain it."
      },
      {
        "profile": "reflective",
        "text": "Read instructions explaining the skill in detail."
      },
      {
        "profile": "practical",
        "text": "Make a guided attempt at performing the skill."
      },
      {
        "profile": "visual",
        "text": "Look closely at a visual breakdown of the skill."
      }
    ]
  },
  {
    "scope": "english",
    "prompt": "You are preparing for a conversation in English. What would you prefer?",
    "options": [
      {
        "profile": "reflective",
        "text": "Write some notes and useful phrases to review."
      },
      {
        "profile": "practical",
        "text": "Role-play the situation with different possible replies."
      },
      {
        "profile": "visual",
        "text": "Make a visual outline of the ideas I want to express."
      },
      {
        "profile": "listening",
        "text": "Rehearse the conversation aloud with a partner."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "Someone gives you feedback on a task. How would you prefer to explore it?",
    "options": [
      {
        "profile": "practical",
        "text": "Make another attempt with guidance as I go."
      },
      {
        "profile": "visual",
        "text": "Compare marked examples of my attempt and an improved version."
      },
      {
        "profile": "listening",
        "text": "Discuss the feedback and ask questions about it."
      },
      {
        "profile": "reflective",
        "text": "Read the feedback and note what I want to change."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You are learning the rules of an unfamiliar game. What would you choose first?",
    "options": [
      {
        "profile": "visual",
        "text": "A diagram showing examples of play."
      },
      {
        "profile": "listening",
        "text": "A spoken explanation with time for questions."
      },
      {
        "profile": "reflective",
        "text": "A written explanation of the rules with examples."
      },
      {
        "profile": "practical",
        "text": "A practice round where the rules are explained as we play."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You want to explain something you have learned to another person. What would you prepare?",
    "options": [
      {
        "profile": "listening",
        "text": "An explanation I can give aloud and discuss."
      },
      {
        "profile": "reflective",
        "text": "A short written explanation of the main ideas."
      },
      {
        "profile": "practical",
        "text": "An activity or demonstration we can try together."
      },
      {
        "profile": "visual",
        "text": "A sketch or diagram of the main ideas."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You are learning to follow a sequence, such as a recipe or assembly task. Which guide would you choose?",
    "options": [
      {
        "profile": "reflective",
        "text": "Written instructions for each stage in order."
      },
      {
        "profile": "practical",
        "text": "A guided practice attempt at each stage in order."
      },
      {
        "profile": "visual",
        "text": "Pictures showing each stage in order."
      },
      {
        "profile": "listening",
        "text": "Spoken instructions for each stage in order."
      }
    ]
  },
  {
    "scope": "english",
    "prompt": "You receive feedback on an English sentence. What would you like to do next?",
    "options": [
      {
        "profile": "practical",
        "text": "Repeat the original task using the improvement."
      },
      {
        "profile": "visual",
        "text": "Compare the original and improved versions with changes highlighted."
      },
      {
        "profile": "listening",
        "text": "Hear the improved version and discuss the change aloud."
      },
      {
        "profile": "reflective",
        "text": "Read an explanation and write a new example."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "A topic includes several unfamiliar terms. How would you prefer to organise them?",
    "options": [
      {
        "profile": "visual",
        "text": "Make a visual map linking the terms and examples."
      },
      {
        "profile": "listening",
        "text": "Discuss the terms and explain examples aloud."
      },
      {
        "profile": "reflective",
        "text": "Write definitions and examples in my own words."
      },
      {
        "profile": "practical",
        "text": "Use the terms while working through a relevant task."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You return to something you learned a while ago. What would help you restart?",
    "options": [
      {
        "profile": "listening",
        "text": "Talk through the main points with someone."
      },
      {
        "profile": "reflective",
        "text": "Read my notes or a short written summary."
      },
      {
        "profile": "practical",
        "text": "Try a familiar task to see what I remember."
      },
      {
        "profile": "visual",
        "text": "Review a visual overview of the main points."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You are exploring a subject that interests you. Which activity would you choose?",
    "options": [
      {
        "profile": "reflective",
        "text": "Read a detailed explanation of the subject."
      },
      {
        "profile": "practical",
        "text": "Explore the subject through a small project."
      },
      {
        "profile": "visual",
        "text": "Study an illustrated explanation of the subject."
      },
      {
        "profile": "listening",
        "text": "Listen to a discussion about the subject."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You need to organise your study of a large topic. What would you choose?",
    "options": [
      {
        "profile": "practical",
        "text": "Break the topic into small tasks I can work through."
      },
      {
        "profile": "visual",
        "text": "Map the topic visually into connected sections."
      },
      {
        "profile": "listening",
        "text": "Talk through the sections and my plan for each."
      },
      {
        "profile": "reflective",
        "text": "Write a structured outline and study checklist."
      }
    ]
  },
  {
    "scope": "english",
    "prompt": "You want to understand a short passage in English. Which support would you choose first?",
    "options": [
      {
        "profile": "visual",
        "text": "Pictures or a visual outline of the main ideas."
      },
      {
        "profile": "listening",
        "text": "A recording and a chance to discuss what it means."
      },
      {
        "profile": "reflective",
        "text": "The text and written explanations of unfamiliar phrases."
      },
      {
        "profile": "practical",
        "text": "An activity that puts the meaning into a realistic situation."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "When a task goes wrong, how would you prefer to investigate?",
    "options": [
      {
        "profile": "listening",
        "text": "Talk through what happened and possible explanations."
      },
      {
        "profile": "reflective",
        "text": "Read the instructions again and note possible explanations."
      },
      {
        "profile": "practical",
        "text": "Test one change at a time and observe what happens."
      },
      {
        "profile": "visual",
        "text": "Compare what happened with a diagram of the expected result."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You are given a choice of ways to practise the same topic. Which would you select?",
    "options": [
      {
        "profile": "reflective",
        "text": "Write explanations and work through written examples."
      },
      {
        "profile": "practical",
        "text": "Apply the topic in a realistic activity."
      },
      {
        "profile": "visual",
        "text": "Build a visual explanation using examples."
      },
      {
        "profile": "listening",
        "text": "Discuss examples and explain my reasoning aloud."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "You want to check what you understand without looking at your materials. What would you try?",
    "options": [
      {
        "profile": "practical",
        "text": "Complete a task that requires the information."
      },
      {
        "profile": "visual",
        "text": "Draw a diagram or visual outline from memory."
      },
      {
        "profile": "listening",
        "text": "Explain the topic aloud and answer follow-up questions."
      },
      {
        "profile": "reflective",
        "text": "Write what I remember and answer written questions."
      }
    ]
  },
  {
    "scope": "general",
    "prompt": "After several weeks of learning, how would you prefer to review your progress?",
    "options": [
      {
        "profile": "visual",
        "text": "Compare visual examples of my earlier and current work."
      },
      {
        "profile": "listening",
        "text": "Discuss my earlier and current work with someone."
      },
      {
        "profile": "reflective",
        "text": "Write a reflection comparing my earlier and current work."
      },
      {
        "profile": "practical",
        "text": "Repeat an earlier task and compare how I approach it now."
      }
    ]
  },
  {
    "scope": "english",
    "prompt": "You have a short session to practise English independently. Which plan appeals to you most?",
    "options": [
      {
        "profile": "listening",
        "text": "Listen to a short exchange and record a spoken reply."
      },
      {
        "profile": "reflective",
        "text": "Read a short passage and write a response."
      },
      {
        "profile": "practical",
        "text": "Practise a realistic task, such as asking for help or explaining a problem."
      },
      {
        "profile": "visual",
        "text": "Use a picture or word map to organise ideas, then describe them."
      }
    ]
  }
];
export function learnerQuestionOrder(random=Math.random){const order=learnerQuestions.map((_,i)=>i);for(let i=order.length-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}return order;}

export function scoreLearnerProfile(answers){
 if(!Array.isArray(answers)||answers.length!==learnerQuestions.length||answers.some((answer,index)=>!learnerQuestions[index].options.some(option=>option.profile===answer)))throw new Error('Please complete the assessment before viewing your result.');
 const counts=Object.fromEntries(Object.keys(learnerProfiles).map(key=>[key,0]));answers.forEach(answer=>counts[answer]++);
 const highest=Math.max(...Object.values(counts));const strongest=Object.keys(counts).filter(key=>counts[key]===highest);
 return {counts,strongest,total:answers.length};
}

