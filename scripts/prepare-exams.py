"""Build private exam content from six owner-supplied Word files. Never publish the output."""
import argparse,json,re,zipfile
from pathlib import Path
import xml.etree.ElementTree as E
parser=argparse.ArgumentParser()
parser.add_argument('source',type=Path,help='Directory containing the six Word exams')
parser.add_argument('--out',type=Path,default=Path('.private-data/exams.json'))
args=parser.parse_args();ns={'w':'http://schemas.openxmlformats.org/wordprocessingml/2006/main'};exams={}
for src in args.source.rglob('Berlitz_English_Level_*_Final_Exam.docx'):
 level=int(re.search(r'Level_(\d+)',src.name)[1])
 if level not in range(1,7):continue
 if level in exams:raise ValueError(f'More than one Level {level} source document')
 with zipfile.ZipFile(src) as archive:root=E.fromstring(archive.read('word/document.xml'))
 lines=[''.join(t.text or '' for t in el.findall('.//w:t',ns)).strip() for el in root.find('w:body',ns)]
 lines=[x for x in lines if x]
 indexes=[next(i for i,x in enumerate(lines) if x.startswith(letter+'. ')) for letter in 'ABCDE']
 teacher=next(i for i,x in enumerate(lines) if x.startswith('TEACHER COPY'))
 keyline=next(x for x in lines[teacher:] if re.match(r'^A\.\s*1\s+[abc]',x))
 keys={int(n):'abc'.index(letter) for n,letter in re.findall(r'(\d+)\s+([abc])',keyline)}
 questions=[]
 for line in lines[indexes[0]+1:indexes[1]]:
  match=re.match(r'^(\d+)\.\s*(.*?)\s+a\)\s*(.*?)\s+b\)\s*(.*?)\s+c\)\s*(.*?)\s*$',line)
  if match:questions.append({'number':int(match[1]),'question':match[2],'options':list(match.groups()[2:]),'correct':keys[int(match[1])]})
 if len(questions)!=20 or set(keys)!=set(range(1,21)):raise ValueError(f'Incomplete Level {level} multiple-choice section')
 sections={}
 for n,letter in enumerate('BCDE',1):
  content=lines[indexes[n]+1:(indexes[n+1] if n<4 else teacher)]
  content=[x for x in content if not re.match(r'^[_\s]+$',x)]
  if letter in 'BC':
   written=[x for x in content if re.match(r'^\d+\.\s',x)]
   intro=[x for x in content if not re.match(r'^\d+\.\s',x)]
   if len(written)!=10:raise ValueError(f'Incomplete Level {level} section {letter}')
   sections[letter]={'title':lines[indexes[n]],'intro':intro,'questions':written}
  else:sections[letter]={'title':lines[indexes[n]],'intro':content,'questions':[]}
 exams[level]={'level':level,'title':f'Level {level} exam','questions':questions,'sections':sections,'teacherNotes':lines[teacher+1:]}
if set(exams)!=set(range(1,7)):raise ValueError('All six source exams are required')
args.out.parent.mkdir(parents=True,exist_ok=True)
args.out.write_text(json.dumps([exams[n] for n in sorted(exams)],ensure_ascii=False),encoding='utf-8')
print('Prepared all six exams. Output contains private answer keys; keep it off public hosting.')
