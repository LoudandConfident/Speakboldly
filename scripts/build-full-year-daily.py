"""Alternate 183 realistic imagined situations with 182 varied reading-only Explore tasks."""
import json,math
from pathlib import Path
from explore_daily_content import THEMES,ORDER
ROOT=Path(__file__).resolve().parents[1]
VERSION='full-year-2026-v5-alternating'
LEVELS=['foundation','developing','stretching']
SCENES=[(THEMES[index],episode,THEMES[index]['scenes'][episode]) for episode in range(7) for index in ORDER]
assert len(SCENES)==182

def follow_up(number,level,theme=None,episode=0):
    if theme is None:theme,episode,_=SCENES[(number-1)%182]
    scene=theme['scenes'][(episode+1)%7]
    length={'foundation':'Write one or two clear sentences.','developing':'Write three or four connected sentences, including a reason.','stretching':'Write a short paragraph that separates the information in the text from your interpretation.'}[level]
    text=scene['scene']+' '+scene['outcome']
    if level!='foundation':text+=' Choose a concrete detail from this reading to support your response. Your wording can be different from the model, but it should remain consistent with the text.'
    tasks=[('What is the main idea of this bonus reading?',scene['scene']),('What useful point does the reading make?',scene['outcome']),('Summarise the bonus reading in your own words.',scene['scene']+' '+scene['outcome']),('Choose a detail and explain its connection with the main idea.',scene['scene']+' '+scene['outcome']),('Adapt one useful expression for a related situation.',theme['expressions'][0]['example']),('Write a short response using one useful expression.',theme['expressions'][1]['example']),('Explain one thing you could take from this reading.',scene['outcome'])]
    question,model=tasks[(number-1)%7]
    return {'kind':'read','title':'Bonus reading: '+scene['title'],'source':'Speak Boldly · original writing','instruction':'Read the short passage below, then respond in your own words.','text':text,'question':question+' '+length,'model':model}

