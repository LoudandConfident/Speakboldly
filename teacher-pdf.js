import {DOCUMENT_BRAND} from './document-branding.js?v=signature-mira-nasser';
export async function fillTeacherPdf(bytes, values, {flatten=false,fontBytes=null}={}) {
 const {PDFDocument,StandardFonts}=await import('./vendor/pdf-lib.esm.min.js');
 const pdf=await PDFDocument.load(bytes),form=pdf.getForm();
 let font;
 if(fontBytes){const {default:fontkit}=await import('./vendor/fontkit.es.min.js');pdf.registerFontkit(fontkit);font=await pdf.embedFont(fontBytes,{subset:true});}
 if(!font)font=await pdf.embedFont(StandardFonts.Helvetica);
 for(const field of form.getFields()){
  if(typeof field.setText!=='function')continue;
  const value=values[field.getName()];if(typeof value==='string'){field.removeMaxLength();field.setText(value);field.setFontSize(0);field.setAlignment(1);}
 }
 if(font)form.updateFieldAppearances(font);else form.updateFieldAppearances();
 // Auto-fit long comments, but keep short answers at a restrained report size.
 for(const field of form.getFields()){
  if(typeof field.setFontSize!=='function')continue;
  const size=Number(field.acroField.getDefaultAppearance()?.match(/([\d.]+)\s+Tf/)?.[1]);
  if(size>8)field.setFontSize(8);
 }
 form.updateFieldAppearances(font);
 if(flatten)form.flatten();
 pdf.setAuthor(DOCUMENT_BRAND.founder);pdf.setCreator('Speak Boldly Teacher Portal');
 return pdf.save();
}
