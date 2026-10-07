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

## Student portal and owner uploads

Exercises, exams, progress reports, and Material are offered inside the page, with inline image and PDF viewing. Upload links are in Admin portal and use the owner's GitHub sign-in. Material lists load automatically on opening Student portal. The Refresh materials button has been removed. Browser save capabilities cannot be fully disabled.

The daily-code calendar has been retired. The temporary Student Code remains 1962 until private per-client authentication and permissions are connected. Client-specific folder/file restrictions are not implemented by this static gate. Existing uploads on GitHub Pages are public; confidential reports must move to private authenticated storage.

The next requested system needs shared backend storage so admin client records, individual client codes, uploaded files, and access grants work across devices. Provider selection is pending; do not claim these permissions are enforced before the backend is connected and verified.

## Admin dashboard

Admin portal has a fixed convenience code `1962`, independent of the Student Code calendar. It includes total hours taught, client count, and add/edit client records for name, CEFR level, payment status, email and hours taught. Records are saved in the current browser’s localStorage only, never committed or sent to the public website. Reloading preserves them on the same browser; clearing storage loses them. There are no delete or export controls. Leaving the portal or switching to Student portal locks the admin view.

The fixed code is visible in public source and is not secure authentication. This is a local dashboard prototype, not private cloud client management. A backend with real authentication and private storage is required before synchronizing confidential client records across devices.
