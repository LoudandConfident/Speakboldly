# Shared reviews through Google Sheets

The website uses the public Apps Script web app configured in `reviews-api.js`. Its Google Sheet remains private. The Reviews popup sends validated submissions as a simple text/plain JSON request; successful reviews appear immediately in the existing album without approval or review emails. Names and ages are optional. Review text is rendered as plain text.

Run setupReviews once in the sheet-bound Apps Script project. Deploy as a Web app, executing as the owner, with Anyone access. When updating server code, update the deployment version while retaining the same URL.

To delete a published review, delete its complete row from the private Reviews sheet and refresh the website. The deployed script does not support dashboard deletion; the dashboard explains the sheet workflow. Existing private-server review storage is separate and unused by this connection.

Local adapter and carousel tests pass. Direct live verification was blocked by the execution environment network proxy, so a real submission and reload in a second browser are still required. Open the web app URL: it should return JSON with ok:true and a reviews array, without asking visitors to log in. Submit a short sample review on the website, confirm it appears after reload, then remove its row from the sheet.

Automatic class reminders are separate and are not activated by this review connection.
