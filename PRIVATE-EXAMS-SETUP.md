# Private exams deployment

The shared exam workflow is implemented and tested locally. GitHub Pages serves the public website only; it cannot run the private API. No external backend is connected yet.

## Runtime and private storage

Use Node.js 24 or later and a host with HTTPS and a persistent writable disk. SQLite stores clients, sessions, access events, submissions and reviewed results on that disk. Back up the database and private exam data. Running on an ephemeral disk would lose records on restart/deployment.

Required environment settings:

- `EXAM_ADMIN_PASSWORD`: a private owner password of at least 12 characters, supplied securely in the hosting environment. Do not put it in the repository or public JavaScript. The public convenience code 1962 is unchanged and is not the private backend password.
- `EXAM_DATA_DIR`: absolute path to the persistent private data directory.
- `EXAM_ALLOWED_ORIGINS`: `https://loudandconfident.github.io` (include a custom site's origin if used, separated by commas).
- `PORT`: the host's assigned HTTP port.

Build the private content from the owner-supplied Word documents:

```sh
python3 scripts/prepare-exams.py /path/to/source-documents --out /path/to/private-data/exams.json
```

The output includes answer keys and listening scripts. Upload it only to the private server's data directory. Do not commit it or put it on GitHub Pages. The existing public PDFs contain student sections only.

Start with `node server.mjs`. `GET /api/status` must return `{"ready":true}`. With the private password/data missing, the API returns an unavailable error instead of accepting submissions.

Set `EXAM_BACKEND_URL` in `exam-config.js` to the private server's HTTPS origin and publish the website. Local development automatically uses the same origin on localhost.

## Owner and client workflow

Open Admin portal with 1962, then expand **Exam submissions & reviews** and connect using the private owner password. Connecting loads clients from the private server. Add/edit clients in the normal dashboard to save their codes and permissions to shared storage. Existing browser-only clients are not automatically uploaded; enter them into private storage once. Student codes must be unique and cannot be 1962.

Students use their assigned code to open permitted exams, then choose **Take interactive exam**, complete sections A–E and submit. The owner sees client-linked opened/submitted events and submitted answers. Multiple choice is marked server-side. Sections B–E each receive 0–20 marks from the owner. Section A is 20 questions worth one mark each. The final percentage is the total out of 100 and is hidden from students until review is saved.

Students waiting on an open result page receive a status check every 25 seconds. Reopening the exam also retrieves the reviewed result and feedback. Submitted answers are immutable. Review marks can be revised by the owner.

Each code identifies its assigned client account; it does not prove the physical identity of someone sharing that code. Student login allows three entries per client per Cairo day, with three incorrect guesses per source IP per day; the allowance is persisted in SQLite. The source IP is the direct connection address, so review proxy handling when hosting behind a reverse proxy. The public 1962 preview is exempt. The server also limits login requests, uses expiring opaque session tokens, and enforces client-specific exam permissions. Use a host that serves the API only over HTTPS.

## Scope and remaining limitations

- Shared storage covers clients and interactive exam access, answers and results.
- The session calendar remains browser-only.
- Other material upload links and student PDFs still use public GitHub storage; file URL privacy or copy prevention is not provided by that storage.
- The listening exercise needs teacher instructions or a separately supplied recording; the Word documents do not contain playable audio.
- The private backend and owner dashboard do not automatically send result emails; reviewed results appear in the student's portal.
- Browser-only records are not silently treated as shared records when connecting fails.

## Validation

`npm test` covers authorization, client isolation, locked exams, score validation, hidden results before review, persistent data across backend restart, origin restrictions and unconfigured services. A separate-browser functional check also verifies private client creation, student submissions, owner review and student final results.

## Score emails after review

Set SMTP_HOST, SMTP_PORT (587 with STARTTLS or 465 with TLS), SMTP_USER, SMTP_PASSWORD, and SMTP_FROM in the private host's secure environment settings. SMTP_FROM must be an address approved by your sending provider. Replies go to speakboldly16@gmail.com. No password belongs in GitHub or chat.

Saving a review sends the final percentage and feedback to the email registered for that client. The dashboard reports sent, failed, or not configured. Sent means the mail provider accepted the message; inbox delivery is not guaranteed. Saving unchanged marks again does not duplicate a successfully sent email; saving changed marks sends an updated result. If delivery failed, saving again retries. Marks remain saved even if mail fails. Restarting during delivery may leave a sending status; check delivery with the provider before retrying.

GitHub Pages cannot run this server or send SMTP mail. Until private hosting and SMTP are connected, reviews and automatic score email are not live.

## Timers, uploads, and student sessions

Exams start a server-authoritative 25-minute deadline on first opening. Draft answers autosave; time continues if the student leaves. On expiry, saved answers are submitted for teacher review. Students can request 10 extra minutes once. Requests appear in the admin submissions list, checked every 15 seconds while connected; the teacher must approve or decline. Approval after expiry reopens an automatically submitted attempt for 10 minutes. Resolve requests before marking.

Students re-enter their code after switching away from the portal, hiding the browser tab, or leaving the page. Individual codes allow three entries per Cairo calendar day. Changing a client's code invalidates their old server sessions. Browser-only limits can be cleared by a user; private-server limits are authoritative.

The admin's computer file picker uploads to persistent private storage only after connection. PDF, images, audio, and video are supported, up to 32 MB per upload. Multiple files upload sequentially. Selecting a client grants access to those new files; selecting Full library requires assigning file permissions later. No deletion endpoint is provided. Back up the database and uploads directory together. Confidential files must never go to the public GitHub repository.

PDFs display as canvas pages without browser PDF download controls; media hides download controls. Browser shortcuts and context menus are suppressed inside the student portal, but copying, network retrieval, and screenshots cannot be prevented absolutely. Existing public GitHub files remain public.

Development setup: Node 24+, `npm ci`, then `npm start`. Run `npm test`. Vendor PDF.js browser files and its Apache license are committed, so no runtime CDN is required.
