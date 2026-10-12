# One Apps Script project for Speak Boldly

Use Final-Code.gs as the entire contents of Code.gs in the existing Clients Apps Script project. It combines client sync, shared calendar, 24-hour reminders, shared report fields, individual PDF emails, Google Drive Full library and viewer-link emails. Do not paste separate copies of these functions alongside it.

Keep Script Properties (CLIENT_SHEET_ID, CLIENT_SYNC_KEY, library folder IDs) and the existing reminder trigger unchanged. Save, then deploy a New version of the existing Web app; its /exec URL remains unchanged. If setupFullLibrary or setupSheetReminders has never been run, run the missing setup once and authorize Google access. Replacing the code does not erase the spreadsheet rows or Drive folders.

Confirmation emails read the client's upcoming meetings from Sessions, ordered by date, excluding cancelled and past appointments. They contain the Speak Boldly logo, program/level, session numbers, Cairo dates and times, Student portal code, Zoom link/passcode and cancellation notice. Sending is blocked if no upcoming appointment is saved in Sessions. Automatic reminders use the same branding for the individual due session.

Progress report, Final report and Registration/payment confirmation use the already-built editable PDF templates and send the completed PDF attachment to the current client email in Clients. Library material sharing emails restricted Drive viewer links. EmailLog and LibrarySendLog record individual sends. An accepted send still needs a real test inbox check. Logo display can depend on the recipient's email image settings.

This file does not yet implement timed interactive exam invitations/submissions. Exam choices are saved; the interactive runner is a separate remaining feature.
