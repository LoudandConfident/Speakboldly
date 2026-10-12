# One Apps Script project for Speak Boldly

Use [UnifiedCode.gs](UnifiedCode.gs) as the entire contents of Code.gs in the existing Clients Apps Script project. It combines client sync, shared calendar, 24-hour reminders, shared report fields, individual PDF emails, Google Drive Full library and viewer-link emails. Do not paste separate copies of these functions alongside it.

Keep Script Properties (CLIENT_SHEET_ID, CLIENT_SYNC_KEY, library folder IDs) and the existing reminder trigger unchanged. Save, then deploy a New version of the existing Web app; its /exec URL remains unchanged. If setupFullLibrary or setupSheetReminders has never been run, run the missing setup once and authorize Google access. Replacing the code does not erase the spreadsheet rows or Drive folders.

Confirmation emails read the client's upcoming meetings from Sessions, ordered by date, excluding cancelled and past appointments. They contain the Speak Boldly logo, program/level, session numbers, Cairo dates and times, Student portal code, Zoom link/passcode and cancellation notice. Sending is blocked if no upcoming appointment is saved in Sessions. Automatic reminders use the same branding for the individual due session.

Progress report, Final report and Registration/payment confirmation use the already-built editable PDF templates and send the completed PDF attachment to the current client email in Clients. Library material sharing emails restricted Drive viewer links. EmailLog and LibrarySendLog record individual sends. An accepted send still needs a real test inbox check. Logo display can depend on the recipient's email image settings.

This file does not yet implement timed interactive exam invitations/submissions. Exam choices are saved; the interactive runner is a separate remaining feature.

## Fix “Invalid action” when sending a confirmation

That response means the connected deployment does not recognize `sendClientEmail`. Updating the website does not update Google Apps Script.

1. Open the existing **Clients** sheet → Extensions → Apps Script. Replace the client script with `UnifiedCode.gs`. Keep a single `doPost` handler; do not leave old copies of the client functions beside it. For a combined Reviews/Clients project, keep the review code and use the updated `Clients.gs` router with `Sessions.gs`, `TeacherDocuments.gs`, `EmailActions.gs` and `LibraryActions.gs` instead.
2. Preserve the existing Script Properties and spreadsheet data.
3. Select `authorizeClientEmails`, click **Run**, and allow email permission. This permission check sends no email.
4. Choose **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** on the existing web app. Keep its `/exec` URL.
5. Return to the teacher dashboard, refresh students and the calendar, and retry **Authorize → Send e-mail confirmation** for a client with a future session saved in the shared calendar.

A calendar slot is availability; a confirmation needs a saved client appointment in `Sessions`. An email accepted by Google is recorded as `sent` in `EmailLog`.
