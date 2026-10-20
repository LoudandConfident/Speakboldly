# Ready combined Apps Script — 20 October 2026

Use `UnifiedCode.gs` in this folder. It includes existing booking, calendar, exam grading/notification, reports, Notes, Native English, daily-motivation emails, and the new shared freeze settings. Do not paste it underneath old code or create duplicate Code.gs files.

## Activate once from a laptop

1. Open the raw `UnifiedCode.gs` file. Select all and copy the complete file.
2. Open your existing Apps Script project → Code.gs. Replace its entire contents, then Save.
3. Deploy → Manage deployments → pencil → Version: New version → Deploy. Keep the existing deployment URL, execute-as setting and access settings. Your existing Script Properties stay in place; no new property or trigger is required.
4. Refresh the website or close and reopen the installed instructor app.
5. Instructor Portal → Daily Motivation. Choose Freeze this week, Freeze until I resume, or Resume daily changes.
6. Clients → Actions → Send daily motivation. Confirm the recipient and quote; OK sends the email.

This week's default motivation is held through Sunday 25 October, Cairo time. Freeze this week resumes automatically on Monday. Freeze until I resume stays held until you change it. The shared setting is read across devices, normally within one minute or on reopening. Motivation emails use the same selection.

## Verify with your own test client

- Send one motivation email to yourself and check its picture and text.
- Request a future calendar slot; accept or decline from your email/instructor controls. Accepting should create one session and mark the student slot Taken without exposing names.
- Submit an exam. Check the instructor email contains corrected objective scores and the writing response awaiting your manual mark. Students should not receive your private scoring/feedback. Prepare and send the final report manually.

Automated tests used mocked Sheets and MailApp, not real client messages. Live delivery, Google permissions/quotas and your deployed project require the checks above.

## Security boundaries

Private server actions require CLIENT_SYNC_KEY, independently of the instructor page's convenience code. Saved client email addresses determine recipients; the browser cannot redirect email to a different recipient. Freeze writes are owner-only and revision checked. Booking/exam public responses omit client names and private scores.

The fixed instructor code and browser attempt counter can be inspected or bypassed in a static website. Shared student passwords are not individual accounts, and public repository/static PDF links cannot be made confidential by dimming a card. Client data and the connection key are stored in the instructor browser, so use a trusted device. Do not put confidential student reports in the public repository or shared material folders. A full security assessment and server-verified instructor login remain future work.
