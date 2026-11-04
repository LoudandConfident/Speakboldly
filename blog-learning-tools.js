import {BLOG_LEARNING_BY_POST} from './blog-learning-data.js?v=words15-expressions5-1';
export const termPattern=term=>String(term).replace(/[.*+?^${}()|[\]\\]/g,'\\$&').replace(/['’]/g,"['’]").replace(/\s+/g,'\\s+');
export function learningForPost(post={}){
 const saved=post.learningTools||BLOG_LEARNING_BY_POST[post.id];if(saved)return saved;
 const text=(post.pages||[]).join(' ').toLowerCase(),sets=Object.values(BLOG_LEARNING_BY_POST),unique=(rows,key,max)=>[...new Map(rows.map(x=>[x[key],x])).values()].filter(x=>new RegExp('\\b'+termPattern(x[key])+'\\b','i').test(text)).slice(0,max);
 return{vocabulary:unique(sets.flatMap(x=>x.vocabulary),'word',15),expressions:unique(sets.flatMap(x=>x.expressions),'phrase',5)};
}
export function parseLearningLines(vocabulary,expressions){
 const rows=(text,fields)=>String(text||'').split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map((line,i)=>{const parts=line.split('|').map(s=>s.trim());if(parts.length!==fields.length||parts.some(x=>!x))throw Error('Check learning-tools line '+(i+1)+': use '+fields.length+' fields separated by |.');return Object.fromEntries(fields.map((k,n)=>[k,parts[n]]));});return{vocabulary:rows(vocabulary,['word','part','definition','example']),expressions:rows(expressions,['phrase','definition','example'])};
}
export function learningLines(value){return{vocabulary:(value?.vocabulary||[]).map(w=>[w.word,w.part,w.definition,w.example].join(' | ')).join('\n'),expressions:(value?.expressions||[]).map(w=>[w.phrase,w.definition,w.example].join(' | ')).join('\n')};}
export function validateLearningTools(value,pages,{published=false}={}){
 if(!value||!Array.isArray(value.vocabulary)||!Array.isArray(value.expressions))throw Error('Add vocabulary and useful expressions for this article.');if(value.vocabulary.length>30||value.expressions.length>12)throw Error('Keep the glossary focused: up to 30 words and 12 expressions in a draft.');
 if(published&&(value.vocabulary.length<12||value.vocabulary.length>18||value.expressions.length<4||value.expressions.length>6))throw Error('Before publishing, aim for 15 vocabulary words (12–18) and 5 expressions (4–6), each with a meaning and example.');
 const text=(pages||[]).join(' '),seen=new Set();for(const [kind,rows]of [['word',value.vocabulary],['phrase',value.expressions]])for(const item of rows){const term=item[kind];if(typeof term!=='string'||!term.trim()||term.length>100||typeof item.definition!=='string'||!item.definition.trim()||item.definition.length>600||typeof item.example!=='string'||!item.example.trim()||item.example.length>700)throw Error('Each glossary entry needs a short term, definition and example.');if(kind==='word'&&(!item.part||item.part.length>60))throw Error('Add a part of speech for '+term+'.');if(seen.has(term.toLowerCase()))throw Error('Duplicate glossary term: '+term);seen.add(term.toLowerCase());if(!new RegExp('\\b'+termPattern(term)+'\\b','i').test(text))throw Error('Use “'+term+'” in the article before adding it to the glossary.');}
 return value;
}
