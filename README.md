# Speak Boldly

English coaching website with a course catalog, WhatsApp contact, quote requests, and a 50-question Speak Boldly grammar and vocabulary placement test.

## Development

Requires Node.js 20 or newer. No dependency installation is required.

```sh
npm start
npm test
```

The local server uses port 3000; `PORT` overrides it. GitHub Pages serves the static site from `main`, repository root.

## Placement and anonymous email results

The placement test contains 50 original Speak Boldly questions: 25 grammar and 25 vocabulary, with one past-perfect item. Each ten-question page mixes two items from each approximate A1–C1 difficulty band, rather than progressing from easy to hard. Vocabulary covers everyday language, collocations, phrasal verbs, word formation and nuance. The question bank and matching key use version speak-boldly-balanced-50-v2. The 20-minute timer, immediate score out of 50, provisional estimated range and branded result-image saving remain. Difficulty labels and score ranges are editorial estimates, not validated CEFR cutoffs. The older publisher print PDF is retained as a legacy resource and is not linked from the current placement test.

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

The Exams panel contains separate Level one through Level six exams transcribed into text, with assessment-style pages, multiple-choice options and written-answer fields. Teacher preview and the unconnected static site display these text exams; static practice answers are not submitted or graded. With private exam storage connected, student exams retain their timed submission and teacher-review workflow. The six student PDFs remain as source documents. Teacher listening scripts and answer keys are excluded from these public student versions; original attachments are not published. The bundled exam list works when GitHub listing requests fail and avoids duplicate entries. Admin can assign individual exam file permissions alongside folder access. Like other GitHub Pages files, the PDF URLs are public, and the current browser-only code gate does not provide private storage or prevent saving.

## Interactive exams and private review

The interactive exam workflow is implemented with a Node 24/SQLite backend and is validated locally, but it is not connected to an external host. See [PRIVATE-EXAMS-SETUP.md](PRIVATE-EXAMS-SETUP.md) for deployment, private data preparation, shared client management, access tracking and reviewed percentages. Public GitHub Pages alone cannot run the private server. Teacher answer keys are generated only into ignored private data; never publish that directory. The dashboard convenience code remains 1962, and a separate private owner password protects the backend.

Page signatures now use a plain font with “English language Coaching” and “Prepared by Mira Nasser Louis.” The extra Lock Admin portal and Open Student portal dashboard buttons have been removed.

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

## Installable instructor phone app

Speak Boldly includes a web app manifest, 192/512px app icons, an iPhone home-screen icon and a service worker. After publication on HTTPS, open Instructor portal and choose the small **Install** button on the right. Android Chrome supports the install prompt; iPhone Safari uses Share → Add to Home Screen → Add (enable Open as Web App when shown). The app launches at the instructor entry; installation does not bypass the instructor code. It is a home-screen web app, not an App Store or Play Store listing.

Only a connection-help page is cached offline. Pages, uploaded documents and backend responses are fetched live. Internet is required for the instructor workspace. Local browser data and connection settings may need to be entered again in the installed app, especially on iPhone; installation does not migrate them automatically. The installable app does not change the website's audience or make its public files private.

Phone-app files are prepared locally; GitHub Pages publication and testing on a physical phone remain required before installation can be confirmed.

### Monthly learning-folder passwords
Material has a separate password for each level (1–8). Examinations and Exercises each use one shared folder password. Existing monthly rotation remains in place; Examinations do not require dim/undim controls.

Motivation changes daily at midnight in Cairo. Each copied motivation link has a static picture preview; the receiving app controls its display.

### Daily Mission
Daily Mission is a card beside the other Learning Hub cards. It is password-free and opens three short paragraphs with a read-aloud button, five vertically arranged activities: Say it, Hear it, Build it (brief sentence structures with examples), Fix it (two incorrect sentences with separate answer reveals), and Use it (two expressions from the reading). There are 183 sets per level group (549 total): the original 24 topics plus 159 new scenarios, each with separate A1–A2, B1–B2, and professional C1–C2 readings and comprehension questions. The 183-day cycle starts on 15 October 2026. Only the selected level’s current 31-set chunk is downloaded. Rebuild the library with `node scripts/build-daily-mission-library.mjs` after editing `content/daily-mission-scenarios.txt`. No Apps Script update is required. Content rotates at midnight Africa/Cairo. The selected level is remembered on the device. No name, notes, written response, or completion check-in is requested. Existing locally saved history is preserved but no longer displayed. Come back tomorrow is a closing statement. Audio uses the device's English voice; written text remains available as a fallback.

