# One Apps Script project for Speak Boldly

Use [UnifiedCode.gs](UnifiedCode.gs) as the entire contents of Code.gs in the existing Clients Apps Script project. It combines client sync, shared calendar, manually authorized class confirmations, shared report fields, individual PDF emails, Google Drive Full library and viewer-link emails, shared Student Portal switches, timed interactive tests, saved answers, instructor correction and shared-passcode calendar bookings. Do not paste separate copies of these functions alongside it.

Keep Script Properties (CLIENT_SHEET_ID, CLIENT_SYNC_KEY, library folder IDs) unchanged. Save, then deploy a New version of the existing Web app; its /exec URL remains unchanged. If setupFullLibrary or setupSheetReminders has never been run, run the missing setup once and authorize Google access. Replacing the code does not erase the spreadsheet rows or Drive folders. Run disableAutomaticReminders to remove the old automatic-email trigger.

Confirmation emails read the client's upcoming meetings from Sessions, ordered by date, excluding cancelled and past appointments. They contain the Speak Boldly logo, program/level, session numbers, Cairo dates and times, Zoom link/passcode and cancellation notice. Sending is blocked if no upcoming appointment is saved in Sessions. Class confirmations are sent only when the teacher authorizes sending.

Progress report, Final report and Registration/payment confirmation use the already-built editable PDF templates and send the completed PDF attachment to the current client email in Clients. Library material sharing emails restricted Drive viewer links. EmailLog and LibrarySendLog record individual sends. An accepted send still needs a real test inbox check. Logo display can depend on the recipient's email image settings.

For shared portal switches and 20-minute interactive tests, follow [STUDENT-PORTAL-SETUP.md](../../STUDENT-PORTAL-SETUP.md). Run setupStudentPortal once, review spreadsheet/email permissions, check SB_EXAM_NOTIFY_EMAIL, then deploy a New version. This adds no automatic class reminders.

## Fix “Invalid action” when sending a confirmation

That response means the connected deployment does not recognize `sendClientEmail`. Updating the website does not update Google Apps Script.

1. Open the existing **Clients** sheet → Extensions → Apps Script. Replace the client script with `UnifiedCode.gs`. Keep a single `doPost` handler; do not leave old copies of the client functions beside it. For a combined Reviews/Clients project, keep the review code and use the updated `Clients.gs` router with `Sessions.gs`, `TeacherDocuments.gs`, `EmailActions.gs` and `LibraryActions.gs` instead.
2. Preserve the existing Script Properties and spreadsheet data.
3. Select `authorizeClientEmails`, click **Run**, and allow email permission. This permission check sends no email.
4. Choose **Deploy → Manage deployments → Edit (pencil) → New version → Deploy** on the existing web app. Keep its `/exec` URL.
5. Return to the teacher dashboard, refresh students and the calendar, and retry **Actions → Send e-mail confirmation** for a client with a future session saved in the shared calendar.

A calendar slot is availability; a confirmation needs a saved client appointment in `Sessions`. An email accepted by Google is recorded as `sent` in `EmailLog`.

## Retry missing spreadsheet permissions

After replacing the code in the existing Clients Apps Script project, save and run `resetPermissions` once. Then select `retryPermissions` and run it; complete Review permissions and allow spreadsheet and email access. The check reads the spreadsheet name and email quota only. It sends no messages and changes no sheet data.

After the access check succeeds, deploy a New version of the existing web app with Execute as: Me, preserving the same URL. Retry the client confirmation from Actions. If spreadsheet access is still denied, check for an explicit `oauthScopes` list in appsscript.json and add `https://www.googleapis.com/auth/spreadsheets` without removing the other scopes. Remove any `@OnlyCurrentDoc` annotation because this project accesses the sheet by ID.

## Manual-only class emails

Automatic 24-hour emails are disabled in this version. After updating the script, run `disableAutomaticReminders` once to remove existing `sendDueSheetReminders` triggers, then deploy a New version. Existing calendar rows remain unchanged. Send a class confirmation from the client’s Actions button.
