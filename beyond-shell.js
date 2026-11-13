// One wordmark, header and footer design for every Beyond destination.
export const BEYOND_FOOTER_LINES=Object.freeze(['Beyond','© 2026 Beyond.']);
export const BEYOND_MARK='/literatespace/beyond-mark.svg?v=1';
const escape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderBeyondHeader(section=''){
 const back=section?'<a class="beyond-space-back" href="/literatespace/" aria-label="Back to Beyond"><svg viewBox="0 0 24 20" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 10H3m7-7-7 7 7 7"/></svg></a>':'';
 return '<header class="beyond-space-header"><a class="beyond-space-wordmark" href="/literatespace/" aria-label="Beyond home"><img src="'+BEYOND_MARK+'" alt="" width="38" height="38"><span>Beyond</span></a>'+(section?'<span class="beyond-space-section">'+escape(section)+'</span>':'')+'<nav class="beyond-space-navigation" aria-label="Beyond navigation">'+back+'<a class="beyond-space-teaching" href="/#home">Back to Speak Boldly</a></nav></header>';
}
export function renderBeyondFooter(){
 const lines=BEYOND_FOOTER_LINES;
 return '<footer class="beyond-space-footer"><span>'+escape(lines[0])+'</span><small>'+escape(lines[1])+'</small></footer>';
}
