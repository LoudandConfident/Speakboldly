// Fit report overlays to the PDF rectangles without truncating the saved value.
export function fitReportInput(input){
 if(!input.classList.contains('teacher-pdf-overlay')||!input.clientWidth)return;
 const maximum=Number(input.dataset.reportFont)||9,minimum=Math.max(1,maximum/9);let size=maximum;
 input.style.fontSize=size+'px';
 while(size>minimum&&(input.scrollHeight>input.clientHeight+1||input.scrollWidth>input.clientWidth+1)){size=Math.max(minimum,size-.25);input.style.fontSize=size+'px';}
}
export function reportPageScale(width,height,availableWidth,viewportHeight){return Math.max(.2,Math.min(.85,availableWidth/width,Math.max(220,viewportHeight-240)/height));}
