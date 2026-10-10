"""Build editable teacher PDFs and field metadata from the three supplied originals.
Usage: python scripts/build-teacher-templates.py /path/to/original-pdfs
Requires PyMuPDF and reportlab; source PDFs are kept untouched.
"""
from pathlib import Path
import sys,json,math
import fitz
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4,landscape
from reportlab.lib.colors import HexColor
ROOT=Path(__file__).resolve().parent.parent
OUT=ROOT/'document-templates';OUT.mkdir(exist_ok=True)
source=Path(sys.argv[1])
green=HexColor('#193c32');cream=HexColor('#faf9f4');line=HexColor('#d4ded5');pale=HexColor('#edf1e9')
logo=fitz.open(stream=(ROOT/'sb-logo-green.svg').read_bytes(),filetype='svg');pix=logo[0].get_pixmap(matrix=fitz.Matrix(2,2),alpha=True);pix.save('/tmp/speak-boldly-document-logo.png')
progress=fitz.open(source/'1-Mid_Level_Progress_Report_Corrected.pdf')
groups=[]
for page in progress:
 for widget in page.widgets():
  _,section,label=widget.field_name.split('_',2)
  if not groups or groups[-1][0]!=section:groups.append((section,[]))
  groups[-1][1].append((widget.field_name,label))
W,H=landscape(A4)
c=canvas.Canvas(str(OUT/'progress-report.pdf'),pagesize=(W,H));c.setTitle('Speak Boldly — Mid-level progress report');c.setAuthor('Mira Nasser Louis')
for page_index in range(2):
 c.setFillColor(cream);c.rect(0,0,W,H,fill=1,stroke=0)
 c.drawImage('/tmp/speak-boldly-document-logo.png',28,H-57,38,38,mask='auto')
 c.setFillColor(green);c.setFont('Helvetica-Bold',18);c.drawString(78,H-34,'Speak Boldly');c.setFont('Helvetica',8);c.drawString(79,H-48,'English Language Coaching')
 c.setFont('Helvetica-Bold',16);c.drawRightString(W-28,H-33,'Mid-level progress report');c.setFont('Helvetica',8);c.drawRightString(W-28,H-48,f'{page_index+1} / 2')
 c.setStrokeColor(line);c.line(28,H-69,W-28,H-69)
 subset=groups[page_index*8:(page_index+1)*8]
 block_width=(W-68)/2;block_height=108;start_y=H-83
 for j,(section,fields)in enumerate(subset):
  x=28+(j%2)*(block_width+12);top=start_y-(j//2)*(block_height+8)
  c.setFillColor(pale);c.roundRect(x,top-20,block_width,20,4,fill=1,stroke=0);c.setFillColor(green);c.setFont('Helvetica-Bold',9.5);c.drawString(x+8,top-14,section)
  comments_x=x+block_width-110
  c.setFont('Helvetica',7.5);c.drawString(comments_x,top-32,'Comments')
  c.acroForm.textfield(name='Comments_'+section,x=comments_x,y=top-block_height,width=104,height=69,borderWidth=.5,borderColor=line,fillColor=cream,textColor=green,fontName='Helvetica',fontSize=8,fieldFlags='multiline',forceBorder=True)
  row_height=min(16,78/max(1,len(fields)))
  for k,(name,label)in enumerate(fields):
   y=top-38-k*row_height
   size=7.4
   while c.stringWidth(label,'Helvetica',size)>144:size-=.2
   c.setFillColor(green);c.setFont('Helvetica',size);c.drawString(x+4,y+3,label)
   c.acroForm.textfield(name=name,x=x+151,y=y,width=block_width-267,height=14,borderWidth=.5,borderColor=line,fillColor=cream,textColor=green,fontName='Helvetica',fontSize=8,forceBorder=True)
 c.setStrokeColor(line);c.line(28,49,W-28,49);c.setFillColor(green);c.setFont('Helvetica',8);c.drawString(28,32,'Prepared fully by Mira Nasser Louis')
 c.setFont('Helvetica',8);c.drawString(W-254,32,'Signature:')
 c.acroForm.textfield(name=f'Signature_page_{page_index+1}',x=W-208,y=24,width=180,height=18,borderWidth=.5,borderColor=line,fillColor=cream,textColor=green,fontName='Helvetica',fontSize=9,forceBorder=True)
 c.showPage()
c.save()
for original,filename in [('2-Registration_Payment_Confirmation_Corrected.pdf','registration-payment-confirmation.pdf'),('3-Final_Report_Blank.pdf','final-report.pdf')]:
 document=fitz.open(source/original)
 for page in document:
  for rect in page.search_for('speakboldly16@gmail.com'):page.add_redact_annot(rect,fill=(250/255,249/255,244/255))
  page.apply_redactions(images=0,graphics=0)
  for widget in page.widgets():
   if widget.rect.height>28:widget.field_flags|=fitz.PDF_TX_FIELD_IS_MULTILINE;widget.update()
  page.insert_text((325,741),'Signature:',fontsize=8,color=(25/255,60/255,50/255))
  widget=fitz.Widget();widget.field_name='Signature';widget.field_type=fitz.PDF_WIDGET_TYPE_TEXT;widget.rect=fitz.Rect(367,728,535,746);widget.text_font='Helv';widget.text_fontsize=9;widget.text_color=(25/255,60/255,50/255);widget.border_color=(.83,.87,.83);widget.border_width=.5;page.add_widget(widget)
 document.save(OUT/filename,garbage=4,deflate=True)
metadata={}
for key,title,filename in [('progress','Progress report','progress-report.pdf'),('final','Final exam report','final-report.pdf'),('registration','Registration & payment confirmation','registration-payment-confirmation.pdf')]:
 document=fitz.open(OUT/filename);pages=[]
 for index,page in enumerate(document):
  fields=[]
  for widget in page.widgets():
   rect=widget.rect
   label=widget.field_name.split('_',2)[-1] if widget.field_name.startswith('p') and '_' in widget.field_name else widget.field_name.replace('Comments_','Comments — ').replace('Signature_page_','Signature — page ')
   fields.append({'name':widget.field_name,'label':label,'x':rect.x0/page.rect.width,'y':rect.y0/page.rect.height,'width':rect.width/page.rect.width,'height':rect.height/page.rect.height,'multiline':bool(widget.field_flags&fitz.PDF_TX_FIELD_IS_MULTILINE),'maxLength':2000 if widget.field_flags&fitz.PDF_TX_FIELD_IS_MULTILINE else 300})
  pages.append({'width':page.rect.width,'height':page.rect.height,'fields':fields})
  page.get_pixmap(matrix=fitz.Matrix(.8,.8)).save('/tmp/'+filename.replace('.pdf','')+f'-page-{index+1}.png')
 metadata[key]={'title':title,'url':'./document-templates/'+filename,'pages':pages}
(OUT/'templates.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
print('Generated 3 editable templates, progress in 2 landscape pages, no footer emails, with signature fields.')
