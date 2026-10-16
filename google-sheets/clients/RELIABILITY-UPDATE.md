# Booking, books, exams and backups

Use the complete [UnifiedCode.gs](https://raw.githubusercontent.com/LoudandConfident/Speakboldly/main/google-sheets/clients/UnifiedCode.gs). Replace all existing Code.gs, save, then **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the same deployment URL and Script Properties. Do not add the separate .gs modules alongside UnifiedCode.gs.

## What changed

- Books hosted on the website open in a page-by-page reader inside Learning Hub. Uploaded Google Drive files use an embedded preview, without sending students to a separate Drive page. Drive files must allow the intended students to view them; embedding cannot override Drive sharing permissions.
- Eight interactive examinations save answers and submit to the existing sheet. Only the instructor receives automatic section scores, question-by-question corrections and writing. Writing is unmarked. Alternative written objective answers may be flagged for the instructor to check. Student receipts contain no scores, correction keys or feedback.
- Exam emails point to client Actions for manually preparing a final report or Notes. Final reports are never sent automatically.
- Dashboard shows today, the next seven days, requests awaiting acceptance and submitted exams awaiting writing marks/final reports. Times use AM/PM.
- Calendar avoids uploading appointments already in the shared sheet. Background client refreshes coalesce phone resume events; reviews fetch when their page opens and reuse the existing cache.
- Placement and trial requests from the public form can be accepted without a registered course. Previously their default appointment labels could be rejected as invalid course names.
- Instructor Portal → Backups offers a private Drive snapshot and a downloadable JSON backup of records, answers, reports and material links. Connection keys, portal passwords and exam login tokens are excluded. The backup contains private client information; keep it private.

## Enable regular backups once

In the Apps Script editor choose **setupDailyBackups**, then **Run** and approve Google permissions if asked. It saves an immediate backup and creates one daily backup trigger at approximately 4 am Cairo time. Re-running setup does not duplicate the trigger. It never sends emails. Backups are in a private folder named **Speak Boldly — private backups**. Repeated backups on the same Cairo date update that day's JSON file; previous days stay intact. Original material files are not duplicated or deleted. No automatic restore or deletion is performed.

## One live check after deployment

1. Use your own test name/email to request a future slot; accept it from the instructor dashboard. Check that it becomes Taken for students without exposing names. Decline a second request and check it does not reserve a slot.
2. Open Material, enter a level password, and open that level's book. Check Next page and Previous page on phone and laptop.
3. Submit a test examination. Check the Exam attempts sheet and your notification inbox. If missing, check spam and SB_EXAM_NOTIFY_EMAIL. The sheet records notification status; uncertain delivery is not blindly retried.
4. From the client Actions open Final Report or Notes, enter your writing marks/comments, preview, and send only when ready.
5. Open Backups and download a copy or save a private Drive backup.

Automated verification uses simulated Google Sheets and email delivery. It cannot confirm delivery to a real inbox or deploy your Google Apps Script project; those need the deployment and live check above.
