export const ENGLISH_ACCENTS=[['en-GB','British English'],['en-US','American English']];
export function voiceForAccent(synthesis,accent='en-GB'){
 const code=accent.replace('_','-').toLowerCase(),voices=(synthesis?.getVoices?.()||[]).filter(voice=>voice.lang.replace('_','-').toLowerCase()===code);
 return voices.find(voice=>/natural|enhanced|premium|Google|Samantha|Daniel/i.test(voice.name))||voices[0]||null;
}
export function accentSelect(doc,label,{value='en-GB'}={}){const select=doc.createElement('select');select.setAttribute('aria-label',label);for(const [code,text]of ENGLISH_ACCENTS)select.append(new doc.defaultView.Option(text,code));select.value=value;return select;}
