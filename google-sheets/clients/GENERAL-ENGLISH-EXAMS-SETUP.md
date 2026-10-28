# General English interactive exams — 45 minutes

## What is included

Eight student PDFs supplied on 28 October 2026 have been transcribed into interactive Levels 1–8. Test Yourself → General English → Levels 1–12. Levels 9–12 are visible but unavailable until their real papers are supplied. There is one General English exam program, no four/eight-session duplicate. All available levels require their existing, distinct monthly **exam** password, separate from the Learning Library passwords. The instructor can view/change those passwords in **General English exams · passwords and submissions**.

Every test has five sections worth 20 marks each: vocabulary (10 word-bank selections), grammar (10 choices), reading (5 written answers), listening (5 written answers), and writing (level-specific task, target length and rubric). Listening is read live twice by the coach, as requested; no recording or examiner script is invented. The website uses the requested **45 minutes**, overriding the 75–120 minutes printed on the original PDFs. All five sections await instructor marking because no examiner answer key was supplied.

## Activate without replacing your original script

1. Open your **existing Clients Google Sheet → Extensions → Apps Script**. Add a NEW Script file named **GeneralEnglishExams**. Paste all of GeneralEnglishExams.gs into it. Keep Code.gs, DriveFolders.gs, CalendarEditing.gs, Rewards.gs, all client data and your signatures.
2. Inside your EXISTING `function doPost(...) {`, before its existing routing code, add:

```javascript
  if (typeof sbGeneralEnglishExamsHandleEvent === 'function') {
    const examResponse = sbGeneralEnglishExamsHandleEvent(arguments[0]);
    if (examResponse !== null) return examResponse;
  }
```

The block goes **inside** doPost, never at the top of the file. Do not add a second doPost function. Existing Drive/rewards/calendar routing blocks remain underneath.

3. Save. Select **setupGeneralEnglishExams → Run**, and approve permissions. Run this function only, not doPost or setupClientSync. It creates a new **GE exam attempts** sheet and one minute-based expiry trigger. On first setup it opens Levels 1–8 for exam passwords; it does not change Practice Zone/Library passwords, client/session rows, email signatures or historic exam attempts. Running it again preserves the current exam access choices.
4. **Deploy → Manage deployments → existing Clients web app → pencil → New version → Deploy.** Keep the same endpoint URL, Execute as Me and existing access settings.
5. Refresh the website. In the Instructor Dashboard open **General English exams · passwords and submissions → Refresh exams**. Check each password before sharing it. Levels 9–12 have reserved passwords but cannot be opened without their papers.

No Cloud billing, new web server, service-account JSON key or Google student login is needed. Existing Apps Script/Sheets/email quotas apply. The mailbox **Submissions@speakboldly.space** must exist and accept mail. Setup sends no examination email.

## Student flow

Open Test Yourself → General English → select the level → enter that level’s exam password → enter the name → Start 45-minute examination. Five pages, Previous/Next, Save answers, Submit examination. The timer begins only after the server accepts Start. Refreshing resumes the same examination in the same browser tab/session; the deadline never resets.

Answers autosave after a short typing pause. The server rejects changed answers received after the deadline; automatic timeout submits the latest successfully saved draft. The on-page notice explains this. If the page closes, the scheduled trigger submits expired saved drafts and sends their emails, normally within the next trigger run (Google may delay triggers). No website can save typing that never reached the server during an outage.

The receipt shows “Sent” only after the mail service accepts delivery. Queued/uncertain notifications show that the answers were saved and notification is pending. SMTP/inbox delivery itself cannot be guaranteed by the website.

## Instructor flow

The private exam panel provides:

- All 12 reserved monthly exam passwords; Save password/access for uploaded levels.
- Submitted attempts, names, levels and email delivery status.
- Full question/answer review, five marks out of 20, feedback and total out of 100.
- Retry email; uncertain delivery requires checking Sent Mail before explicit resend.

Saving marking stays private. Send the learner’s final report separately through their client Actions. This does not change the earlier final-report workflow or email signature.

## What is emailed

The recipient is fixed server-side to **Submissions@speakboldly.space**. Each email includes the student's name, level, attempt ID, start/deadline/submission times, every question and saved answer, reading passage, writing plan/response and marking context. Public requests cannot change the destination. This notification is sent by the Google account running the web app, using MailApp; it does not require a Submissions sender alias.

Repeated Submit/timeout requests do not resend a sent notification. Saved answers remain in GE exam attempts even if email is queued or uncertain. Historical Exam attempts and their original review screens are retained separately.

## Verify

1. Wrong/no exam password cannot start an exam; a Level 1 grant cannot start Level 2.
2. The timer starts at 45 minutes and keeps its deadline on refresh.
3. All source questions/passages and writing target lengths match the supplied PDFs.
4. Submit a labelled instructor test attempt; verify its email in Submissions and its dashboard record.
5. Repeating Submit does not send another email.
6. After timeout, changed answers are rejected; closing the page does not prevent scheduled expiry.
7. Levels 9–12 remain unavailable until uploaded.

The user-supplied PDFs contain the student papers only. No examiner material or answer keys are published. The public JSON templates contain questions only. Shared level passwords restrict starting the exam, not knowledge of its questions or verification of a student's legal identity.
