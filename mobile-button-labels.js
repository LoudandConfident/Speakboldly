// Mark decorative arrows in text buttons; shared styles hide them on every screen.
function prepareButtonLabels(root=document){
 const buttons=[];
 if(root.nodeType===1&&root.matches('button,a.button,a.course-link'))buttons.push(root);
 if(root.querySelectorAll)buttons.push(...root.querySelectorAll('button,a.button,a.course-link'));
 for(const button of buttons){
  const walker=document.createTreeWalker(button,NodeFilter.SHOW_TEXT);
  const nodes=[];while(walker.nextNode())if(!walker.currentNode.parentElement.closest('.mobile-button-arrow')&&/[↗↘→←]/u.test(walker.currentNode.textContent))nodes.push(walker.currentNode);
  for(const node of nodes){
   const fragment=document.createDocumentFragment();
   for(const part of node.textContent.split(/([↗↘→←]\uFE0F?)/u)){
    if(/^[↗↘→←]/u.test(part)){const arrow=document.createElement('span');arrow.className='mobile-button-arrow';arrow.setAttribute('aria-hidden','true');arrow.textContent=part;fragment.append(arrow);}
    else fragment.append(document.createTextNode(part));
   }
   node.replaceWith(fragment);
  }
 }
}
prepareButtonLabels();
new MutationObserver(records=>{
 for(const record of records){
  if(record.type==='characterData'){const button=record.target.parentElement?.closest('button,a.button,a.course-link');if(button)prepareButtonLabels(button);}
  else for(const node of record.addedNodes){
   if(node.nodeType===1&&!node.closest('.mobile-button-arrow'))prepareButtonLabels(node);
   else if(node.nodeType===3){const button=node.parentElement?.closest('button,a.button,a.course-link');if(button)prepareButtonLabels(button);}
  }
 }
}).observe(document.body,{childList:true,subtree:true,characterData:true});
