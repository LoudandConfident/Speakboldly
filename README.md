# Speak Boldly

English coaching website with a course catalog, WhatsApp contact, quote requests, and a 50-question Language Hub placement test.

## Development

Requires Node.js 20 or newer. No dependency installation is required.

```sh
npm start
npm test
```

The local server uses port 3000; `PORT` overrides it. GitHub Pages serves the static site from `main`, repository root.

## Placement and anonymous email results

The test uses 50 selected dialogues and their keyed answers from the uploaded Language Hub test. A print PDF is retained in the repository without the key; it is not linked from the placement page. The assessment introduction links to a separate question view with a 20-minute countdown. The timer continues while navigating other views and automatically submits when time runs out. The ten simplest opening dialogues have been removed; retained questions preserve source identifiers and have matching answer keys. Submission immediately shows marks out of 50 and a provisional estimated range (Below A1, A1–A2, A2–B1, B1–B2, B2–C1). These are not publisher-validated cutoffs for the shortened test.

After reading the submission notice and pressing Submit, participants' anonymous scores, estimated levels, answered counts, timestamps, and attempt identifiers are emailed to Mira through FormSubmit. No participant name, email, or answer choices are sent. The recipient address is configured in `placement-config.js`.

**Activation and a live delivery check are required.** The first request may cause FormSubmit to send an activation email to the recipient. The recipient must click the activation link. Then submit a fresh sample test and confirm the actual result email arrives. A service response confirms request acceptance, not inbox delivery. Local checks cover payloads, response handling, errors and retry; this cloud environment's network policy blocked live access to FormSubmit.

Failed requests can be retried; each email includes an attempt ID to identify duplicates. This service does not guarantee deduplication if an email is accepted but the response is lost. Results are retained in the participant's browser for recovery and in the recipient's inbox after delivery. There is no centralized database or automatic dashboard; inbox results can be used for analysis. Old attempts are not automatically sent under the new email-delivery setting.

The unused Google Sheets collector remains in `google-sheets/` as an optional alternative; it is not connected to the current site.

The HTML file `googlef6de591683171555.html` is the Google Search Console verification file and must remain at the published site root.

## Student portal and owner uploads

Exercises, exams, progress reports, final reports, listening tracks, and Full material are offered inside the page, with inline image and PDF viewing. Upload links are in Admin portal and use the owner's GitHub sign-in. Material lists load automatically on opening Student portal. The Refresh materials button has been removed. Browser save capabilities cannot be fully disabled.

The daily-code calendar has been retired. Code 1962 opens the full Student portal as an owner convenience code; it is reserved and cannot be assigned as a new individual client code. Admin assigns each client a unique four-digit code and folder/file permissions through a separate client editor. Student code lookup reads only the same browser’s localStorage; it does not work on a student’s separate device. Unselected folders and files are dimmed with lock symbols in this local prototype. Admin can edit grants later and preview the full library. Existing uploads on GitHub Pages are public; confidential reports must move to private authenticated storage.

The next requested system needs shared backend storage so admin client records, individual client codes, uploaded files, and access grants work across devices. Provider selection is pending; do not claim these permissions are enforced before the backend is connected and verified.

## Admin dashboard

Admin portal has a fixed convenience code `1962`, independent of assigned client codes. It includes total hours taught, client count, and add/edit client records for name, numeric level or training program, Student Code, folder/file access, payment status, email and hours taught. Records are saved in the current browser’s localStorage only, never committed or sent to the public website. Reloading preserves them on the same browser; clearing storage loses them. There are no delete or export controls. Leaving the portal or switching to Student portal locks the admin view.

The fixed code is visible in public source and is not secure authentication. This is a local dashboard prototype, not private cloud client management. A backend with real authentication and private storage is required before synchronizing confidential client records across devices or enforcing file permissions. The UI does not create private cloud folders or copy files to private client storage; library selections reference public files. Do not upload confidential reports via the GitHub links.

## Admin session calendar

