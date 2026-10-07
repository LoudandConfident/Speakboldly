# Speak Boldly

English coaching website with a course catalog, WhatsApp contact, quote requests, and a 60-question Language Hub placement test.

## Development

Requires Node.js 20 or newer. No dependency installation is required.

```sh
npm start
npm test
```

The local server uses port 3000; `PORT` overrides it. GitHub Pages serves the static site from `main`, repository root.

## Placement and anonymous email results

The test uses 60 selected dialogues and their keyed answers from the uploaded Language Hub test. A print PDF is retained in the repository without the key; it is not linked from the placement page. Submission immediately shows marks out of 60 and a provisional estimated range (Below A1, A1–A2, A2–B1, B1–B2, B2–C1). These are not publisher-validated cutoffs for the shortened test.

After reading the submission notice and pressing Submit, participants' anonymous scores, estimated levels, answered counts, timestamps, and attempt identifiers are emailed to Mira through FormSubmit. No participant name, email, or answer choices are sent. The recipient address is configured in `placement-config.js`.

**Activation and a live delivery check are required.** The first request may cause FormSubmit to send an activation email to the recipient. The recipient must click the activation link. Then submit a fresh sample test and confirm the actual result email arrives. A service response confirms request acceptance, not inbox delivery. Local checks cover payloads, response handling, errors and retry; this cloud environment's network policy blocked live access to FormSubmit.

Failed requests can be retried; each email includes an attempt ID to identify duplicates. This service does not guarantee deduplication if an email is accepted but the response is lost. Results are retained in the participant's browser for recovery and in the recipient's inbox after delivery. There is no centralized database or automatic dashboard; inbox results can be used for analysis. Old attempts are not automatically sent under the new email-delivery setting.

The unused Google Sheets collector remains in `google-sheets/` as an optional alternative; it is not connected to the current site.

The HTML file `googlef6de591683171555.html` is the Google Search Console verification file and must remain at the published site root.

## Students Portal

Exercises, exams, progress reports, and material links are grouped behind a shared Student Code. Codes change automatically at midnight in Cairo. Edit a date’s 4-digit value in `DAILY_STUDENT_CODES` in `portal-config.js` and publish to choose or replace it. The calendar covers all 366 month-days, including February 29, and repeats yearly. Open portals lock when the daily code changes (checked every 30 seconds, on returning to the page, and on submission). Add resource entries to the corresponding arrays in that file when content is supplied. No learning material is uploaded yet. Public uploads in `student-files/exercises`, `student-files/exams`, `student-files/reports`, and `student-files/material` are discovered through the public GitHub API when the portal opens. Use Refresh materials to reload after an upload. If GitHub is unavailable or rate-limited, the portal displays an error and allows retry. Uploads must finish GitHub Pages publishing before their links work. Unlocking lasts only for the current visit; reloading requires the code again.

This is a client-side convenience gate, not secure authentication. Public GitHub Pages files and code can be inspected or accessed directly. Do not upload confidential individual progress reports here; use private authenticated storage for those.

### Owner uploads

Sign in to the GitHub account with write access to `LoudandConfident/Speakboldly`. Open the appropriate repository folder, choose Add file → Upload files, and commit to main. No GitHub token is put into the public website. GitHub authenticates the owner upload; the website itself does not implement owner accounts or file uploads. Only public, non-confidential materials belong in these folders. The Portal offers Student portal and Admin portal. Student portal contains the daily code gate and viewing sections; Admin portal contains owner upload links to GitHub. GitHub authenticates actual upload permission; selecting Admin portal is not a website login. There are no delete controls in the portal; repository owners still have GitHub deletion permissions.

The readable annual schedule is `student-code-calendar.csv`; all daily codes are strings, including codes starting with zero. The calendar and codes are public like the client-side gate. After changing codes in `portal-config.js`, regenerate the CSV to keep it synchronized.

Portal resources use View links without download attributes or buttons. Viewable public files remain saveable through the browser; there is no guaranteed download prevention.
