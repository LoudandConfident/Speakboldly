export const courses = [
  {
    "id": "general",
    "title": "General English",
    "level": "Beginner, Intermediate, Advanced",
    "duration": "4 or 8 sessions per month",
    "priceOptions": [
      {
        "previous": 3500,
        "amount": 3000,
        "schedule": "8 sessions per month · twice a week"
      },
      {
        "previous": 2500,
        "amount": 2000,
        "schedule": "4 sessions per month · once a week"
      }
    ],
    "category": "General English",
    "description": "Build confidence in everyday conversations through private coaching tailored to your level. Develop speaking, listening, vocabulary and grammar with practical activities and personalized feedback.",
    "topics": [
      "Everyday conversations and useful vocabulary",
      "Grammar in real communication",
      "Listening and clear pronunciation",
      "Personalized speaking practice"
    ],
    "art": "general"
  },
  {
    "id": "writing",
    "title": "E-mail and business writing workshop",
    "level": "Intermediate and advanced",
    "duration": "5 sessions",
    "price": 1500,
    "category": "Workshops",
    "description": "Write clear, professional emails and business messages with confidence. Practice choosing the right tone, organizing your ideas, making requests and following up politely.",
    "topics": [
      "Professional emails and appropriate tone",
      "Requests, follow-ups and replies",
      "Clear structure and concise writing",
      "Editing and practical writing feedback"
    ],
    "art": "writing"
  },
  {
    "id": "speaking",
    "title": "Meetings, presentation and public speaking workshop",
    "level": "Intermediate and advanced",
    "duration": "5 sessions",
    "price": 2500,
    "category": "Workshops",
    "description": "Communicate your ideas confidently at work and in front of an audience. Practice contributing to meetings, structuring presentations, handling questions and delivering your message clearly.",
    "topics": [
      "Meeting contributions and professional discussions",
      "Presentation structure and delivery",
      "Public speaking confidence",
      "Handling questions and audience engagement"
    ],
    "art": "speaking"
  },
  {
    "id": "interview",
    "title": "Interview preparation workshop",
    "level": "Intermediate and advanced",
    "duration": "2 sessions",
    "priceOptions": [
      {
        "previous": 900,
        "amount": 600,
        "schedule": "2 sessions"
      }
    ],
    "category": "Workshops",
    "description": "Prepare to express your experience, strengths and goals clearly in English. Develop focused answers to common interview questions and build confidence through realistic practice and feedback.",
    "topics": [
      "Your professional introduction",
      "Answers to common interview questions",
      "Explaining achievements with examples",
      "Mock interviews and personalized feedback"
    ],
    "art": "interview"
  },
  {
    "id": "ielts",
    "title": "IELTS preparation",
    "level": "Advanced level",
    "duration": "8 sessions",
    "category": "IELTS",
    "description": "Prepare for IELTS with focused practice across listening, reading, writing and speaking. Build familiarity with task types, improve your answer structure and time management, and receive personalized feedback on your performance.",
    "topics": [
      "Listening and reading strategies",
      "Writing structure and clear arguments",
      "Speaking practice and personalized feedback",
      "Timed practice and exam preparation"
    ],
    "art": "ielts"
  },
  {
    "id": "pronunciation",
    "title": "Pronunciation workshop",
    "level": "Advanced",
    "duration": "Stay tuned",
    "category": "Workshops",
    "description": "Develop clearer pronunciation through practice with English sounds, word stress, rhythm and intonation.",
    "topics": [
      "Accent and pronunciation development"
    ],
    "art": "pronunciation",
    "comingSoon": true
  },
  {
    "id": "information-technology",
    "title": "English for Information Technology",
    "level": "Beginner, Intermediate, Advanced",
    "duration": "Stay tuned",
    "category": "Others",
    "description": "Build confidence explaining technical ideas, discussing IT projects and communicating with colleagues in English.",
    "topics": [
      "English for IT"
    ],
    "art": "technology",
    "comingSoon": true
  },
  {
    "id": "kids",
    "title": "Let the kids speak!",
    "level": "Beginner, Intermediate, Advanced · Ages 6–14",
    "duration": "Stay tuned",
    "category": "Kids",
    "description": "Help children express themselves in English through playful conversations, stories and age-appropriate speaking activities.",
    "topics": [
      "Ages 6–14"
    ],
    "art": "kids",
    "comingSoon": true
  },
  {
    "id": "instructor-training",
    "title": "Instructor training",
    "level": "Instructors · 0–2 years of experience",
    "duration": "Stay tuned",
    "category": "Training",
    "description": "Before joining, instructors must complete an interview and an English exam. Admission requires a score of at least 93%. After more than 8 years working at Berlitz, Ucan, Oxford Academy, Kayan Academy and Bright Bridges, I am more than happy to share my experience with instructors who share the same vision and want to support others for a living.",
    "topics": [
      "Beginner teachers · 0–2 years of experience"
    ],
    "art": "training",
    "comingSoon": true
  },
  {
    "id": "different-learners",
    "title": "The different learners",
    "level": "Understanding learning preferences",
    "duration": "Stay tuned",
    "category": "Training",
    "description": "Explore visual, auditory, reading and writing, and hands-on learning preferences, with flexible activities that support different learners.",
    "topics": [
      "Understanding learning preferences"
    ],
    "art": "learners",
    "comingSoon": true
  }
];
export function matches(c,category,query){return(category==='All courses'||c.category===category)&&`${c.title} ${c.level} ${c.description}`.toLowerCase().includes(query.toLowerCase().trim());}
