# Session duration and December availability update

Use the existing Clients Apps Script project and deployment.

1. Replace the combined script with this folder’s updated `UnifiedCode.gs`.
2. Keep the existing Script Properties, spreadsheet, private key, triggers and deployment URL.
3. Choose **Deploy → Manage deployments → Edit → New version → Deploy**.
4. Refresh or reopen the instructor app.

If using the older split-file setup, update `Sessions.gs`, `BookingActions.gs` and `EmailActions.gs` instead. Do not combine split scripts with `UnifiedCode.gs` in the same project.

Changes:
- The instructor menu has exactly four choices: **Session — 90 minutes**, **Session — 120 minutes**, **Trial session — 60 minutes**, and **Placement test — 30 minutes**. The selected appointment type sets the duration; there is no separate duration menu. Overlap checks, confirmations, end times and taught hours use the saved duration. Existing appointments retain their saved duration.
- December dates stay dimmed by default. The instructor can now click **Undim** on a future December date. That explicit choice persists and is used by both instructor and student calendars. Other dates remain unchanged; the student booking window still applies.
- The extra **Send session confirmation** beside each client is removed. The confirmation action inside **Actions** remains.
- The website serves updated document templates, Notes and Action plans with one logo at the top left and the shared document footer. Those document changes do not need an Apps Script redeployment.

The new website blocks custom-duration saves against an old script rather than silently saving a two-hour selection as 90 minutes.
