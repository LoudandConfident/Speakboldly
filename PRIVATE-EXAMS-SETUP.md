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

Each code identifies its assigned client account; it does not prove the physical identity of someone sharing that code. The server limits login requests, uses expiring opaque session tokens, and enforces client-specific exam permissions. Use a host that serves the API only over HTTPS.

## Scope and remaining limitations

- Shared storage covers clients and interactive exam access, answers and results.
- The session calendar remains browser-only.
- Other material upload links and student PDFs still use public GitHub storage; file URL privacy or copy prevention is not provided by that storage.
- The listening exercise needs teacher instructions or a separately supplied recording; the Word documents do not contain playable audio.
- The private backend and owner dashboard do not automatically send result emails; reviewed results appear in the student's portal.
- Browser-only records are not silently treated as shared records when connecting fails.

## Validation

`npm test` covers authorization, client isolation, locked exams, score validation, hidden results before review, persistent data across backend restart, origin restrictions and unconfigured services. A separate-browser functional check also verifies private client creation, student submissions, owner review and student final results.
