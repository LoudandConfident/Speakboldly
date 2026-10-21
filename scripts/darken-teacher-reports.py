"""Apply Speak Boldly's dark report theme without changing field names or geometry."""
from pathlib import Path
import re
import fitz
ROOT=Path(__file__).resolve().parent.parent
GREEN=(25/255,60/255,50/255)
CREAM=(250/255,249/255,244/255)
FIELD=(.14,.29,.24)
def transform(match):
    values=list(map(float,match.group(1,2,3)))
    if match.group(4)==b'RG':color=GREEN if min(values)>.94 else (.58,.70,.61)
    elif min(values)>.94:color=GREEN
    elif min(values)>.75:color=FIELD
    else:color=CREAM
    return (' '.join(str(round(v,6)) for v in color)+' '+match.group(4).decode()).encode()
for name in ['progress-report.pdf','final-report.pdf','registration-payment-confirmation.pdf']:
    path=ROOT/'document-templates'/name
    doc=fitz.open(path)
    if 'sb-dark-report-v1' in (doc.metadata.get('keywords') or ''):
        doc.close();continue
    for page in doc:
        page.clean_contents()
        for xref in page.get_contents():
            data=doc.xref_stream(xref)
            data=re.sub(rb'([\d.]+)\s+([\d.]+)\s+([\d.]+)\s+(rg|RG)\b',transform,data)
            # Preserve the existing green logo on a small light backing.
            data=re.sub(rb'(/[\w.]+\s+Do\b)',rb'q .980392 .976471 .956863 rg 0 0 1 1 re f Q \1',data)
            doc.update_stream(xref,data)
        for widget in page.widgets():
            widget.fill_color=FIELD;widget.border_color=(.58,.70,.61);widget.text_color=CREAM
            widget.update()
    metadata=doc.metadata;metadata['keywords']=((metadata.get('keywords') or '')+' sb-dark-report-v1').strip();doc.set_metadata(metadata)
    temp=path.with_suffix('.tmp.pdf');doc.save(temp,garbage=4,deflate=True);doc.close();temp.replace(path)