The Learning Hub Install button offers the browser's native installation prompt when available and Safari/Chrome instructions otherwise. Its separate learning-hub.webmanifest opens the learner portal, not the instructor dashboard. These features do not require an Apps Script update.

### Interactive examinations and booking pages

Examinations now cover Levels 1–8, with a shared folder password, name/level entry and a server-enforced 20-minute timer. Versioned templates total 40 marks: choose 10, complete 5, correct 5, writing 10, comprehension 5 and punctuation 5. Submissions and provisional automatic scores go to the instructor by email; student receipts omit scores and feedback. Exam Review has been removed from the dashboard. Saved Placement Test and Learner Test images include the logo and © Prepared by Mira Nasser Louis.

Learning Hub destinations open as section pages. Daily Mission sits to the right of Material on desktop. Native English changes its curated page and brief at Cairo month boundaries. Existing books appear in their matching Material levels with generic titles, and the earlier worksheets appear under Exercises. Student calendar cells display 12-hour times; the server enforces the six-week booking window. Conditional booking instructions link both free assessments, request payment screenshots when relevant, and send approval requests to speakboldly16@gmail.com. Students are not asked for a program; the instructor can choose it during approval when the request did not come from a specific program.

These shared features use the existing Google Apps Script and Sheets backend, with no new server or hosting setup. Update the existing deployment once: [complete Apps Script and steps](google-sheets/clients/EXAM-UPDATE.md).

Daily Tasks show one reading title followed by five cards: Hear it, Say it, Learn it, Build it and Fix it. Learn it displays two expressions with meanings and examples. Build it is an open card with the daily grammar insight; its 60 brief notes rotate by Cairo date and live in `content/daily-grammar.txt`. Fix it has two incorrect sentences and separate answer reveals. Written practice, the bonus follow-up and the in-task Contact Instructor button are removed. The closing statement is “That’s a wrap! Same time tomorrow?” No Apps Script deployment is needed.

Instructor-only **Library & Practice uploads** supports Level 1–12, separate Main book / Activities / Audio Library partitions, and Practice Zone uploads. New files start dimmed; existing level passwords and Dim/Undim settings still apply. Student upload controls are removed. Private uploaded files require the one-time Apps Script deployment update in [LIBRARY-UPLOADS.md](google-sheets/clients/LIBRARY-UPLOADS.md). Maximum upload size is 5 MB per file.

The Daily Challenge’s idiom and encouragement quote use a right sidebar on laptop and a compact two-column area on phones. A single Fun circle opens one short joke (with a hidden punchline and explanation) and one funny expression with its meaning/example. Twelve short humour notes rotate by Cairo day; no games, extra inputs or backend deployment are required.

Real English keeps its daily idiom in a compact expandable side card, with Fun and an illustrated quote. These extras no longer occupy the Daily Challenge sidebar. Dashboard entry shows loading feedback, shares concurrent catalogue requests and reuses access settings for up to 15 seconds. The homepage measures the available viewport to fit its hero, links and footer on common phone and laptop screens.

Daily Challenge includes its daily expandable idiom and a Fun circle. Real English retains Fun and the illustrated quote. Paragraph feedback covers additional common agreement and verb-pattern errors; suggestions never replace the learner’s writing automatically. These remain local pattern checks rather than a complete language review.

Paragraph correction includes additional local rules for perfect tenses, irregular past forms, modals, gerunds, plurals, prepositions, contractions and common spelling errors. Question punctuation uses a separate character-level edit so other grammar feedback does not suppress it. Valid-usage regression examples accompany the added checks; this is still a pattern-based checker.

Reports open in an editable PDF view fitted to the available width, with 50%, 75% and larger zoom options. Overlay comments wrap and shrink within their printed rectangles, while Edit fields provides larger writing controls. Exported PDFs auto-size text and remove the templates’ obsolete 100-character limits. Client rows keep Action plan within Actions.

All three report templates share a toolbar containing title, close/navigation, zoom, save, download, preview and send controls on one background above the document. Report pages scroll normally and the controls do not float over editable rectangles.

