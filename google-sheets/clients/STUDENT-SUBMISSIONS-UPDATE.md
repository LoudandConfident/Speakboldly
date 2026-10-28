# Activate Ask your coach → Submissions

1. In the existing Clients Apps Script project, replace ONLY the contents of your existing **GeneralEnglishExams.gs** file with the latest complete version. Do not add a second copy and do not replace Code.gs.
2. Keep the existing **sbGeneralEnglishExamsHandleEvent** routing block inside doPost. No additional routing block is needed. If the exam file/routing block has not yet been installed, follow GENERAL-ENGLISH-EXAMS-SETUP.md first.
3. Save → choose **setupStudentSubmissions → Run** → approve permissions. This creates a Student submissions sheet and a private attachment archive folder. No test emails are sent during setup.
4. **Deploy → Manage deployments → existing Clients web app → pencil → New version → Deploy.** Keep the same URL and Execute as Me.
5. Refresh the website → Ask your coach → choose **Submissions** → choose Assignment/Test → attach work → send.

The email subject is generated automatically, and delivery goes only to **submissions@speakboldly.space**. Keep Namecheap forwarding for this address pointing to your private Gmail. Normal questions retain **askcoach@speakboldly.space**.

Attachments: up to 10 files; up to 5 MB each; 15 MB combined. You can add files in multiple picker selections and remove individual ones. Supported: PDF, Word, PowerPoint, Excel, plain text, JPG/PNG/WebP/GIF, MP3/WAV/M4A/OGG, MP4/WebM. Name/email required; include either an attachment or written work. The success notice/return runs only after the mail service accepts the message.

Attachments are kept in **Speak Boldly — Private student submissions**, in the Google account running Apps Script, so they can be recovered if email delivery is uncertain. The folder is separate from student-visible materials and uses your existing Drive storage. File IDs and mail status are recorded in Student submissions. No client/calendar/exam history or existing signatures are replaced. If an email is uncertain, check Sent Mail and the saved row before submitting again; retries with the same request ID never send a second confirmed email.
