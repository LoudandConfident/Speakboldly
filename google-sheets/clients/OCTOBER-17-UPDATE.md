# October 17 update

Website changes are published separately from the Google Apps Script deployment.

The updated UnifiedCode.gs closes December 2026 to new bookings. Existing appointments, clients, submissions and emails remain saved. Other months keep their current availability. December remains closed in this version.

1. Open UnifiedCode.gs in this folder, choose Raw, and copy the complete file on your laptop.
2. In your existing Apps Script project, replace the contents of Code.gs with that complete file. Save. Keep existing script properties.
3. Choose Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy.
4. Keep using the same existing web-app URL. Do not create a new deployment or spreadsheet. No setup function needs to be rerun for this update.
5. Refresh the website/instructor app. December 2026 should show no dates available for new bookings.

The instructor convenience password is now 16051962. Three incorrect attempts produce a 15-minute lockout, stored on that browser. This front-end gate is separate from the existing Google Sheets connection credentials and does not provide server-side authentication.
