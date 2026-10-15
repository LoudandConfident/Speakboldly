import {readFileSync,writeFileSync,mkdirSync,readdirSync,unlinkSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {dailyPassages} from '../daily-mission-passages.js';
import {vocabularyFor} from '../daily-mission-vocabulary.js';
import {dailyMission} from '../daily-mission-data.js';
const root=new URL('../',import.meta.url),output=new URL('daily-missions/',root),levels=['foundation','developing','stretching'];
const source=readFileSync(new URL('content/daily-mission-scenarios.txt',root),'utf8');let category='';const scenarios=[];
for(const line of source.split(/\r?\n/)){if(!line.trim())continue;if(line.startsWith('# ')){category=line.slice(2);continue;}const fields=line.split('|');if(fields.length!==5)throw Error('Invalid scenario: '+line);const [title,context,problem,action,benefit]=fields;scenarios.push({title,context,problem,action,benefit,category});}
if(dailyPassages.length!==24||scenarios.length!==159)throw Error('Expected 24 existing and 159 new scenarios.');
const lower=s=>s[0].toLowerCase()+s.slice(1),period=s=>s.replace(/[.!?]+$/,'')+'.';
const gerunds={add:'adding',agree:'agreeing',cancel:'cancelling',label:'labelling',try:'trying'};
function gerund(action){const [verb,...rest]=action.split(' ');return (gerunds[verb]||(verb.endsWith('e')?verb.slice(0,-1)+'ing':verb+'ing'))+' '+rest.join(' ');}
const language={
 foundation:[
 ['We need to','Saying that an action is necessary.',a=>`“We need to ${a},” says one person.`],
 ['Could we','A polite way to suggest an action or ask if it is possible.',a=>`One person asks, “Could we ${a}?”`],
 ['The next step is to','Introducing the action that should happen next.',a=>`The next step is to ${a}.`],
 ['We can','Saying that an action is possible.',a=>`“We can ${a},” one person explains.`],
 ['Let’s','Suggesting that people do something together.',a=>`“Let’s ${a},” one person suggests.`],
 ['It is important to','Introducing something that needs attention.',a=>`It is important to ${a}.`],
 ['First, we should','Suggesting which action to take before other actions.',a=>`“First, we should ${a},” one person says.`],
 ['I would like to','A polite way to say what you want to do.',a=>`One person says, “I would like to ${a}.”`],
 ['We are ready to','Saying that people are prepared to start an action.',a=>`The people involved say, “We are ready to ${a}.”`],
 ['It helps to','Introducing an action that makes a situation easier.',a=>`It helps to ${a}.`],
 ['Our plan is to','Explaining an intended action.',a=>`Our plan is to ${a}.`],
 ['Please','A word used to make a request more polite.',a=>`“Please ${a},” one person asks.`]
 ],
 developing:[
 ['It would be helpful to','Politely suggesting an action that could improve a situation.',a=>`It would be helpful to ${a}.`],
 ['We have agreed to','Reporting a decision that people have made together.',a=>`We have agreed to ${a}.`],
 ['To avoid further confusion','Explaining that an action is intended to prevent more misunderstanding.',a=>`To avoid further confusion, we decide to ${a}.`],
 ['One practical option is to','Introducing a possible action that can realistically be carried out.',a=>`One practical option is to ${a}.`],
 ['Provided that','Introducing a condition that must be met.',a=>`Provided that the people involved agree, we can ${a}.`],
 ['On this occasion','Referring to this particular situation rather than every situation.',a=>`On this occasion, we decide to ${a}.`],
 ['The priority is to','Naming the action that deserves attention first.',a=>`The priority is to ${a}.`],
 ['A useful next step would be to','Suggesting a constructive action without presenting it as the only option.',a=>`A useful next step would be to ${a}.`],
 ['Before we go ahead','Introducing something to consider before proceeding.',a=>`Before we go ahead, we agree to ${a}.`],
 ['In the meantime','Referring to what can happen while something else is being resolved.',a=>`In the meantime, we can ${a}.`],
 ['As a first step','Introducing the beginning of a longer response or process.',a=>`As a first step, we decide to ${a}.`],
 ['Rather than guess','Explaining a preference for checking information instead of assuming it.',a=>`Rather than guess, we decide to ${a}.`]
 ],
 stretching:[
 ['A proportionate response would be to','Proposing an action whose scale fits the problem.',a=>`A proportionate response would be to ${a}.`],
 ['Subject to agreement','Making a proposal conditional on the relevant people accepting it.',a=>`Subject to agreement, the team proposes to ${a}.`],
 ['The recommendation is to','Stating a proposed course of action in formal language.',a=>`The recommendation is to ${a}.`],
 ['On balance','Introducing a judgement made after considering competing factors.',a=>`On balance, the team decides to ${a}.`],
 ['To mitigate the immediate risk','Explaining an action intended to reduce a present source of harm or difficulty.',a=>`To mitigate the immediate risk, the team proposes to ${a}.`],
 ['The proposed course of action is to','Formally introducing an intended response.',a=>`The proposed course of action is to ${a}.`],
 ['Within the agreed scope','Limiting an action to the boundaries that have been accepted.',a=>`Within the agreed scope, the team can ${a}.`],
 ['Pending confirmation','Indicating that a final check or agreement is still needed.',a=>`Pending confirmation of the details, the team plans to ${a}.`],
 ['A defensible recommendation is to','Proposing an action supported by reasons that can be explained.',a=>`A defensible recommendation is to ${a}.`],
 ['In practical terms','Moving from a general idea to what should actually be done.',a=>`In practical terms, the team needs to ${a}.`],
 ['The immediate priority is to','Distinguishing the next urgent action from longer-term work.',a=>`The immediate priority is to ${a}.`],
 ['As a basis for agreement','Presenting a proposal as a starting point for a shared decision.',a=>`As a basis for agreement, the team proposes to ${a}.`]
 ]
};
const reflections={
 foundation:[
 'A clear message helps people understand the plan. It is useful to check the details before taking the next step.',
 'People can ask a question if something is not clear. A short explanation can make the task easier.',
 'It is easier to work when everyone has the same information. A quick check can help people avoid a mistake.',
 'A small change can make a useful difference. It helps to say what will happen next and check that others understand.',
 'The people involved need clear information. They can check the result and ask for help if the problem continues.',
 'A good plan should be easy to understand. People can explain the next action in one or two short sentences.',
 'The first answer may not solve everything. People can check what happened and try a different step if needed.',
 'Listening carefully is useful here. People can ask another question before they decide what to do.',
 'Small details can change a plan. Checking them now can make the next task easier.',
 'A polite question can help people work together. Clear information makes the next step easier to choose.',
 'The aim is to solve the problem with a clear action. People can check afterwards that the action helped.',
 'It helps to explain the reason for a change. Other people can then understand the plan and prepare for it.'
 ],
 developing:[
 'Before proceeding, the people involved should check that they share the same understanding. If the first response does not resolve the problem, they can review the result and consider a different option. A clear explanation makes the next decision easier.',
 'The response should be practical enough to carry out and clear enough for others to follow. It helps to confirm the important details rather than assume that everybody already knows them. Afterwards, the result can be compared with the original purpose.',
 'A useful decision takes account of the information available at the time. If an important detail changes, it may be sensible to review the plan. Explaining the reason for the decision helps other people understand when a different approach might be needed.',
 'The people involved can make progress by separating the immediate action from questions that still need an answer. This prevents an incomplete explanation from becoming an unrealistic promise. A brief follow-up can establish whether the proposed response actually helped.',
 'Good communication includes both a clear action and a reason for taking it. The people affected should have an opportunity to raise a relevant concern. Checking the result afterwards turns an ordinary task into a useful source of learning.',
 'The aim is to make the next step easier to understand and carry out. A short message confirming the arrangement can reduce the chance of different assumptions. If the outcome is less useful than expected, the explanation and the plan can be revised.',
 'It is important to make a realistic commitment. The people involved can identify what they know, ask about anything uncertain, and agree on the next action. This approach is more reliable than giving an immediate answer that has not been checked.',
 'A decision is easier to review when its purpose is clear. The people involved can explain what they expect to improve and check whether that improvement occurs. They can then keep the useful part of the approach and change anything that does not work.',
 'The response should fit the actual need, rather than simply repeat a familiar routine. Asking one relevant follow-up question can reveal an important detail. The final arrangement should be checked with the people who will need to use it.',
 'A practical plan leaves room for information to change. The people involved should explain any uncertainty that could affect others and avoid treating an estimate as a guarantee. Once the action has been taken, a short check can confirm the result.',
 'The next step should be specific enough for someone to act on it. It is useful to say who will do what and when an update is needed. That small amount of coordination can prevent a simple task from becoming a larger misunderstanding.',
 'The situation provides an opportunity to practise a transferable habit: ask, check, act, and review. A useful response addresses the immediate issue while leaving the people involved better informed. The result can then guide the next decision.'
 ],
 stretching:[
 'The expected benefit should be treated as a proposition to evaluate, rather than as an automatic consequence of agreement. Any material assumption needs to be explicit, and the people affected should know how an unresolved dependency will be handled. If the response falls short, the team should review the evidence and revise the approach.',
 'A credible commitment depends on a shared understanding of the constraint and the resources available to address it. The team should distinguish what has been confirmed from what remains provisional. A defined review point allows the proposed response to be evaluated against its intended outcome and adjusted proportionately.',
 'The recommendation is stronger when its reasoning and its limits are both visible. The relevant stakeholder should be able to identify the immediate action, the assumption supporting it, and the condition that would justify reconsideration. Accountability includes checking whether the expected benefit actually materialises.',
 'Implementation should preserve the link between the original problem and the proposed remedy. A clear owner and a proportionate check can reduce uncertainty without adding unnecessary procedure. If new evidence challenges an important assumption, the response should be revisited before the initial judgement becomes an unexamined routine.',
 'The value of this response lies partly in the uncertainty it removes for others. The team should communicate any remaining limitation, explain the basis for its commitment, and identify how the result will be reviewed. This makes coordination possible while avoiding a degree of confidence that the available evidence cannot support.',
 'A useful professional judgement makes its trade-off open to scrutiny. The people responsible should state the intended outcome and the practical condition on which delivery depends. Follow-up should establish whether the remedy addressed the actual need, rather than merely whether the planned action was completed.',
 'The action should be assessed against the purpose of the task and the needs of the people affected. A defensible decision remains open to revision when a material assumption changes. Documenting the reasoning creates a basis for learning and reduces the risk of repeating a process whose usefulness has not been established.',
 'The team should make the scope of its commitment clear and avoid transferring an unresolved dependency to someone who cannot control it. A proportionate review can test whether the response worked under the actual conditions. Any adjustment should follow from the evidence rather than from a wish to defend the original plan.',
 'The decision provides a basis for coordinated action, but its adequacy still requires evaluation. A relevant stakeholder should understand the expected benefit, the outstanding uncertainty, and the next point for review. That distinction between agreement and verified effectiveness is central to reliable professional communication.',
 'The proposed response needs enough precision to guide action without implying that every uncertainty has disappeared. Responsibility, timing, and the relevant constraint should be made explicit. If the result differs from the expectation, the team can examine the underlying assumption and revise the approach on an informed basis.',
 'A sustainable remedy should improve the immediate situation without creating disproportionate work elsewhere. The team should check the effect on the people who depend on the outcome and agree how concerns will be raised. This turns a local decision into a transparent and reviewable commitment.',
 'The effectiveness of the response depends on how well it addresses the actual constraint. The team should explain the reasoning, identify a meaningful signal of progress, and revisit any assumption that proves unreliable. A concise record of that evaluation can inform the handling of a similar situation later.'
 ]
};
function grammar(action,level,n){const g=gerund(action);const banks={
 foundation:[
 [`We can to ${action}.`,`We can ${action}.`,'Use the base form of the verb without to after can.'],
 [`We will to ${action}.`,`We will ${action}.`,'Use the base form without to after will.'],
 [`We would like ${action}.`,`We would like to ${action}.`,'Use would like to followed by the base form of the verb.'],
 [`We are going ${action}.`,`We are going to ${action}.`,'Use going to followed by the base form to describe this plan.'],
 [`We did not to ${action}.`,`We did not ${action}.`,'Use the base form without to after did not.'],
 [`We need ${action}.`,`We need to ${action}.`,'Use need to followed by a verb when describing a necessary action.']
 ],
 developing:[
 [`We look forward to ${action}.`,`We look forward to ${g}.`,'In look forward to, to is a preposition. Follow it with a noun or an -ing form.'],
 [`We suggested to ${action}.`,`We suggested ${g}.`,'Suggest can be followed by an -ing form rather than a to-infinitive.'],
 [`Before to ${action}, we should check the details.`,`Before ${g}, we should check the details.`,'After the preposition before, use an -ing form when there is no subject and finite verb.'],
 [`We agreed ${action}.`,`We agreed to ${action}.`,'Use agree to followed by the base form to describe agreeing to do something.'],
 [`We are responsible to ${action}.`,`We are responsible for ${g}.`,'Use responsible for followed by a noun or an -ing form for this meaning.'],
 [`If we will ${action}, the next step will be clearer.`,`If we ${action}, the next step will be clearer.`,'In this first conditional, use the present simple in the if-clause and will in the result clause.']
 ],
 stretching:[
 [`Only after the review we decided to ${action}.`,`Only after the review did we decide to ${action}.`,'An initial only after phrase triggers subject–auxiliary inversion in the main clause: did we decide.'],
 [`Not until the details were confirmed we agreed to ${action}.`,`Not until the details were confirmed did we agree to ${action}.`,'After initial not until, invert the auxiliary and subject in the main clause.'],
 [`Under no circumstances we should ignore the need to ${action}.`,`Under no circumstances should we ignore the need to ${action}.`,'Initial negative adverbials such as under no circumstances require subject–auxiliary inversion.'],
 [`No sooner we had agreed to ${action} than the situation changed.`,`No sooner had we agreed to ${action} than the situation changed.`,'Use inversion after initial no sooner, followed by than to connect the closely timed events.'],
 [`The recommendation is that the team to ${action}.`,`The recommendation is that the team ${action}.`,'A mandative that-clause can use the bare subjunctive. Do not put to before its verb.'],
 [`The team agreed on ${action}.`,`The team agreed on ${g}.`,'When on is a preposition before an action, use an -ing form rather than a bare infinitive.']
 ]};const [mistake,answer,explanation]=banks[level][n%6];return {mistake,correction:answer+' '+explanation};}
function activities(level,title,phrase){return {
 say:level==='foundation'?`Read the paragraphs aloud. Then speak for about 30 seconds about ${lower(title)}. Use short sentences and name the main problem.`:level==='developing'?`Read the paragraphs aloud with natural pauses. Then give a 30-second explanation of ${lower(title)}, including the problem, the response, and a reason.`:`Read the passage as a professional briefing. Then summarise ${lower(title)} in 30 seconds, distinguishing the proposed action from the outcome that still needs to be verified.`,
 use:level==='foundation'?`Use “${phrase}” in one sentence about a similar situation in your own day. Say a short reply as well.`:level==='developing'?`Use “${phrase}” in a short exchange about ${lower(title)}. Add a relevant detail and explain why your suggestion would help.`:`Use “${phrase}” in a concise professional recommendation about ${lower(title)}. State a condition or trade-off, then give an appropriate response to a follow-up question.`,
 recall:level==='foundation'?`Hide the reading. Say three words you remember about ${lower(title)}, then explain the main idea in two short sentences. Reveal the reading and check.`:level==='developing'?`Hide the reading. Retell ${lower(title)} using the problem, the action, and the expected benefit. Reveal the text and check whether you kept the facts accurate.`:`Hide the reading. Reconstruct the issue, recommendation, and qualification in ${lower(title)}. Reveal the text and check whether you represented both the reasoning and its limits accurately.`};}
function originalMission(topic,index,level){const reading=topic.levels[levels.indexOf(level)],sentences=reading[0].match(/[^.!?]+[.!?]+[”"’']?/g)||[reading[0]],paragraphs=[];for(let part=0;part<3;part++)paragraphs.push(sentences.slice(Math.floor(part*sentences.length/3),Math.floor((part+1)*sentences.length/3)).join(' ').trim());let correction;for(let offset=0;offset<7;offset++){const candidate=dailyMission(new Date(Date.UTC(2026,0,1+index+offset)).toISOString().slice(0,10),level);if(candidate.type==='Fix it'){correction=candidate;break;}}
 return {title:topic.title,paragraphs,transcript:reading[0],phrase:reading[1],question:reading[2],answer:reading[3],vocabulary:vocabularyFor(reading[0],level),mistake:correction.instruction.match(/“([^”]+)”/)?.[1]||'',correction:correction.model,...activities(level,topic.title,reading[1]),source:'original-24'};}
function newMission(s,index,level){const n=index%12,[phrase,meaning,actionSentence]=language[level][n],r=reflections[level][n];let paragraphs;
 if(level==='foundation')paragraphs=[period(s.context)+' '+period(s.problem),actionSentence(s.action)+' '+period(s.benefit),r];
 else if(level==='developing')paragraphs=[period(s.context)+' '+period(s.problem)+' The people involved need enough information to choose a practical response.',actionSentence(s.action)+' The expected benefit is that '+period(lower(s.benefit))+' This gives the response a clear purpose that can be checked afterwards.',r];
 else paragraphs=[period(s.context)+' '+period(s.problem)+' The issue calls for a judgement about the relevant constraint and the effect of leaving it unresolved.',actionSentence(s.action)+' The expected benefit is that '+period(lower(s.benefit))+' The rationale should be explained to any stakeholder whose work or plans depend on the outcome.',r];
 const transcript=paragraphs.join(' '),terms=vocabularyFor(transcript,level).filter(v=>v.word.toLowerCase()!==phrase.toLowerCase());const vocabulary=[{word:phrase,definition:meaning},...terms.slice(0,2)];if(vocabulary.length!==3)throw Error('Missing vocabulary: '+s.title+' '+level);
 const questions=[['What problem needs to be resolved?',period(s.problem)],['What action is proposed?',period('The proposed action is to '+s.action)],['What benefit is expected from this response?',period(s.benefit)]];const [question,answer]=questions[index%3];return {title:s.title,category:s.category,paragraphs,transcript,phrase,question,answer,vocabulary,...grammar(s.action,level,index),...activities(level,s.title,phrase),source:'new-scenario'};}
mkdirSync(output,{recursive:true});const manifest={version:'half-year-2026-v1',startDate:'2026-10-15',totalDays:183,originalDays:24,newDays:159,chunkSize:31,levels:{}};
for(const level of levels){const dir=new URL(level+'/',output);mkdirSync(dir,{recursive:true});for(const file of readdirSync(dir))if(file.endsWith('.json'))unlinkSync(new URL(file,dir));const missions=[...dailyPassages.map((p,i)=>originalMission(p,i,level)),...scenarios.map((s,i)=>newMission(s,i,level))].map((m,i)=>({id:manifest.version+':'+level+':'+String(i+1).padStart(3,'0'),number:i+1,level,...m}));
 if(missions.length!==183||new Set(missions.map(m=>m.transcript)).size!==183)throw Error('Reading count or duplicates: '+level);
 manifest.levels[level]={count:missions.length,chunks:[]};for(let start=0;start<missions.length;start+=31){const file=String(Math.floor(start/31)+1).padStart(2,'0')+'.json';writeFileSync(new URL(file,dir),JSON.stringify({version:manifest.version,level,missions:missions.slice(start,start+31)})+'\n');manifest.levels[level].chunks.push({file,count:missions.slice(start,start+31).length});}
}
writeFileSync(new URL('index.json',output),JSON.stringify(manifest,null,2)+'\n');console.log('Built 183 daily sets per level: 549 sets, 1,647 paragraphs.');
