# Shared reviews

The public review album, immediate publication, and owner-only deletion are implemented. They are not activated on GitHub Pages until the private server is deployed and `EXAM_BACKEND_URL` in `exam-config.js` points to it. No browser-only storage is used as a substitute for shared reviews.

1. Deploy the existing private server with a persistent disk, a strong `EXAM_ADMIN_PASSWORD`, and `EXAM_ALLOWED_ORIGINS=https://loudandconfident.github.io`. See `CLASS-REMINDERS-SETUP.md` for its hosting instructions. SMTP is not required for reviews.
2. Put the server HTTPS address in `EXAM_BACKEND_URL`, then publish the website.
3. Submit a sample review from the Reviews popup. Open the website in a different browser and confirm it appears. Reviews publish immediately without approval, and no review email is sent.
4. Open the Admin portal, authenticate the private owner connection, then use **Website reviews — view and delete**. The dashboard shows the published review count. Delete the sample and confirm it disappears publicly.

Public endpoints: `GET /api/reviews` and `POST /api/reviews`. Owner-authenticated endpoints: `GET /api/admin/reviews` and `DELETE /api/admin/reviews/:id`. Names and ages are optional. The API validates programs, limits repeated submissions, and deduplicates retries. Review text is displayed as plain text, never HTML.

The automatic appearance and delete workflow has been tested locally. A live two-browser check is still required after connection. Automatic class reminder emails are separate; they require an email connection or the Google Sheets/Apps Script setup.
