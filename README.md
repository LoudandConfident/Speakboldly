# Speak Boldly

English coaching website with a course catalog, WhatsApp contact, quote requests, and a 60-question Language Hub placement test.

## Development

Requires Node.js 20 or newer. No dependency installation is required.

```sh
npm start
npm test
```

The local server uses port 3000; `PORT` overrides it. GitHub Pages serves the static site from `main`, repository root.

## Placement and anonymous analysis

The test uses 60 selected dialogues and their keyed answers from the uploaded Language Hub test. The student PDF contains the same 60 questions without the key. Submission immediately shows marks out of 60 and a provisional estimated range (Below A1, A1–A2, A2–B1, B1–B2, B2–C1). These ranges are not publisher-validated CEFR cutoffs for the shortened test. Speaking/listening and teacher assessment are needed to confirm placement.

The anonymous Google Sheets collector and setup steps are in [google-sheets/SETUP.md](google-sheets/SETUP.md). **Central collection is inactive until the owner deploys the Apps Script and sets `RESULTS_ENDPOINT` in `placement-config.js`.** There are no names or emails in the placement form or collected results. The backend recalculates scores, stores only anonymous result fields, deduplicates retries, and maintains private analysis tabs and a chart. Collection success is displayed only after the endpoint confirms it. Unconnected or failed saves are labeled clearly, and participants can download or email their own results.

Browser storage retains the current attempt to prevent accidental edits and support retrying failed saves. It is not an identity system or exam security mechanism. Participants see results on screen; automatic email delivery is not configured.

The HTML file `googlef6de591683171555.html` is the Google Search Console verification file and must remain at the published site root. Keep it after verification.
