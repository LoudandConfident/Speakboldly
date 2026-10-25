export function createBookingNotice(doc,kind){
 const fragment=doc.createDocumentFragment();
 const paragraph=text=>{const node=doc.createElement('p');node.textContent=text;return node;};
 if(['session','workshop'].includes(kind))fragment.append(paragraph('Please complete an SB placement test before enrolling in your program. This helps your coach confirm your level and recommend the right starting point.'));
 if(kind!=='trial'){
  const fees=paragraph('Please email a screenshot of your '+(kind==='placement'?'placement test fees':'course fees')+' payment to ');
  const email=doc.createElement('a');email.href='mailto:billing@speakboldly.space';email.textContent='billing@speakboldly.space';
  fees.append(email,doc.createTextNode('. Include your name and requested date and time.'));fragment.append(fees);
 }
 fragment.append(paragraph('Submitting sends a booking request to billing@speakboldly.space for your instructor to accept or decline.'),paragraph("You'll receive a confirmation e-mail within 24 hours."));
 return fragment;
}
