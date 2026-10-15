"""Reuse the existing instructor dashboard in the installable phone app."""
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
source = (ROOT / 'index.html').read_text()
start = source.index('<div id="admin-portal"')
fragment = source[start:]

class Extract(HTMLParser):
    depth = 0
    end = None
    def handle_starttag(self, tag, attrs):
        if tag == 'div' and self.end is None:
            self.depth += 1
    def handle_endtag(self, tag):
        if tag != 'div' or self.end is not None:
            return
        self.depth -= 1
        if self.depth == 0:
            line, column = self.getpos()
            self.end = sum(len(part) for part in fragment.splitlines(keepends=True)[:line-1]) + column + len('</div>')

parser = Extract()
parser.feed(fragment)
if parser.end is None:
    raise RuntimeError('Instructor dashboard could not be extracted')
dashboard = fragment[:parser.end].replace('class="portal-panel" hidden', 'class="portal-panel"', 1)
page = '''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#193c32"><meta name="robots" content="noindex,nofollow"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="SB Instructor"><title>Speak Boldly — Instructor</title><link rel="manifest" href="./instructor.webmanifest"><link rel="apple-touch-icon" href="./speak-boldly-preview-dark-green.png"><link rel="icon" href="./favicon.svg"><link rel="stylesheet" href="./styles.css?v=programs-button-below"><link rel="stylesheet" href="./mobile.css?v=programs-button-below"><link rel="stylesheet" href="./admin-calendar.css?v=registration-approval"><link rel="stylesheet" href="./teacher-documents.css?v=editable-pdf-templates"><link rel="stylesheet" href="./learning-space.css?v=momentum-and-uploads"><link rel="stylesheet" href="./instructor-app.css?v=app-resume"></head>
<body class="instructor-app"><header class="app-header"><img src="./sb-logo-green.svg" alt="Speak Boldly" width="36" height="36"><div><strong>Speak Boldly</strong><span>Instructor</span></div><a class="app-portals-link" href="./?app=owner#students-portal">Portal</a><button type="button" id="app-lock" class="button light small">Unlock</button></header><div id="app-network" class="app-network" role="status" hidden>You’re offline. Reconnect before saving changes.</div><main><details id="app-install" class="app-install"><summary>Add your app icon</summary><p>Open this page in Safari. Tap Share, then Add to Home Screen. Turn on Open as Web App if shown, then tap Add.</p></details><p id="app-locked-message">Your instructor dashboard, wherever you are.</p><section id="students-portal" class="catalog" data-instructor-only><button type="button" data-portal-area="client" hidden>Student portal</button><div id="client-portal" hidden></div>
''' + dashboard + '''
</section></main><nav class="app-nav" aria-label="Instructor shortcuts" hidden><button type="button" data-app-target="admin-students-list">Clients</button><button type="button" data-app-target="calendar-panel">Calendar</button><button type="button" data-app-target="exam-review">Exam review</button><button type="button" data-app-target="portal-switches">Dim / Undim</button></nav><script type="module" src="./instructor-app.js?v=momentum-and-uploads"></script><script type="module" src="./mobile-button-labels.js?v=all-buttons"></script><script type="module" src="./installed-app-ui.js?v=app-resume"></script><script type="module" src="./pull-to-refresh.js?v=early-touch-capture"></script><script type="module" src="./popup-dismiss.js?v=outside-tap"></script><script type="module" src="./save-feedback.js?v=registration-approval"></script></body></html>
'''
(ROOT / 'instructor.html').write_text(page)
