// Keep editor formatting and exported text in one small, predictable format.
export function readNoteRuns(editor){
 const runs=[];
 const add=(text,style)=>{if(!text)return;const previous=runs.at(-1);if(previous&&['bold','underline','highlight'].every(key=>!!previous[key]===!!style[key]))previous.text+=text;else runs.push({text,...style});};
 function visit(node,style={}){
  if(node.nodeType===3){add(node.nodeValue.replace(/\u00a0/g,' '),style);return;}
  if(node.nodeType!==1)return;
  if(node.tagName==='BR'){add('\n',style);return;}
  const next={...style};if(/^(B|STRONG)$/.test(node.tagName)||/^(bold|[7-9]00)$/.test(node.style.fontWeight))next.bold=true;
  if(/^(normal|[1-5]00)$/.test(node.style.fontWeight))next.bold=false;
  if(node.tagName==='U'||node.style.textDecoration.includes('underline'))next.underline=true;if(node.style.textDecoration==='none')next.underline=false;
  const bg=node.style.backgroundColor;if(node.tagName==='MARK')next.highlight=true;if(bg)next.highlight=!['transparent','rgba(0, 0, 0, 0)'].includes(bg);
  const block=/^(DIV|P|LI)$/.test(node.tagName);if(block&&node.previousSibling&&!runs.at(-1)?.text.endsWith('\n'))add('\n',{});
  for(const child of node.childNodes)visit(child,next);
 }
 for(const child of editor.childNodes)visit(child);
 return runs;
}
export function addNotesToolbar(doc,editor,onChange){
 const toolbar=doc.createElement('div');toolbar.className='session-notes-toolbar';toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Session notes formatting');
 let saved=null;
 const selection=()=>doc.getSelection();
 const inside=range=>range&&editor.contains(range.commonAncestorContainer);
 function save(){const sel=selection();if(sel?.rangeCount&&inside(sel.getRangeAt(0)))saved=sel.getRangeAt(0).cloneRange();}
 function restore(){editor.focus({preventScroll:true});if(saved){const sel=selection();sel.removeAllRanges();sel.addRange(saved);}}
 function highlighted(){let node=selection()?.anchorNode;while(node&&node!==editor){if(node.nodeType===1){const bg=node.style.backgroundColor;if(bg)return bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)';if(node.tagName==='MARK')return true;}node=node.parentNode;}return false;}
 const bold=doc.createElement('button'),highlight=doc.createElement('button');
 for(const button of [bold,highlight]){button.type='button';button.className='button light small';button.setAttribute('aria-pressed','false');button.addEventListener('mousedown',event=>event.preventDefault());toolbar.append(button);}
 function update(){if(!inside(selection()?.rangeCount?selection().getRangeAt(0):null))return;const isBold=doc.queryCommandState('bold'),isHighlight=highlighted();bold.textContent=isBold?'Bold on':'Bold';highlight.textContent=isHighlight?'Highlight on':'Highlight';bold.setAttribute('aria-pressed',String(isBold));highlight.setAttribute('aria-pressed',String(isHighlight));bold.title=isBold?'Turn bold off':'Turn bold on';highlight.title=isHighlight?'Remove highlight':'Highlight text';}
 bold.textContent='Bold';highlight.textContent='Highlight';
 bold.onclick=()=>{restore();doc.execCommand('bold',false);save();onChange();update();};
 highlight.onclick=()=>{restore();doc.execCommand('styleWithCSS',false,true);doc.execCommand('hiliteColor',false,highlighted()?'transparent':'#e5ef9d');save();onChange();update();};
 editor.addEventListener('paste',event=>{event.preventDefault();doc.execCommand('insertText',false,event.clipboardData.getData('text/plain'));});
 editor.addEventListener('drop',event=>event.preventDefault());
 doc.addEventListener('selectionchange',()=>{save();update();});editor.before(toolbar);
 return {reset(){saved=null;bold.textContent='Bold';highlight.textContent='Highlight';bold.setAttribute('aria-pressed','false');highlight.setAttribute('aria-pressed','false');}};
}
