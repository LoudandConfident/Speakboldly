// Speak Boldly course levels are distinct from CEFR assessment bands.
export const REVIEW_LEVELS=Array.from({length:8},(_,i)=>String(i+1));
export function initializeReviewLevels(doc,form){
 const original=form.elements.level;if(!original)return;
 const select=doc.createElement('select');select.id=original.id;select.name='level';select.required=true;
 const placeholder=doc.createElement('option');placeholder.value='';placeholder.textContent='Choose your level';select.append(placeholder);
 for(const value of REVIEW_LEVELS){const option=doc.createElement('option');option.value=value;option.textContent='Level '+value;select.append(option);}
 if(REVIEW_LEVELS.includes(original.value))select.value=original.value;original.replaceWith(select);
}
// Instructor-confirmed correction for this existing review only. This does not
// convert CEFR labels for other people or change records in Google Sheets.
export function displayedReviewLevel(review){
 const name=String(review.name||'').trim().replace(/\s+/g,' ').toLowerCase();
 if(name==='mazen ashraf ahmed'&&String(review.age)==='21'&&String(review.level).trim().toUpperCase()==='A2'&&/^General English\b/i.test(String(review.program))&&/^Honestly, it was one of the best English learning experiences/i.test(String(review.message).trim()))return '4';
 return String(review.level||'').trim().replace(/^Level\s+/i,'');
}
