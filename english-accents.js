export const ENGLISH_ACCENTS=[['en-GB','British English'],['en-US','American English']];
function quality(voice){const name=voice.name||'';return (/natural|neural/i.test(name)?1000:0)+(/enhanced/i.test(name)?800:0)+(/premium/i.test(name)?700:0)+(/online/i.test(name)?300:0)+(/Google/i.test(name)?250:0)+(/Samantha|Daniel|Sonia|Libby|Ryan|Jenny|Aria|Guy/i.test(name)?100:0)-(/compact|eSpeak|robot/i.test(name)?500:0);}
export function voiceForAccent(synthesis,accent='en-GB'){
 const code=accent.replace('_','-').toLowerCase(),voices=(synthesis?.getVoices?.()||[]).filter(voice=>voice.lang.replace('_','-').toLowerCase()===code);
 return voices.sort((a,b)=>quality(b)-quality(a))[0]||null;
}
// Give late-loading natural voices one chance before using a compact device fallback.
const prepared=new WeakSet();
export function readyAccentVoice(synthesis,accent){const initial=voiceForAccent(synthesis,accent);if(!synthesis?.addEventListener||(initial&&(quality(initial)>=250||prepared.has(synthesis))))return Promise.resolve(initial);return new Promise(resolve=>{let timer;const finish=()=>{clearTimeout(timer);synthesis.removeEventListener?.('voiceschanged',changed);prepared.add(synthesis);resolve(voiceForAccent(synthesis,accent));},changed=()=>{const next=voiceForAccent(synthesis,accent);if(next&&(!initial||quality(next)>quality(initial)))finish();};synthesis.addEventListener('voiceschanged',changed);timer=setTimeout(finish,1200);changed();});}
export function accentSelect(doc,label,{value='en-GB'}={}){const select=doc.createElement('select');select.setAttribute('aria-label',label);for(const [code,text]of ENGLISH_ACCENTS)select.append(new doc.defaultView.Option(text,code));select.value=value;return select;}
