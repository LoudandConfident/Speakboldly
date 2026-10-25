"""Restore the original credentials on Speak Boldly's own supplied PDFs."""
from pathlib import Path
import json,subprocess
import fitz
ROOT=Path(__file__).resolve().parent.parent
brand=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {DOCUMENT_BRAND} from './document-branding.js';process.stdout.write(JSON.stringify(DOCUMENT_BRAND))"],cwd=ROOT,text=True))
files=['document-templates/progress-report.pdf','document-templates/final-report.pdf','document-templates/registration-payment-confirmation.pdf','brochures/SB-Policy.pdf']
for filename in files:
 path=ROOT/filename;doc=fitz.open(path)
 before=[[(w.field_name,w.field_type) for w in p.widgets() or []] for p in doc]
 dark='sb-dark-report-v1' in (doc.metadata.get('keywords') or '')
 background=(25/255,60/255,50/255) if dark else (1,1,1)
 ink=(250/255,249/255,244/255) if dark else (25/255,60/255,50/255)
 for index,page in enumerate(doc):
  # All form fields and policy contact links are above this existing footer area.
  page.add_redact_annot(fitz.Rect(30,page.rect.height-55,page.rect.width-30,page.rect.height-8),fill=background)
  page.apply_redactions(images=0,graphics=0)
  y=page.rect.height-brand['footerY']
  page.insert_text((brand['left'],y),brand['credentials'],fontname='helv',fontsize=brand['footerSize'],lineheight=brand['footerLineHeight']/brand['footerSize'],color=ink)
  number=f'{index+1} / {len(doc)}';page.insert_text((page.rect.width-brand['left']-fitz.get_text_length(number,fontsize=brand['footerSize']),y),number,fontsize=brand['footerSize'],color=ink)
 assert before==[[(w.field_name,w.field_type) for w in p.widgets() or []] for p in doc]
 metadata=doc.metadata;metadata['author']=brand['founder'];doc.set_metadata(metadata)
 temp=path.with_suffix('.restored.pdf');doc.save(temp,garbage=4,deflate=True);doc.close();temp.replace(path)
 print('Restored footer:',filename)
# The landscape Method brochure has no unused footer margin, so add a slim white
# margin below the original artwork. Preserve the entire design, links and QR code.
path=ROOT/'brochures/Speak-Boldly-Method.pdf';src=fitz.open(path);out=fitz.open()
for index,page in enumerate(src):
 if '© 2026 Mira Nasser Louis. All rights reserved.' in page.get_text():
  out.insert_pdf(src,from_page=index,to_page=index);continue
 width,height=page.rect.width,page.rect.height;target=out.new_page(width=width,height=height+56)
 target.show_pdf_page(fitz.Rect(0,0,width,height),src,index)
 for link in page.get_links():
  if link.get('kind')==fitz.LINK_URI:target.insert_link({'kind':fitz.LINK_URI,'from':link['from'],'uri':link['uri']})
 y=target.rect.height-brand['footerY'];target.insert_text((22,y),brand['credentials'],fontname='sbfooter',fontfile=str(ROOT/'document-templates/DejaVuSans.ttf'),fontsize=brand['footerSize'],lineheight=brand['footerLineHeight']/brand['footerSize'],color=(25/255,60/255,50/255))
metadata=src.metadata;metadata['author']=brand['founder'];out.set_metadata(metadata)
temp=path.with_suffix('.restored.pdf');out.subset_fonts();out.save(temp,garbage=4,deflate=True);out.close();src.close();temp.replace(path)
print('Restored footer: brochures/Speak-Boldly-Method.pdf')
