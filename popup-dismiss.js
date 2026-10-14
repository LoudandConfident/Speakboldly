export function initializeOutsideDismiss(doc) {
 const startedOutside=new WeakMap();
 const outside=(dialog,event)=>{
  const rect=dialog.getBoundingClientRect();
  return event.clientX<rect.left||event.clientX>rect.right||event.clientY<rect.top||event.clientY>rect.bottom;
 };
 doc.addEventListener('pointerdown',event=>{
  const dialog=event.target.closest?.('dialog');
  if(dialog?.open)startedOutside.set(dialog,event.target===dialog&&outside(dialog,event));
 },true);
 doc.addEventListener('click',event=>{
  const dialog=event.target.closest?.('dialog');
  if(!dialog?.open)return;
  const beganOutside=startedOutside.get(dialog);startedOutside.delete(dialog);
  if(event.target!==dialog||!outside(dialog,event)||beganOutside===false)return;
  event.preventDefault();event.stopPropagation();dialog.close();
 },true);
}
if(typeof document!=='undefined')initializeOutsideDismiss(document);
