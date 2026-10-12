// Student-only transcription of the six existing exam PDFs. No answer keys or teacher scripts.
const lines=text=>text.trim().split('\n').map(line=>line.trim()).filter(Boolean);
function exam(level,choices,corrections,reading,readingQuestions,listening,writing){
 return {level,title:`Level ${level} exam`,questions:lines(choices).map((line,i)=>{const [question,...options]=line.split('|').map(part=>part.trim());return {number:i+1,question,options};}),sections:{
 B:{title:'B. Correct the Mistakes',intro:['Each sentence has a mistake. Rewrite the whole sentence correctly.'],questions:lines(corrections).map((text,i)=>`${i+1}. ${text}`)},
 C:{title:'C. Reading Comprehension',intro:reading.trim().split('\n\n'),questions:lines(readingQuestions).map((text,i)=>`${i+1}. ${text}`)},
 D:{title:'D. Listening & Summary',intro:[listening],questions:[]},
 E:{title:'E. Writing Task',intro:writing.trim().split('\n\n'),questions:[]}
 }};
}
export const LEVEL_EXAM_TEXT=[
exam(1,`
My sister _____ in a bank. | work | works | working
_____ you from Egypt? | Is | Are | Am
I’d like _____ orange juice, please. | a | an | some
What _____ you like for dinner? | would | do | are
There _____ a pharmacy next to the hotel. | are | is | be
The bank is _____ the post office and the supermarket. | between | under | at
Look! They _____ tennis. | play | are playing | played
We _____ to London last year. | go | went | are going
Where _____ you yesterday afternoon? | was | were | are
She _____ speak English and French. | can | cans | can to
I have a bad headache. You _____ take some aspirin and rest. | should | are | would
My father has two _____. | childs | children | childrens
These shoes are nice. How much _____? | are they | is it | they are
I usually _____ my e-mail in the morning. | check | checks | am checking
We _____ dinner at a restaurant last night. | have | had | has
_____ straight ahead, then turn left. | Go | Goes | Going
He _____ at home last night; he was at the office. | wasn't | weren't | isn't
What _____ your mother look like? | do | does | is
I’m _____ a blue jacket today. | wear | wore | wearing
Would you like _____ with me this weekend? | go out | to go out | went out
`, `
She work in a department store.
Where you are from?
I would like an coffee, please.
There are a bank on Main Street.
He don't speak Japanese.
We was at the restaurant yesterday.
I goed to the movies last Saturday.
She can to use a computer.
Those shirt is very expensive.
What were you do at 8:00 last night?
`, `Daniel works for a small computer company in Cairo. He is a sales assistant, and he usually starts work at nine o’clock. He speaks to customers, answers e-mails, and sometimes visits other companies. Daniel likes his job because he meets many different people.

Last Thursday was very busy. Daniel had a meeting in the morning and visited a customer after lunch. He left the office at 5:30. In the evening, he met his sister at a restaurant. They had dinner and talked about their plans for the weekend.

This weekend, Daniel is going to Alexandria with two friends. They are leaving on Friday morning by car. Daniel wants to swim and relax, but one of his friends wants to visit museums. They are coming back on Sunday evening.`, `
Where does Daniel work?
What does he do at work? Give two examples.
Why does Daniel like his job?
What did Daniel do last Thursday morning?
Where did he go in the evening?
Who is Daniel going to Alexandria with?
When are they leaving?
What does Daniel want to do there?
When are they coming back?
Write one sentence from the passage that talks about the past.
`, 'Your teacher will read a short passage aloud. Listen carefully. Do not write while the teacher is reading the first time. Then write a short summary in your own words.\n\nYour summary should include the main person, place, important events, and plans.', `Write a short paragraph about yourself and your life. Include information about:

• your name and where you are from
• your work or studies and what you usually do
• something you did last weekend
• something you are doing or planning for next weekend
• one activity you can do well

Use complete sentences and connect your ideas.`),
exam(2,`
I _____ to Paris next Monday. My ticket is already booked. | fly | am flying | flew
The train _____ every thirty minutes. | runs | is running | ran
How long _____ to get to the airport? | does it take | it takes | is it taking
Don’t worry. I _____ you when I arrive. | call | called | will call
Last month, I _____ a client in Dubai. | meet | met | meeting
Sara is the manager _____ is responsible for training. | who | which | where
Mr. Ali is _____ the Sales Department. | in charge of | charge in | responsible of
We don’t have _____ time to visit another museum. | enough | too many | many
You _____ take a jacket in case it gets cold. | should | may to | have
_____ I carry your bags to your room? | Shall | Do | Am
This is _____ hotel in the city. | the most expensive | more expensive | most expensive
I feel like _____ Italian food tonight. | eat | eating | to eat
This restaurant isn’t _____ the one we visited yesterday. | as good as | good as | as good
I _____ tea to coffee. | prefer | would like | rather
You _____ show your passport at check-in. | have to | don’t have to | shouldn’t
I hurt my leg while I _____ tennis. | played | was playing | am playing
You _____ take antibiotics without a doctor’s advice. | shouldn’t | don’t have to | shall
I _____ reading historical books. | enjoy | enjoy to | am enjoy
I’d rather watch a movie _____ go to a concert. | than | to | from
My grandfather _____ listen to the radio every evening. | used to | use to | was used
`, `
I am usually taking the train to work.
The flight will arrives at 8:30.
How long it takes to get to the hotel?
She is responsible of answering customer complaints.
We didn't went on a business trip last month.
There are too much people in this restaurant.
This hotel is the more comfortable hotel in town.
I feel like to eat something spicy.
I was drive home when the accident happened.
I used to playing tennis when I was younger.
`, `Emma works for a medium-sized international company that sells medical equipment. She is responsible for customer service and often travels to meet clients. Last week, she went to Rome for a two-day business trip. Her flight was delayed, so she arrived at her hotel much later than expected.

The next morning, Emma met a client at his office. They discussed a new order and had lunch at a small restaurant nearby. Emma thought the restaurant was excellent. It was not as expensive as her hotel restaurant, and the service was much faster.

Emma is traveling again next month. She is going to Berlin for a conference. Her company has already booked her flight and a three-night stay at a hotel near the conference center. She plans to take a warm coat because the weather may be cold. If she has enough free time, she would also like to visit a museum.`, `
What kind of company does Emma work for?
What is Emma responsible for?
Why did she go to Rome?
What problem did she have with her flight?
What did Emma and the client discuss?
How did the small restaurant compare with the hotel restaurant?
Where is Emma going next month?
How long is she staying at the hotel?
Why does she plan to take a warm coat?
What would she like to do if she has enough free time?
`, 'Your teacher will read a short passage aloud twice. Listen carefully, then write a short summary in your own words. Include the main situation, important events, and the final plan or result.', `Write about a trip you took in the past OR a trip you are planning. Write a connected paragraph. Include:

• where you went / are going and why
• how you traveled / are traveling
• where you stayed / are going to stay
• what happened on the trip OR what you plan to do
• one recommendation or piece of advice for someone taking the same trip

Use a variety of Level 2 grammar and vocabulary.`),
exam(3,`
Have you _____ been to Italy? | ever | yet | since
I _____ at this company for three years. | worked | have worked | am working yesterday
We _____ the new manager at the conference last week. | have met | met | meet
I’ve _____ finished the report. | yet | just | since
She hasn’t called the client _____. | already | yet | ever
I suggest _____ the museum early in the morning. | visit | visiting | to visiting
The Taj Mahal _____ in the seventeenth century. | completed | was completed | is completing
This painting _____ by a famous French artist. | was painted | painted | was painting
_____ is a great way to see the countryside. | Hiking | Hike | Hiked
That was one of _____ trips I’ve ever taken. | the best | better | best
I looked _____ for my passport, but I couldn’t find it. | everywhere | nowhere | someone
The soup was _____ delicious that we ordered another bowl. | such | so | too
At this time tomorrow, we _____ over the Atlantic. | will fly | will be flying | flew
This suitcase isn’t mine. It’s _____. | her | hers | she
The agent said _____ the flight was delayed. | that | what | to
I need to _____ my car repaired before the trip. | have | make | do
The clerk told me _____ the form before returning the car. | sign | to sign | signing
Don’t use your phone while _____. | drive | driving | drove
I haven’t seen a good movie _____. | recently | tomorrow | next week
The proposal _____ already been submitted. | has | have | is
`, `
Have you ever went to New York?
I have seen him yesterday.
She has worked here since five years.
I suggest to take a taxi.
The museum was build in 1920.
This bag is my. Yours is over there.
The agent told me return the car with a full tank.
I had the mechanic to check the brakes.
I haven't been to the theater lately ago.
The final report have been completed.
`, `Olivia has worked for an international events company for four years. She has organized conferences in several countries, but until this year she had never worked on an event in Japan. Last month, her company sent her to Tokyo to help organize a technology conference.

Before the conference, Olivia had a very busy schedule. She had the hotel staff prepare two large meeting rooms, and she asked a local printing company to print the programs. The final schedule was changed twice, but everything was ready by Friday afternoon. The conference was attended by more than 600 people.

After the event, Olivia stayed in Tokyo for two extra days. She visited several famous sights and tried Japanese food. She especially enjoyed visiting an old temple outside the city. She said the trip was so interesting that she would like to return. Next month, however, she will be working on a new project in Madrid. The project plan has already been approved, but the team still has to finish the budget.`, `
How long has Olivia worked for the events company?
Had she worked on an event in Japan before this year?
Why did she go to Tokyo?
What did she have the hotel staff do?
Who printed the conference programs?
How many people attended the conference?
What did Olivia do after the event?
What did she especially enjoy?
Where will she be working next month?
What has already been approved, and what still needs to be finished?
`, 'Your teacher will read a passage aloud twice. Listen carefully, then summarize it in your own words. Include the main situation, the problem or important events, and the final result or plan.', `Write about a memorable experience you have had. It may be a trip, an event, a restaurant experience, a performance, or another important experience.

Include:
• what the experience was and when it happened
• where it took place and who was with you
• what happened
• what you liked or disliked and why
• whether you would do it again

Use both the present perfect and the simple past where appropriate. Try to use other Level 3 structures and vocabulary.`),
exam(4,`
The company anniversary party _____ at the Grand Hotel next Friday. | will hold | will be held | is holding
“Would you care to join us for dinner?” is a _____ invitation. | formal | careless | negative
Laura said she _____ a previous engagement and couldn’t attend. | has | had | will have
If the invitation says “black tie,” you _____ wear formal clothes. | should | would have | used to
If I finish the report early, I _____ you with the presentation. | helped | will help | would help
He asked if he _____ borrow my laptop for the afternoon. | could | can | will
I promise I’ll send you the documents _____ 24 hours. | within | since | during
I’m sorry _____ missing your call yesterday. | for | about to | of
Online prices are getting _____ competitive. | more and more | most and most | much and much
The replacement product is very similar _____ the original one. | with | to | from
The airline _____ have informed us about the cancellation earlier. | should | must | can
The hotel _____ we stayed in was extremely noisy. | who | where that | that
I was very disappointed _____ the service. | in | to | on
Be careful, or you might hurt _____. | yourself | you | your
The injured passenger _____ to the hospital right now. | is taking | is being taken | has taken
She _____ as a graphic designer for the last six years. | has been working | worked since | is work
If I _____ more money, I would put some of it into savings. | have | had | will have
I wish I _____ afford a new car. | can | could | will
_____ solar energy can be expensive to install, it can reduce electricity costs later. | Although | Because of | Thanks to
By the time the firefighters arrived, everyone _____ the building. | left | had left | has left
`, `
The invitations will send out tomorrow.
He said he can't come because he had other plans.
If I will have time, I will help you.
She asked me if she can borrow my phone.
I apologize about arriving late.
The airline should gave us a refund.
I have been work here since 2021.
If I would have more money, I would travel more.
I wish I can save more every month.
By the time we arrived, the meeting already started.
`, `Last month, Maya traveled to Vancouver for an international conference on renewable energy. She had been looking forward to the trip because she has been working on environmental projects for several years. Unfortunately, her journey did not begin well. The flight she was booked on was canceled because of bad weather, and the airline could not offer another flight until the following morning.

Maya was disappointed with the way the situation was handled. She felt the airline should have provided clearer information and accommodation for passengers who had been delayed overnight. She submitted a complaint online and was later offered a travel voucher.

By the time Maya arrived in Vancouver, the opening session had already finished. However, she attended the rest of the conference and met several experts in solar and wind energy. One speaker explained that although renewable energy systems can be expensive at first, costs have been falling thanks to improvements in technology.

After returning home, Maya gave her manager an update. She said the conference had been useful and suggested that her company invest more in energy-saving equipment. If the company had a larger environmental budget, she said, it could make several changes immediately.`, `
Why had Maya been looking forward to the conference?
Why was her original flight canceled?
When could the airline offer her another flight?
What did Maya think the airline should have done?
What happened after she submitted a complaint?
What had happened by the time Maya arrived in Vancouver?
What kinds of energy did the experts discuss?
According to one speaker, why have renewable-energy costs been falling?
What did Maya suggest to her manager?
What could the company do if it had a larger environmental budget?
`, 'Your teacher will read a passage aloud twice. Listen carefully, then write a summary in your own words. Include the main situation, the problem, how people reacted, and the final result or recommendation.', `Write about ONE of the following situations:

Option 1: Describe a problem you had with a product, hotel, airline, service, or purchase. Explain what happened, how you felt, what the company should have done, and how the problem was solved.

Option 2: Imagine you want to make an important change in your life, career, finances, or environment. Explain what you would change, why, and what you would do if you had the opportunity.

Use connected paragraphs and appropriate Level 4 grammar and vocabulary.`),
exam(5,`
I _____ travel for work, but I’m staying in Cairo this month. | routinely | right now | yesterday
While I _____ in London, I met one of my closest friends. | worked | was working | have worked
She’s responsible _____ training new employees. | to | for | with
I’m not accustomed to _____ such long hours. | work | working | worked
Our company is one of _____ manufacturers in the region. | the leading | more leading | most lead
I enjoy _____ outdoors when the weather is good. | exercise | exercising | to exercising
We agreed _____ at the station at six. | meeting | meet | to meet
I stopped _____ coffee because it was affecting my sleep. | drinking | to drink | drink
A microwave is an appliance _____ cooks food quickly. | who | that | where
Before _____ a food product, always check the label. | buying | buy | bought
If I _____ you, I’d exercise a little more regularly. | am | were | would be
Reservations _____ online or by phone. | can make | can be made | can be making
The Eiffel Tower _____ by millions of tourists every year. | visits | is visited | was visiting
The monument _____ more than a century ago. | was built | is built | has build
He isn’t answering his phone. He _____ have left it at home. | must | must to | should
The figures are completely different. The report _____ have been correct. | can’t | must | should
If she exercised more, she _____ feel healthier. | will | would | had
A sales clerk is someone _____ helps customers in a store. | which | who | whose it
_____ leaving the hotel, make sure you have your passport. | Before | During | While to
I couldn’t agree _____ you more. | to | with | for
`, `
I am normally going to work by metro.
While I worked in Dubai, I was meeting my husband.
She is responsible to organize the weekly meetings.
He suggested to go to the gym after work.
I stopped to eat fast food because I wanted to be healthier.
A pharmacist is a person which prepares and sells medicine.
Before to buy packaged food, read the nutrition label.
If I would be you, I would speak to a doctor.
The tickets can bought online.
The article mustn't have been true; every fact in it was wrong.
`, `Three years ago, Daniel moved from Brazil to Canada for a new job. At first, he was excited about living abroad. He enjoyed exploring the city, meeting new colleagues, and trying unfamiliar food. After a few months, however, he began to feel homesick. He missed his family, the warm weather, and speaking Portuguese every day.

Daniel decided that he needed to make some changes. A coworker suggested joining a local sports club, so he started playing volleyball twice a week. He also began cooking Brazilian meals for friends. If he felt lonely at the weekend, he would video-call his family or invite someone out for coffee. Gradually, Canada began to feel more like home.

Last summer, Daniel’s parents visited him. Before arriving, they had made all their travel arrangements online. Daniel showed them several famous sights, including a historic building that was constructed in the nineteenth century. His parents were impressed by how comfortable he had become in his new country.

Daniel says that living abroad has taught him to be more independent. He still misses Brazil now and then, but he no longer regrets moving. In fact, if a friend asked him whether they should live abroad for a while, he would recommend trying it.`, `
Why did Daniel move to Canada?
What did he enjoy when he first arrived?
What did he begin to miss after a few months?
What did his coworker suggest?
How often did Daniel play volleyball?
What did he do when he felt lonely at the weekend?
How had Daniel’s parents arranged their trip?
What kind of place did Daniel show his parents?
What has living abroad taught Daniel?
What advice would he give a friend who was considering living abroad?
`, 'Your teacher will read a passage aloud twice. Listen carefully, then summarize it in your own words. Include the main topic, important details, any advice or opinions given, and the final result.', `Write an opinion post about ONE of the topics below:

• Living abroad is one of the best ways to learn about another culture.
• People should pay more attention to food labels and healthy habits.
• Famous tourist attractions are worth visiting even when they are crowded.
• Social media is a good place to discuss important opinions.

Clearly state your opinion, give reasons and examples, acknowledge another point of view if possible, and finish with a clear conclusion. Use appropriate Level 5 grammar and vocabulary.`),
exam(6,`
Julia is _____ outgoing, but she can be quiet around strangers. | quite | enough | much
The new assistant is not _____ organized as the previous one. | more | as | so much
Would you mind _____ me how long you’ve been studying English? | tell | telling | to tell
If I _____ that job abroad, I would never have met my husband. | hadn’t accepted | didn’t accept | wouldn’t accept
My manager suggested that I _____ for the position. | apply | applied | to apply
You look exhausted. It _____ like you haven’t slept much. | sounds | looks | feels
The doctor advised him _____ strenuous exercise for a week. | avoiding | to avoid | avoid
Sorry to interrupt, but could you _____ what you mean? | clarify | clear | clarification
We’re going to have the kitchen _____. | repaint | repainted | repainting
There was _____ heavy snow that all flights were canceled. | so | such | such a
The temperature is getting _____ every summer. | hotter and hotter | more hot | hottest
It is essential that every country _____ its carbon footprint. | reduces | reduce | reduced
Housing prices have risen _____. | significant | significantly | significance
There has been a significant _____ in food prices. | increase | increased | increasingly
Taking the train is not nearly _____ expensive as flying. | more | as | so much
He is constantly _____ me what to do, and it drives me crazy. | tell | telling | told
_____ failing several times, she refused to give up. | Despite | However | Although of
I hope to start my own business _____ day. | some | someday | for now
Could you please point _____ the error in this email? | out | up | over
If I _____ in your shoes, I’d take the subway during rush hour. | am | were | had been
`, `
He is quite a dependable person, but he isn't as patient than his brother.
Would you mind to tell me why you want to learn Spanish?
If I had stayed at home, I wouldn't met my best friend.
The recruiter recommended me to update my résumé.
She looks like she is feeling much better today.
The doctor advised that he to rest for several days.
We are going to get the roof repair next week.
It was so terrible weather that we stayed indoors.
It is essential that the government reduces pollution immediately.
Riding a bike is nearly as cheaper as taking the bus.
`, `Two years ago, Marcus decided to make a major change in his life. He had been working for the same company for almost ten years, but he no longer found the job meaningful. A friend suggested that he apply for a position with a non-profit organization that helps young people develop job skills. Marcus hesitated at first because the salary was lower. If he had focused only on money, he probably would have stayed in his old job.

Eventually, Marcus accepted the position. The first few months were fairly challenging, but he gradually became more confident. He now coordinates training programs and regularly gives presentations. He says the work is demanding; however, it is much more rewarding.

Recently, the organization has been trying to reduce its environmental impact. It has had energy-efficient lights installed and encourages employees to use public transportation. Marcus usually takes the train because driving is not nearly as convenient during rush hour. He believes it is essential that businesses take practical steps to reduce waste and energy use.

Marcus says changing careers was one of the best decisions he has made. Had he ignored his friend's advice, he says, he might still be wondering whether he should do something different with his life.`, `
Why did Marcus want to change jobs?
What kind of organization did his friend recommend?
Why did Marcus hesitate at first?
What might have happened if he had focused only on money?
What does Marcus do in his current job?
How does he feel about his work now?
What has the organization done to reduce its environmental impact?
Why does Marcus usually take the train?
What does he believe businesses should do?
According to Marcus, what might have happened if he had ignored his friend's advice?
`, 'Your teacher will read a passage aloud twice. Listen carefully, then summarize it in your own words. Include the main situation, important details, any problem or change, and the final result or opinion.', `Write about a major turning point, ambition, or change in your life. It can be real or imaginary.

Explain what happened, what influenced your decision, and how things might have been different if you had made another choice. Describe your current situation and what you hope to achieve in the future. Use connected paragraphs and appropriate Level 6 grammar and vocabulary.`)
];
export function getLevelExamText(level){return LEVEL_EXAM_TEXT.find(exam=>exam.level===Number(level));}