for level in LEVELS:
    all_old=[m for p in sorted((ROOT/'daily-missions'/level).glob('*.json')) for m in json.loads(p.read_text())['missions']]
    existing=[m for m in all_old if m.get('readingGroup')=='scenario'] if any(m.get('readingGroup') for m in all_old) else [m for m in all_old if m['number']<=183]
    existing.sort(key=lambda m:m.get('sourceNumber',m['number']))
    assert [m.get('sourceNumber',m['number']) for m in existing]==list(range(1,184))
    for m in existing:
        original=m.get('sourceNumber',m['number']);m['sourceNumber']=original;m['readingGroup']='scenario';m['groupLabel']='Group 1 · An imagined real-life situation';m['followUp']=follow_up(original,level)
    explore=[]
    for offset,(theme,episode,scene) in enumerate(SCENES):
        number=offset+1;fiction=theme['kind']=='Original story'
        prefix=('Original series: ' if fiction else 'Explore: ')+theme['name']+'. Part '+str(episode+1)+' of 7.'
        opening=scene['scene'];outcome=scene['outcome']
        examples='In a conversation about this subject, you could say: '+' '.join('“'+e['example']+'”' for e in theme['expressions'])
        if level=='foundation':
            ending='The friends share their ideas and enjoy the small details. Everyone has something useful to add.' if fiction else 'One clear detail can help us understand a larger subject. We can connect it with something familiar and find a new question to explore.'
            paragraphs=[opening,theme[level],outcome+' '+ending,examples]
        elif level=='developing':
            ending='The important result is not a perfect performance. It is a clearer shared experience. Each person can describe one detail, give a reason for noticing it, and listen to another point of view.' if fiction else 'A useful reading offers more than a name to remember. It connects a clear detail with a wider idea. The reader can explain that connection in their own words and identify something they would like to understand better.'
            paragraphs=[opening+' '+outcome,theme[level],ending,examples]
        else:
            paragraphs=[opening+' '+outcome,theme['developing'],*theme[level].split('\n\n'),'The text invites a distinction between the information it presents and what a reader might infer. A convincing response identifies the relevant detail before offering an interpretation. This leaves room for curiosity without turning a first impression into an unsupported claim.',examples]
        use=[{**e,'instruction':{'foundation':'Write one new sentence using this expression.','developing':'Use this expression in a short message about a related idea.','stretching':'Adapt this expression in a short written response with a clear purpose and tone.'}[level]} for e in theme['expressions']]
        rules={'foundation':[{'structure':'Subject + can + base verb','example':'We can describe the main idea.'},{'structure':'Subject + would like + to + base verb','example':'I would like to learn more.'}], 'developing':[{'structure':'Subject + decided + to + base verb','example':'We decided to explore the subject.'},{'structure':'Subject + enjoy + verb-ing','example':'We enjoy learning something new.'}], 'stretching':[{'structure':'What + clause + main verb','example':'What makes the description clear is the carefully chosen detail.'},{'structure':'Had + subject + past participle, subject + would have + past participle','example':'Had the writer chosen another detail, the description would have changed.'}]}[level]
        fix={'foundation':[{'mistake':'We can to describe the main idea.','answer':'We can describe the main idea.','explanation':'After can, use the base verb without to.'},{'mistake':'I would like learn more.','answer':'I would like to learn more.','explanation':'Use would like to followed by the base verb.'}], 'developing':[{'mistake':'We decided explore the subject.','answer':'We decided to explore the subject.','explanation':'Use decided to followed by the base verb.'},{'mistake':'We enjoy to learn something new.','answer':'We enjoy learning something new.','explanation':'After enjoy, use the -ing form.'}], 'stretching':[{'mistake':'What make the description clear is the carefully chosen detail.','answer':'What makes the description clear is the carefully chosen detail.','explanation':'Use the singular verb makes in this clause.'},{'mistake':'Had the writer chose another detail, the description would have changed.','answer':'Had the writer chosen another detail, the description would have changed.','explanation':'After had, use the past participle chosen.'}]}[level]
        explore.append({'sourceNumber':number,'readingGroup':'explore','explorationType':theme['kind'],'groupLabel':'Group 2 · Explore — '+theme['kind'],'level':level,'title':scene['title'],'series':prefix,'category':theme['name'],'source':'original-full-year-reading','paragraphs':paragraphs,'transcript':' '.join(paragraphs),'phrase':use[0]['expression'],'question':'What happens as a result of the friends’ actions?' if fiction else 'What useful point does this reading make?','answer':outcome,'say':'Optional: read a favourite sentence aloud, or write a short description of the main idea instead.','useItems':use,'build':{'rules':rules},'fixItems':fix,'followUp':follow_up(number,level,theme,episode),'references':theme.get('sources',[])})
    missions=[]
    for i,m in enumerate(existing):
        missions.append(m)
        if i<len(explore):missions.append(explore[i])
    assert len(missions)==365
    for i,m in enumerate(missions,1):
        m['number']=i;m['id']=VERSION+':'+level+':'+str(i).zfill(3)
        m['afterInstruction']='After today’s reading, read the bonus passage below. Then complete the missing expression and write a short response in your own words.'
    for chunk in range(12):
        (ROOT/'daily-missions'/level/(str(chunk+1).zfill(2)+'.json')).write_text(json.dumps({'version':VERSION,'level':level,'missions':missions[chunk*31:(chunk+1)*31]},ensure_ascii=False,separators=(',',':'))+'\n')
index={'version':VERSION,'startDate':'2026-10-15','totalDays':365,'scenarioDays':183,'exploreDays':182,'ordering':'Odd days: imagined realistic situations. Even days: varied reading-only Explore topics. Same sequence on every device.','exploreTypes':{'Original story':56,'Art and ideas':49,'Country':42,'Successful people':35},'chunkSize':31,'levels':{l:{'count':365,'chunks':[{'file':str(c+1).zfill(2)+'.json','count':min(31,365-c*31)} for c in range(12)]} for l in LEVELS},'readingOnly':True,'sourcesChecked':'2026-10-16'}
(ROOT/'daily-missions/index.json').write_text(json.dumps(index,ensure_ascii=False,separators=(',',':'))+'\n')
