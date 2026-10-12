"""Build a concise English-only progress report and update the other editable PDFs.
Usage: python scripts/build-teacher-templates.py [directory-of-original-pdfs]
Without originals, the current final and registration templates are updated in place.
"""
from pathlib import Path
import sys,json
import fitz
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'document-templates';OUT.mkdir(exist_ok=True)
source=Path(sys.argv[1]) if len(sys.argv)>1 else None
green=HexColor('#193c32');cream=HexColor('#faf9f4');line=HexColor('#d4ded5');pale=HexColor('#edf1e9')
logo=fitz.open(stream=(ROOT/'sb-logo-green.svg').read_bytes(),filetype='svg')
logo[0].get_pixmap(matrix=fitz.Matrix(2,2),alpha=True).save('/tmp/speak-boldly-document-logo.png')
W,H=A4
c=canvas.Canvas(str(OUT/'progress-report.pdf'),pagesize=A4)
c.setTitle('Speak Boldly — English progress report');c.setAuthor('Mira Nasser Louis')
c.setFillColor(cream);c.rect(0,0,W,H,fill=1,stroke=0)
c.drawImage('/tmp/speak-boldly-document-logo.png',36,H-70,40,40,mask='auto')
c.setFillColor(green);c.setFont('Helvetica-Bold',18);c.drawString(88,H-46,'Speak Boldly')
c.setFont('Helvetica',9);c.drawString(88,H-62,'English Language Coaching')
c.setFont('Helvetica-Bold',17);c.drawString(36,H-105,'English progress report')
def textfield(name,x,y,width,height,multiline=False):
 c.acroForm.textfield(name=name,x=x,y=y,width=width,height=height,borderWidth=.5,borderColor=line,fillColor=cream,textColor=green,fontName='Helvetica',fontSize=9,fieldFlags='multiline' if multiline else '',forceBorder=True)
def label(text,x,y):
 c.setFillColor(green);c.setFont('Helvetica',9);c.drawString(x,y,text)
# Keep existing field names so core saved report values still populate the shorter template.
for name,title,x,y,width in [
 ('p1_Student information_Student name','Student name',36,H-138,250),
 ('p1_Student information_Age / Level','Level',308,H-138,250),
 ('p1_Student information_Course / Program','Course / Program',36,H-189,250),
 ('p1_Student information_Session date','Report date',308,H-189,250)]:
 label(title,x,y);textfield(name,x,y-29,width,22)
c.setFillColor(pale);c.roundRect(36,H-251,W-72,24,4,fill=1,stroke=0)
c.setFillColor(green);c.setFont('Helvetica-Bold',10);c.drawString(45,H-243,'English skills — brief assessment')
for i,(name,title) in enumerate([
 ('Comments_Speaking','Speaking / pronunciation'),('Comments_Listening','Listening'),
 ('Comments_Reading','Reading'),('Comments_Writing','Writing'),
 ('Vocabulary','Vocabulary'),('Grammar','Grammar')]):
 y=H-280-i*47;label(title,36,y);textfield(name,190,y-25,W-226,38,True)
for name,title,top in [('Comments_Strengths','Progress and strengths',H-572),('Comments_Areas for improvement','Development points',H-641),('Comments_Next steps','Next steps',H-710)]:
 c.setFillColor(green);c.setFont('Helvetica-Bold',10);c.drawString(36,top,title);textfield(name,36,top-50,W-72,42,True)
c.setStrokeColor(line);c.line(36,53,W-36,53)
label('Prepared by Mira Nasser Louis',36,35)
c.showPage();c.save()
for original,filename in [('2-Registration_Payment_Confirmation_Corrected.pdf','registration-payment-confirmation.pdf'),('3-Final_Report_Blank.pdf','final-report.pdf')]:
 document=fitz.open(source/original if source else OUT/filename)
 for page in document:
  for widget in list(page.widgets()):
   if 'signature' in widget.field_name.lower():page.delete_widget(widget)
  for text in ['speakboldly16@gmail.com','Signature:','Prepared fully by Mira Nasser Louis','Prepared by Mira Nasser Louis']:
   for rect in page.search_for(text):page.add_redact_annot(rect,fill=(250/255,249/255,244/255))
  page.apply_redactions(images=0,graphics=0)
  for widget in page.widgets():
   if widget.rect.height>28:widget.field_flags|=fitz.PDF_TX_FIELD_IS_MULTILINE;widget.update()
  page.insert_text((108,796),'Prepared by Mira Nasser Louis',fontsize=9,color=(25/255,60/255,50/255))
 temporary=OUT/(filename+'.tmp');document.save(temporary,garbage=4,deflate=True);document.close();temporary.replace(OUT/filename)
metadata={}
for key,title,filename in [('progress','Progress report','progress-report.pdf'),('final','Final exam report','final-report.pdf'),('registration','Registration & payment confirmation','registration-payment-confirmation.pdf')]:
 document=fitz.open(OUT/filename);pages=[]
 for index,page in enumerate(document):
  fields=[]
  for widget in page.widgets():
   rect=widget.rect
   label=widget.field_name.split('_',2)[-1] if widget.field_name.startswith('p') and '_' in widget.field_name else widget.field_name.replace('Comments_','')
   if widget.field_name=='p1_Student information_Age / Level':label='Level'
   if widget.field_name=='p1_Student information_Session date':label='Report date'
   if widget.field_name=='Comments_Speaking':label='Speaking / pronunciation'
   if widget.field_name=='Comments_Strengths':label='Progress and strengths'
   if widget.field_name=='Comments_Areas for improvement':label='Development points'
   fields.append({'name':widget.field_name,'label':label,'x':rect.x0/page.rect.width,'y':rect.y0/page.rect.height,'width':rect.width/page.rect.width,'height':rect.height/page.rect.height,'multiline':bool(widget.field_flags&fitz.PDF_TX_FIELD_IS_MULTILINE),'maxLength':2000 if widget.field_flags&fitz.PDF_TX_FIELD_IS_MULTILINE else 300})
  pages.append({'width':page.rect.width,'height':page.rect.height,'fields':fields})
  page.get_pixmap(matrix=fitz.Matrix(1,1)).save('/tmp/'+filename.replace('.pdf','')+f'-page-{index+1}.png')
 metadata[key]={'title':title,'url':'./document-templates/'+filename,'pages':pages}
(OUT/'templates.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
print('Generated three editable one-page documents. English-only progress report; no signatures.')
