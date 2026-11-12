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
 const win=doc.defaultView,host=editor.closest('#client-notes-dialog')||doc.body;
 const toolbar=doc.createElement('div');toolbar.className='session-notes-toolbar';toolbar.hidden=true;
 toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Format selected session notes');
 const topLayer=typeof toolbar.showPopover==='function';if(topLayer)toolbar.setAttribute('popover','manual');
 host.append(toolbar);
 let saved=null,queued=false,dismissed=false;
 const selection=()=>doc.getSelection();
 const inside=range=>Boolean(range&&editor.contains(range.commonAncestorContainer));
 function save(){const sel=selection();if(sel?.rangeCount&&inside(sel.getRangeAt(0)))saved=sel.getRangeAt(0).cloneRange();}
 function restore(){editor.focus({preventScroll:true});if(saved){const sel=selection();sel.removeAllRanges();sel.addRange(saved);}}
 function hide(){toolbar.hidden=true;if(topLayer&&toolbar.matches(':popover-open'))toolbar.hidePopover();}
 function highlighted(){
  const sel=selection(),range=sel?.rangeCount?sel.getRangeAt(0):null;if(!inside(range))return false;
  const hasHighlight=text=>{for(let node=text.parentElement;node&&node!==editor;node=node.parentElement){const bg=node.style.backgroundColor;if(bg)return bg!=='transparent'&&bg!=='rgba(0, 0, 0, 0)';if(node.tagName==='MARK')return true;}return false;};
  // Formatting can leave range boundaries on an element rather than a text
  // node. Inspect the selected text so the toggle still reflects its style.
  const walker=doc.createTreeWalker(editor,win.NodeFilter.SHOW_TEXT);let node,found=false;
  while(node=walker.nextNode()){if(!node.length||!range.intersectsNode(node)||(node===range.startContainer&&range.startOffset===node.length)||(node===range.endContainer&&range.endOffset===0))continue;found=true;if(!hasHighlight(node))return false;}
  return found;
 }
 const bold=doc.createElement('button'),highlight=doc.createElement('button');
 for(const button of [bold,highlight]){
  button.type='button';button.className='button light small';button.setAttribute('aria-pressed','false');
  // Keep the selected range while a mouse, pen or touch activates formatting.
  button.addEventListener('pointerdown',event=>{save();event.preventDefault();});
  button.addEventListener('mousedown',event=>event.preventDefault());toolbar.append(button);
 }
 bold.textContent='Bold';highlight.textContent='Highlight';
 function updateButtons(){const isBold=doc.queryCommandState('bold'),isHighlight=highlighted();bold.setAttribute('aria-pressed',String(isBold));highlight.setAttribute('aria-pressed',String(isHighlight));bold.title=isBold?'Turn bold off':'Turn bold on';highlight.title=isHighlight?'Remove highlight':'Highlight text';}
 function update(){
  queued=false;const sel=selection(),range=sel?.rangeCount?sel.getRangeAt(0):null;
  const focused=doc.activeElement===editor||editor.contains(doc.activeElement)||toolbar.contains(doc.activeElement);
  const modal=doc.querySelector('dialog[open]');
  if(dismissed||!focused||!inside(range)||range.collapsed||!editor.isContentEditable||!editor.getClientRects().length||(modal&&modal!==editor.closest('dialog'))){hide();return;}
  saved=range.cloneRange();updateButtons();
  const viewport=win.visualViewport,left=viewport?.offsetLeft||0,top=viewport?.offsetTop||0;
  const right=left+(viewport?.width||win.innerWidth),bottom=top+(viewport?.height||win.innerHeight);
  const editorBox=editor.getBoundingClientRect();
  const rects=[...range.getClientRects()].filter(r=>r.width&&r.height&&r.bottom>Math.max(top,editorBox.top)&&r.top<Math.min(bottom,editorBox.bottom));
  const backwards=sel.anchorNode===range.endContainer&&sel.anchorOffset===range.endOffset;
  const anchor=backwards?rects[0]:rects.at(-1);if(!anchor){hide();return;}
  toolbar.hidden=false;if(topLayer&&!toolbar.matches(':popover-open')){try{toolbar.showPopover();}catch{}}
  const box=toolbar.getBoundingClientRect(),gap=10,edge=10;
  let y=win.matchMedia?.('(pointer:coarse)').matches?anchor.bottom+gap:anchor.top-box.height-gap;
  if(y<top+edge)y=anchor.bottom+gap;
  if(y+box.height>bottom-edge)y=anchor.top-box.height-gap;
  y=Math.max(top+edge,Math.min(y,bottom-box.height-edge));
  const x=Math.max(left+edge,Math.min(anchor.left+anchor.width/2-box.width/2,right-box.width-edge));
  toolbar.style.setProperty('--notes-toolbar-left',Math.round(x)+'px');toolbar.style.setProperty('--notes-toolbar-top',Math.round(y)+'px');
 }
 const schedule=()=>{if(!queued){queued=true;win.requestAnimationFrame(update);}};
 function format(command,value){restore();if(!inside(selection()?.rangeCount?selection().getRangeAt(0):null))return;doc.execCommand(command,false,value);save();onChange();update();}
 bold.onclick=()=>format('bold');
 highlight.onclick=()=>{restore();doc.execCommand('styleWithCSS',false,true);format('hiliteColor',highlighted()?'transparent':'#e5ef9d');};
 editor.addEventListener('paste',event=>{event.preventDefault();doc.execCommand('insertText',false,event.clipboardData?.getData('text/plain')||'');});
 editor.addEventListener('drop',event=>event.preventDefault());
 doc.addEventListener('selectionchange',()=>{save();schedule();});
 editor.addEventListener('pointerup',()=>{dismissed=false;schedule();});
 editor.addEventListener('keyup',event=>{if(event.key!=='Escape'){dismissed=false;schedule();}});
 editor.addEventListener('input',schedule);
 editor.addEventListener('keydown',event=>{if(event.key==='Escape'&&!toolbar.hidden){event.preventDefault();event.stopPropagation();dismissed=true;hide();}else if(event.altKey&&event.key==='F10'&&!toolbar.hidden){event.preventDefault();bold.focus();}});
 toolbar.addEventListener('keydown',event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();dismissed=true;hide();restore();}else if(['ArrowRight','ArrowLeft','Home','End'].includes(event.key)){event.preventDefault();(event.key==='Home'?bold:event.key==='End'?highlight:doc.activeElement===bold?highlight:bold).focus();}});
 doc.addEventListener('pointerdown',event=>{if(!editor.contains(event.target)&&!toolbar.contains(event.target)){dismissed=true;hide();}});
 doc.addEventListener('focusin',schedule);
 doc.addEventListener('scroll',schedule,true);win.addEventListener('resize',schedule);
 win.visualViewport?.addEventListener('resize',schedule);win.visualViewport?.addEventListener('scroll',schedule);
 editor.closest('dialog')?.addEventListener('close',hide);
 return {reset(){saved=null;dismissed=false;hide();bold.setAttribute('aria-pressed','false');highlight.setAttribute('aria-pressed','false');}};
}
