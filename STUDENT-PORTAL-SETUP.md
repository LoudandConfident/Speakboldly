# Student Portal: shared files and timed interactive tests

This version uses the existing Clients Google Apps Script web app as the backend. Students enter **Name, Program and Level**, with no student code. Instructor Portal → **Student Portal access** controls shared switches for Exercises, Level files and Level 1–6 interactive tests. All tests start closed.

## Activate it in Google

1. Open your existing Clients Google Sheet → **Extensions → Apps Script**.
2. Replace the existing combined code with [UnifiedCode.gs](google-sheets/clients/UnifiedCode.gs). Use one copy of the combined script; do not add ExamActions.gs alongside UnifiedCode.gs. Keep your existing Script Properties, sheet rows and Drive folders.
3. Save. Select **setupStudentPortal → Run**, then review and allow the requested spreadsheet and email permissions. This creates **Portal access**, **Exam sessions**, **Exam attempts**, **Booking requests**, and a **Sessions** calendar tab if it is missing. It does not send an email or create a reminder trigger.
4. In **Project Settings → Script Properties**, check **SB_EXAM_NOTIFY_EMAIL**. Setup fills it with the Google account running the script. Change that value if notifications should go to a different address. Keep **CLIENT_SYNC_KEY** private.
5. Select **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**. Keep **Execute as: Me**, **Who has access: Anyone**, and the same `/exec` URL.
6. Refresh the website. Open **Portal → Instructor portal**, connect the existing Clients sheet with its private key, then open **Student Portal access → Refresh files**.
7. Press **Off · Undim** for the files and test level you want available. Press **On · Dim** to close them. The switches apply to everyone, not individual clients.
8. Test in a separate browser tab: **Portal → Student portal → Assessment**. Enter Name and Program, choose an open Level, then press **Start assessment**.

If you use a combined Reviews/Clients multi-file project, update Clients.gs and Sessions.gs, then add ExamActions.gs and BookingActions.gs instead of replacing the reviews code with UnifiedCode.gs. Keep only one doPost router.

## Tests and correction

The selected level opens its matching transcribed exam. The 20-minute deadline is stored in Sheets and is preserved across reloads. Answers save as students work; **Save answers** is also available. At expiry, saved answers become a submission. Closing a test switch prevents new starts but lets active attempts finish. If a student closes their browser, the attempt is finalized on the next student request or when you check submissions.

An email goes to **SB_EXAM_NOTIFY_EMAIL** after submission with **Name, Level and Program**. The email signature is **Speak Boldly**, with no email address. Delivery failures appear in Exam Review with **Retry notification email**; answers remain saved even if email fails. Google email quotas apply.

Open **Instructor portal → Exam Review → Check submissions → Correct assessment**. Mark sections A–E out of 20 each, add feedback, then **Save corrected score**. The score out of 100 and the answers remain in Exam attempts. All sections are marked by the instructor; no unverified automatic answer key is used.

Students can return to the same browser tab and press **Refresh result**. Their temporary access session lasts six hours. Names and programs are self-entered; this flow does not verify identity or grant access to another visitor's answers just by entering the same name. Starting in a new tab creates a separate attempt rather than retrieving someone else's results.

## File switches

Refresh files discovers existing website files and your configured Drive library folders. Exercises and Level files open in a new tab. Reports and other private documents continue to be shared by email rather than through this portal.

Dimming controls access through the portal. It does not revoke an existing Drive sharing permission or remove a public GitHub file. Drive files must already have suitable viewer access for the students who will open them.

## Shared-passcode booking calendar

The home **Book your slot** button opens **Student Portal → Calendar**. You can also share `https://loudandconfident.github.io/Speakboldly/#students-portal/calendar` after registration. Clients enter one shared booking passcode; it is checked in Google, not embedded in the website.

After setup and deployment, open **Instructor Portal → Booking and notifications**. Show or change the passcode, turn **Booking open** on or off, set your notification email, and save. Changing the passcode invalidates old booking sessions. **Check activation** verifies the deployed Google service has the required Sheets tabs and available email quota. It does not send a test email.

Clients enter their registered name and select up to 16 future slots across the current month and next two months. Booking requires their registered Clients row to have Payment status **Paid**. Completing placement and registration is checked by you before sharing the passcode.

Clients see **Available**, **Taken** or **Unavailable**, with no client names, codes, emails or session IDs. The schedule matches the instructor calendar: Tuesday–Thursday 6–7:30pm and 7:30–9pm; Saturday 10–11:30am and 11:30am–1pm, in Cairo time. Google rechecks occupied times under a shared write lock before saving the whole selection. Retry requests do not duplicate appointments. Both instructor-created and client-created sessions occupy the same calendar.

Saved bookings appear in your Sessions sheet and instructor calendar, with registered client initials and session numbers on your side. You receive a booking notification. Student confirmation emails remain manual through **Actions** and include Zoom, without a Portal link. Email actions and report editors now stay in popup cards on the dashboard; OK/Cancel confirmation uses a popup card instead of the browser's system prompt.

File and test access still uses shared Dim/Undim switches, without student passwords. Open student portals refresh file switches about every 20 seconds, and opening a file checks its current switch. Dimming stops new portal access; files already opened or downloaded and existing Drive permissions are not revoked.

## Individual document filenames

Progress reports, final reports and registration/payment confirmations are sent by email and do not appear as Student Portal documents. Their PDF filenames use **Name — Level/Program — Document type — Date.pdf**, with Cairo dates. Editable report downloads use the same format.

Exam Review includes **Download assessment PDF** for each submitted attempt. This is an instructor download of that student's questions, submitted answers, correction marks and feedback, named **Name — Level — Assessment — Date.pdf**. It does not add assessment PDFs to the student material library.