The dashboard includes a monthly calendar using Cairo dates. Use + on a date, select an existing client, and enter the session number. Entries display name initials (for example MS #2); clicking an entry opens the client editor. Sessions link to stable client IDs and display the client’s current name. Session data is stored only in the current browser under `speak-boldly-admin-sessions-v1`, without cloud synchronization or automatic emails. Scheduled sessions do not change the hours-taught total. Locking the admin dashboard clears the calendar display; login reloads saved sessions. There are no session delete controls.

## Level exams

The Exams panel contains separate Level one through Level six exam sections, backed by six student PDFs converted from the supplied Word documents. Teacher listening scripts and answer keys are excluded from these public student versions; original attachments are not published. The bundled exam list works when GitHub listing requests fail and avoids duplicate entries. Admin can assign individual exam file permissions alongside folder access. Like other GitHub Pages files, the PDF URLs are public, and the current browser-only code gate does not provide private storage or prevent saving.

## Interactive exams and private review

The interactive exam workflow is implemented with a Node 24/SQLite backend and is validated locally, but it is not connected to an external host. See [PRIVATE-EXAMS-SETUP.md](PRIVATE-EXAMS-SETUP.md) for deployment, private data preparation, shared client management, access tracking and reviewed percentages. Public GitHub Pages alone cannot run the private server. Teacher answer keys are generated only into ignored private data; never publish that directory. The dashboard convenience code remains 1962, and a separate private owner password protects the backend.

Page signatures now use a plain font with “English language Coaching” and “Prepared fully by Mira Nasser Louis.” The extra Lock Admin portal and Open Student portal dashboard buttons have been removed.

## Student code attempt allowance

Individual student code entry is limited to three attempts per Cairo calendar day. On the current unconnected public site, this is stored in the browser and resets at Cairo midnight; changing/clearing browser storage can bypass that local limit. Code 1962 is exempt. The private backend persists three successful logins per client per day and blocks further guesses after three incorrect codes from a source IP that day, without applying that daily allowance to the owner. Shared backend enforcement still requires hosting configuration.

Material contains compressed books for Levels 1–8 named `B-Level-N-Book.pdf`. The duplicate compressed ZIP uploads for Levels 1–2 were identical and added only once.

## Daily motivation

A small “Let me motivate you today” tab at the top right opens a dedicated page showing the daily picture, a longer related reflection in dark green. Content changes at midnight in Africa/Cairo. Update `dailyQuotes` and `quoteDetails` in `home-gallery.js` to change the rotation. Promotional coaching lists are excluded.

## Automatic class confirmations

The private Node server stores class dates, Cairo times, session numbers and reminder status in SQLite. Every 30 seconds it checks for reminders due 24 hours before class. It sends to the client's current registered email address, confirming the date, time, session number, Zoom meeting link, passcode and no same-day cancellation policy. Classes added less than 24 hours ahead are reminded on the next check. Past or cancelled classes do not receive pending reminders. Use Cancel before adding a replacement session with the same number.

**Activation:** GitHub Pages cannot run this scheduler. Deploy `server.mjs` on an always-on Node 24+ host with persistent storage, configure `EXAM_ADMIN_PASSWORD`, `EXAM_DATA_DIR`, `EXAM_ALLOWED_ORIGINS` and SMTP credentials privately, and point `EXAM_BACKEND_URL` in `exam-config.js` to that HTTPS server. Set `SMTP_FROM=speakboldly16@gmail.com` and use an email provider authorized to send from that address (for Gmail, use an app password in the host's secret settings). Sign in to private storage, save clients there, then schedule their classes with times. Existing browser-only calendar entries must be entered in private storage; they do not automatically send.

The backend `/api/status` exposes `remindersReady`; the private calendar shows email connection state and each session's reminder status in the entry tooltip. Failed sends retry after five minutes, up to three attempts. A delivery interrupted during server shutdown is marked `delivery_unknown` and is not blindly resent; check the sender's mailbox/provider before rescheduling. A `sent` status means the provider accepted the email, not that inbox arrival is guaranteed. Verify one controlled test delivery before relying on live reminders. Server downtime can delay a reminder; an always-on host is required.

For the prepared Render deployment, follow [CLASS-REMINDERS-SETUP.md](CLASS-REMINDERS-SETUP.md). Hosting and Gmail delivery are not activated by publishing the website.

The teacher dashboard's button next to the Clients table queues confirmations for all future, unsent scheduled classes using the current registered client addresses. New clients are included when their future classes are scheduled. It requires the same private backend and SMTP connection as automatic reminders. Queue acceptance is shown separately from delivery; sent, failed and interrupted statuses are available in the calendar. Classes with an earlier confirmation are not sent twice.

## Editable teacher PDF documents

Teacher Portal → Reports and Confirmation Documents uses the three supplied PDF templates. The progress report is rebuilt as two landscape pages; final and registration/payment reports retain their portrait layouts. Footer email addresses are removed and optional typed signature fields are provided. Blank templates are public; completed reports and recipient details are stored only on the teacher’s device. No email is sent by this feature until Apps Script integration is added.

PDF view supports editable field overlays; Edit fields provides larger mobile inputs. Download editable PDF preserves AcroForm fields. Preview final PDF flattens entered values into the document. Prepared documents can be reopened and edited for a selected client.

Rebuild templates with `python scripts/build-teacher-templates.py /path/to/the/three/source/pdfs` (PyMuPDF and reportlab). Source PDFs are not overwritten. Rebuild the browser PDF libraries after dependency changes with `node scripts/build-pdf-vendors.mjs`.
