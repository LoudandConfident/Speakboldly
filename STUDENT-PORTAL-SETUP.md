# Student Portal: shared files and timed interactive tests

This version uses the existing Clients Google Apps Script web app as the backend. Students enter **Name, Program and Level**, with no student code. Instructor Portal → **Student Portal access** controls shared switches for Exercises, Level files and Level 1–6 interactive tests. All tests start closed.

## Activate it in Google

1. Open your existing Clients Google Sheet → **Extensions → Apps Script**.
2. Replace the existing combined code with [UnifiedCode.gs](google-sheets/clients/UnifiedCode.gs). Use one copy of the combined script; do not add ExamActions.gs alongside UnifiedCode.gs. Keep your existing Script Properties, sheet rows and Drive folders.
3. Save. Select **setupStudentExams → Run**, then review and allow the requested spreadsheet and email permissions. This creates **Portal access**, **Exam sessions** and **Exam attempts** tabs. It does not send an email or create a reminder trigger.
4. In **Project Settings → Script Properties**, check **SB_EXAM_NOTIFY_EMAIL**. Setup fills it with the Google account running the script. Change that value if notifications should go to a different address. Keep **CLIENT_SYNC_KEY** private.
5. Select **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**. Keep **Execute as: Me**, **Who has access: Anyone**, and the same `/exec` URL.
6. Refresh the website. Open **Portal → Instructor portal**, connect the existing Clients sheet with its private key, then open **Student Portal access → Refresh files**.
7. Press **Off · Undim** for the files and test level you want available. Press **On · Dim** to close them. The switches apply to everyone, not individual clients.
8. Test in a separate browser tab: **Portal → Student portal → Assessment**. Enter Name and Program, choose an open Level, then press **Start assessment**.

If you use a combined Reviews/Clients multi-file project, update Clients.gs and add ExamActions.gs instead of replacing the reviews code with UnifiedCode.gs. Keep only one doPost router.

## Tests and correction

The selected level opens its matching transcribed exam. The 20-minute deadline is stored in Sheets and is preserved across reloads. Answers save as students work; **Save answers** is also available. At expiry, saved answers become a submission. Closing a test switch prevents new starts but lets active attempts finish. If a student closes their browser, the attempt is finalized on the next student request or when you check submissions.

An email goes to **SB_EXAM_NOTIFY_EMAIL** after submission with **Name, Level and Program**. The email signature is **Speak Boldly**, with no email address. Delivery failures appear in Exam Review with **Retry notification email**; answers remain saved even if email fails. Google email quotas apply.

Open **Instructor portal → Exam Review → Check submissions → Correct assessment**. Mark sections A–E out of 20 each, add feedback, then **Save corrected score**. The score out of 100 and the answers remain in Exam attempts. All sections are marked by the instructor; no unverified automatic answer key is used.

Students can return to the same browser tab and press **Refresh result**. Their temporary access session lasts six hours. Names and programs are self-entered; this flow does not verify identity or grant access to another visitor's answers just by entering the same name. Starting in a new tab creates a separate attempt rather than retrieving someone else's results.

## File switches

Refresh files discovers existing website files and your configured Drive library folders. Exercises and Level files open in a new tab. Reports and other private documents continue to be shared by email rather than through this portal.

Dimming controls access through the portal. It does not revoke an existing Drive sharing permission or remove a public GitHub file. Drive files must already have suitable viewer access for the students who will open them.
