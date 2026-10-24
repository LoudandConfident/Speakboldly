"""Apply the shared document identity without moving or renaming report fields."""
from pathlib import Path
import json, subprocess, sys
import fitz
ROOT=Path(__file__).resolve().parent.parent
brand=json.loads(subprocess.check_output(['node','--input-type=module','-e',"import {DOCUMENT_BRAND} from './document-branding.js';process.stdout.write(JSON.stringify(DOCUMENT_BRAND))"],cwd=ROOT,text=True))
logo=ROOT/brand['logo']
reports=[('document-templates/progress-report.pdf','Progress report'),('document-templates/final-report.pdf','Final exam report'),('document-templates/registration-payment-confirmation.pdf','Registration & payment confirmation')]
paths=reports if '--reports-only' in sys.argv else reports+[('brochures/SB-Policy.pdf','SB Policy')]
for filename,title in paths:
    path=ROOT/filename
    doc=fitz.open(path)
    dark='sb-dark-report-v1' in (doc.metadata.get('keywords') or '')
    background=(25/255,60/255,50/255) if dark else (1,1,1)
    ink=(250/255,249/255,244/255) if dark else (25/255,60/255,50/255)
    for index,page in enumerate(doc):
        # All images in these supplied forms are old logo marks, including footer duplicates.
        rects={tuple(rect) for image in page.get_images() for rect in page.get_image_rects(image[0])}
        for rect in rects:page.add_redact_annot(fitz.Rect(rect),fill=background)
        page.add_redact_annot(fitz.Rect(24,16,page.rect.width-24,113),fill=background)
        if 'final-report' in filename or 'registration-payment' in filename:page.add_redact_annot(fitz.Rect(36,748,page.rect.width-36,818),fill=background)
        for block in page.get_text('blocks'):
            text=block[4].strip()
            if block[1]>750 and any(word in text for word in ['Prepared','Speak Boldly','English','Founded','1 /']):page.add_redact_annot(fitz.Rect(block[:4]),fill=background)
        for phrase in ['Final report','Registration & payment confirmation','Mira Nasser Louis','Coach']:
            for rect in page.search_for(phrase):
                if rect.y0>113:page.add_redact_annot(rect,fill=background)
        page.apply_redactions(images=2,graphics=0)
        left,top,size=brand['left'],brand['top'],brand['logoSize']
        page.insert_image(fitz.Rect(left,top,left+size,top+size),filename=str(logo))
        page.insert_text((left+size+16,61),'Speak Boldly',fontname='hebo',fontsize=22,color=ink)
        page.insert_text((left+size+16,86),title,fontname='helv',fontsize=13,color=ink)
        y=page.rect.height-brand['footerY']
        page.insert_text((left,y-10),brand['credentials'],fontname='helv',fontsize=brand['footerSize'],color=ink)
        number=f'{index+1} / {len(doc)}'
        page.insert_text((page.rect.width-left-fitz.get_text_length(number,fontsize=brand['footerSize']),y),number,fontsize=brand['footerSize'],color=ink)
    meta=doc.metadata;meta['author']=brand['founder'];doc.set_metadata(meta)
    temp=path.with_suffix('.branded.pdf');doc.save(temp,garbage=4,deflate=True);doc.close();temp.replace(path)
    print('Standardized',filename)
