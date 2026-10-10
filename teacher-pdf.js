export async function fillTeacherPdf(bytes, values, {flatten=false,fontBytes=null}={}) {
 const {PDFDocument}=await import('./vendor/pdf-lib.esm.min.js');
 const pdf=await PDFDocument.load(bytes),form=pdf.getForm();
 let font;
 if(fontBytes){const {default:fontkit}=await import('./vendor/fontkit.es.min.js');pdf.registerFontkit(fontkit);font=await pdf.embedFont(fontBytes,{subset:true});}
 for(const field of form.getFields()){
  if(typeof field.setText!=='function')continue;
  const value=values[field.getName()];if(typeof value==='string'){field.setText(value);field.setFontSize(field.isMultiline()?8:9);field.setAlignment(0);}
 }
 if(font)form.updateFieldAppearances(font);else form.updateFieldAppearances();
 if(flatten)form.flatten();
 pdf.setAuthor('Mira Nasser Louis');pdf.setCreator('Speak Boldly Teacher Portal');
 return pdf.save();
}
