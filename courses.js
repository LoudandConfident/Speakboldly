export const courses = [
  {
    "id": "general",
    "title": "General English",
    "level": "Beginner, Intermediate, Advanced",
    "duration": "4 or 8 sessions per month",
    "priceOptions": [
      { "previous": 3500, "amount": 3000, "schedule": "8 sessions per month · twice a week" },
      { "previous": 2500, "amount": 2000, "schedule": "4 sessions per month · once a week" }
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
      { "previous": 900, "amount": 600, "schedule": "2 sessions" }
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
  }
];
export function matches(c,category,query){return(category==='All courses'||c.category===category)&&`${c.title} ${c.level} ${c.description}`.toLowerCase().includes(query.toLowerCase().trim());}
