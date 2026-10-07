export const courses = [
  {
    "id": "design",
    "title": "Speak English with confidence",
    "category": "Speaking",
    "icon": "✳",
    "color": "peach",
    "teacher": "Sarah Mitchell",
    "role": "English Conversation Teacher",
    "duration": "4 weeks",
    "level": "Beginner",
    "lessons": [
      "Introduce yourself",
      "Keep a conversation going",
      "Share your opinions",
      "Speak in everyday situations"
    ],
    "description": "Practice everyday English with guided speaking exercises. Build confidence introducing yourself, asking questions, and sharing your ideas."
  },
  {
    "id": "data",
    "title": "Grammar for everyday English",
    "category": "Grammar",
    "icon": "▥",
    "color": "lavender",
    "teacher": "James Chen",
    "role": "English Language Teacher",
    "duration": "6 weeks",
    "level": "Intermediate",
    "lessons": [
      "Choose the right tense",
      "Build clear sentences",
      "Ask better questions",
      "Review common mistakes"
    ],
    "description": "Understand the grammar you need for clear everyday communication. Practice useful sentence patterns, verb tenses, and questions."
  },
  {
    "id": "leadership",
    "title": "Clear English pronunciation",
    "category": "Pronunciation",
    "icon": "↗",
    "color": "green",
    "teacher": "Amara Wilson",
    "role": "English Pronunciation Teacher",
    "duration": "3 weeks",
    "level": "All levels",
    "lessons": [
      "Notice English sounds",
      "Practice word stress",
      "Connect words naturally",
      "Speak with clear rhythm"
    ],
    "description": "Practice sounds, word stress, and rhythm to make your spoken English easier to understand. Use short recording and reflection exercises."
  },
  {
    "id": "marketing",
    "title": "English for your working life",
    "category": "Business English",
    "icon": "◎",
    "color": "yellow",
    "teacher": "Daniel Reyes",
    "role": "Business English Teacher",
    "duration": "4 weeks",
    "level": "Intermediate",
    "lessons": [
      "Introduce yourself at work",
      "Write professional emails",
      "Join a meeting",
      "Prepare for an interview"
    ],
    "description": "Build practical English skills for work. Practice professional introductions, clear emails, meeting contributions, and interview answers."
  }
];
export function progress(course, completed=[]) { return Math.round(course.lessons.filter((_,i)=>completed.includes(i)).length / course.lessons.length * 100); }
export function matches(course, category, query) { return (category==='All courses'||course.category===category) && `${course.title} ${course.teacher} ${course.category}`.toLowerCase().includes(query.toLowerCase().trim()); }
