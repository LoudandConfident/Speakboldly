# General English interactive exams — 45 minutes

## What is included

Eight student PDFs supplied on 28 October 2026 have been transcribed into interactive Levels 1–8. Test Yourself → General English → Levels 1–12. Levels 9–12 are now also available from the supplied papers. There is one General English exam program, no four/eight-session duplicate. All available levels require their existing, distinct monthly **exam** password, separate from the Learning Library passwords. The instructor can view/change those passwords in **General English exams · passwords and submissions**.

Levels 1–8 have five sections worth 20 marks each: vocabulary (10 word-bank selections), grammar (10 choices), reading (5 written answers), listening (5 written answers), and writing (level-specific task, target length and rubric). Listening is read live twice by the coach, as requested; no recording or examiner script is invented. The website uses the requested **45 minutes**, overriding the 75–120 minutes printed on the original PDFs. Levels 9–12 use language (30), reading (20), live listening (20) and writing (30), including commentary. Corrections are draft suggestions for the instructor; the learner sees a submission receipt only.

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
5. Refresh the website. In the Instructor Dashboard open **General English exams · passwords and submissions → Refresh exams**. Check each password before sharing it. All 12 levels use separate exam passwords.

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

## Ask your coach → Submissions update

If you already installed the exam script and its doPost routing block, replace ONLY your existing **GeneralEnglishExams.gs** file with the latest complete version. Do not create a duplicate copy, replace Code.gs or add another doPost block. Save, select **setupStudentSubmissions → Run**, approve permissions, then deploy a **New version of the same Clients web app**. Existing exam setup and its routing block stay as they are. For a new installation, follow the exam activation steps above and run setupStudentSubmissions as well.

Ask your coach keeps its existing FAQ/question topics and askcoach@speakboldly.space destination. The new Submissions topic offers Assignment/Test, a read-only automatic subject, and up to 10 attachments (5 MB each; 15 MB combined). Files can be added in multiple picker selections and removed individually. Student name and email are required; a message or at least one file is required.

Manual submissions go only to submissions@speakboldly.space, with the student's email as Reply-To. Namecheap forwarding for that alias should point to your private inbox. Gmail Send mail as is not needed to receive them. The public request cannot override the recipient or subject.

setupStudentSubmissions creates only a **Student submissions** sheet and a separate **Speak Boldly — Private student submissions** Drive folder under the account running Apps Script. Attachments are archived privately there so the coach can recover them if email delivery is uncertain; they are never put in the student-visible Library/Practice Zone folders. These copies use your existing Google Drive storage. The sheet records private file IDs and delivery status.

Retries with the same request ID never send a second confirmed email. If delivery is uncertain, check Sent Mail and the Student submissions sheet before trying to send the work again. The success notice/return to the previous portal section runs only on confirmed send. Daily limits are 3 submissions per email / 50 overall, within Apps Script mail and storage quotas. No real emails are sent by setup. No client/calendar/old-exam rows or existing email signatures are changed.


## Levels 9–12 and Word review drafts

The new candidate papers use four sections (30/20/20/30) and separate writing commentary. All 12 levels still use a 45-minute limit and live listening; speaking is separate. Use the supplied private GeneralEnglishExams.gs download, run setupGeneralEnglishExams9To12, and deploy a New version of the existing web app. Keep Code.gs and the existing router. The private download includes suggested answer guides; those guides are intentionally excluded from this public repository. Students receive only a submission receipt. Word corrections go only to the fixed instructor submission mailbox and are downloadable from the authenticated instructor dashboard. Writing suggestions are rule-based flags for coach review, not full AI proofreading or final marks. Listening answers require the coach’s live passage key. Saving instructor corrections updates the Word export without automatically emailing the learner.


## Current private installer update

The owner-supplied private GeneralEnglishExams.gs contains the review guides and all 12 private speaking packs. Replace only that existing Apps Script file, run **setupSpeakBoldlyUpdates**, then deploy a **New version** of the same web app. Keep Code.gs and its existing exam routing hook. The public source here intentionally excludes private answers and speaking passages. Do not replace the private installer with this public source if you need the suggested corrections and speaking packs.

The instructor's speaking card provides four guided 25-mark steps, saved notes and marks across devices, a clean learner window, a two-minute speaking timer and editable Word reports. Speaking is separate from the timed written exam. No speaking score or report is automatically sent to the learner.
