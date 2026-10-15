import {dailyPassages} from './daily-mission-passages.js?v=five-practices';
import {vocabularyFor} from './daily-mission-vocabulary.js?v=five-practices';
import {dailyMission,missionLevels} from './daily-mission-data.js?v=five-practices';
export function dailyMissionSet(day,level='foundation'){
 if(!Object.hasOwn(missionLevels,level))level='foundation';
 const legacy=dailyMission(day,level),ordinal=Math.floor(Date.parse(day+'T12:00:00Z')/86400000),index=((ordinal-Math.floor(Date.UTC(2026,0,1)/86400000))%dailyPassages.length+dailyPassages.length)%dailyPassages.length;
 const topic=dailyPassages[index],reading=topic.levels[['foundation','developing','stretching'].indexOf(level)],sentences=reading[0].match(/[^.!?]+[.!?]+[”"’']?/g)||[reading[0]],paragraphs=[];
 for(let part=0;part<3;part++){const start=Math.floor(part*sentences.length/3),end=Math.floor((part+1)*sentences.length/3);paragraphs.push(sentences.slice(start,end).join(' ').trim());}
 // Use the established level-specific correction bank, independently of its old rotation.
 let correction;for(let offset=0;offset<7;offset++){const date=new Date(day+'T12:00:00Z');date.setUTCDate(date.getUTCDate()+offset);const candidate=dailyMission(date.toISOString().slice(0,10),level);if(candidate.type==='Fix it'){correction=candidate;break;}}
 const mistake=correction.instruction.match(/“([^”]+)”/)?.[1]||'';
 return {id:'set-v2-'+legacy.id,title:topic.title,day,level,paragraphs,transcript:reading[0],phrase:reading[1],question:reading[2],answer:reading[3],vocabulary:vocabularyFor(reading[0],level),mistake,correction:correction.model,
 say:level==='foundation'?'Read the three short paragraphs aloud. Pause at full stops. Then say the main idea in 2–3 simple sentences.':level==='developing'?'Read the paragraphs aloud, grouping words into natural phrases. Then give a 30-second summary with one reason or example.':'Read the passage as if briefing a colleague. Use natural stress and pauses, then give a concise 30-second professional summary.',
 use:level==='foundation'?'Say one sentence using this expression about your own day. Then turn it into a short question or reply.':level==='developing'?'Use this expression in a short exchange you could have today. Say both sides and add a reason or example.':'Use this expression in a concise professional exchange, such as a meeting contribution or an email read aloud. Adapt the register to your audience.',
 recall:level==='foundation'?'Hide the reading. Say three words you remember, then tell its main idea in one or two short sentences. Reveal it and check.':level==='developing'?'Hide the reading. Recall three key details and retell the message without looking. Reveal it and check for anything you missed.':'Hide the reading. Reconstruct its main claim, supporting reasoning, and practical implication in your own words. Reveal it and evaluate how accurately you represented the message.'};
}
