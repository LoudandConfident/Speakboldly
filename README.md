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

Exercises, exams, and progress report links are grouped behind a shared Student Code. Edit `STUDENT_CODE` in `portal-config.js` and publish to change the code for all visitors. Add resource entries to the corresponding arrays in that file when content is supplied. No material is uploaded yet. Unlocking lasts only for the current visit; reloading requires the code again.

This is a client-side convenience gate, not secure authentication. Public GitHub Pages files and code can be inspected or accessed directly. Do not upload confidential individual progress reports here; use private authenticated storage for those.