Reports use a dark green background with cream text and lighter green fields in the editor and exported PDFs. Notes and Action Plan PDF exports share that theme. `scripts/darken-teacher-reports.py` applies the theme to existing templates while preserving field names and positions.

Each current client row includes “Payment reminder for new round”. The owner reviews the recipient before sending. The Apps Script `paymentReminder` email uses the saved client address, requires owner authentication and logs request IDs to prevent duplicate sends on retry. Deploy the updated UnifiedCode.gs to enable this new email kind.

The hours update includes a one-time, uniquely matched client correction. Once applied, a persistent per-client script property prevents it from running again; completed future appointments count normally and the original manual-hours safeguards remain. Deploy the updated script and refresh Clients to apply the correction.

Material Library starts with nine program folders; SB General Conversation contains twelve levels and preserves existing level files. Instructor uploads select the same folder, with books, activities and audio kept separate. Workshop uploads retain the existing material access gate and file dimming. Write Boldly! (four sessions) and Reclaim your focus workshop (eight sessions, Others) are dimmed with Stay tuned. Daily Challenge answers are cleared on leaving, legacy answer drafts are removed, and its illustrated encouragement changes by Cairo date. Fun circles are removed. Section guides use compact top-right question marks, and Learning Hub content starts higher on the page.

The new-round reminder uses a compact client-row button and a browser-compatible request ID fallback. Reminder copy politely requests payment before the next round and thanks the learner for their trust. Session scheduling gives the hour/minute/AM-PM controls a full-width row. Deploy the updated UnifiedCode.gs for the revised email wording.

Manual client-hour edits now adjust the dashboard total independently of calendar session records; future completed sessions still add hours. Actions includes Deactivate/Reactivate, and inactive records are dimmed and excluded from the active client count while all historical hours remain in the taught-hours total. Daily motivations resume on 25 October 2026, with later instructor freezes respected. The instructor can schedule or edit a quote, reflection and public picture (up to 2 MB) under Daily Motivation. These features require the current UnifiedCode.gs deployment. Vision presents the teaching story, need/heart section, enrollment promise, and support dream with a side map before the photo gallery. Homepage offers are stacked consistently.

### Bold Blog and shorter assessment feedback

The home page has three compact speech-bubble links: Reviews, Daily motivation, and Bold Blog. The instructor dashboard includes a Bold Blog editor for 1–5 text pages per topic, drafts, published posts, and future publish dates in Cairo time. Articles are stored in the Bold Blog sheet; private drafts and future posts are excluded from public reads. Deploy the updated `google-sheets/clients/UnifiedCode.gs` as a New version to enable the editor and reader (split-file installations also need `BoldlyNotes.gs`). Assessment feedback now gives shorter level-specific actions and concise course / independent-practice advice.

Bold Blog now appears in the main menu immediately before Join us. Posts display as continuous scrollable articles. The instructor can upload up to five JPG/PNG/WebP pictures per post (2 MB each, 5 MB total), retain or remove saved pictures, and keep posts private until their publish date. Text sections are joined into the article with pictures between them.

### Lighter loading and contact number

Portal, reviews, learner-profile, motivation and blog modules load when their section opens. Homepage checks reduced JavaScript requests from 108 to 29 (679,326 to 165,801 uncompressed bytes). The continuous tail of the website stylesheets is bundled into `site-theme.css` in its original order. After editing a stylesheet listed in `site-theme-files.json`, run `node scripts/build-site-theme.mjs` and update the bundle cache query in index.html. Loading announcements remain accessible while a green rotating ring replaces their visible text. Errors remain readable. Contact number: 01283786904; WhatsApp buttons remain inactive pending activation.

### Public SB Policy

Registration & payment links to `brochures/SB-Policy.pdf` through the shared in-page document viewer, with a Save PDF option. Edit `content/sb-policy.json` and run `node scripts/build-sb-policy.mjs` to rebuild the one-page dark-green document. It includes the existing payment, refund, round and cancellation rules; 24-hour advance notice; rescheduling subject to instructor agreement/availability; and the 15-minute lateness cutoff with 15 minutes deducted. Reclaim Your Focus has its own focus/target/timer illustration and remains Stay tuned.
