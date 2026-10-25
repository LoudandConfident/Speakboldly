# Restored document footer and coach requests

Website pages, generated PDF/Word documents, supplied report templates, and both Speak Boldly brochures use the original three-line footer:

English Language Coaching  
Founded by Mira Nasser Louis  
© 2026 Mira Nasser Louis. All rights reserved.

The logo remains at the top left. Editable report field names and coordinates are unchanged.

The website's two assessment results now link directly to Calendar with Placement test selected. The booking notice removes the old instruction to complete both online assessments, explains payment screenshot delivery to billing@speakboldly.space, instructor acceptance/decline, and confirmation within 24 hours. Program and workshop bookings also explain that the SB placement test is required before enrollment.

Ask your coach sends public contact requests to askcoach@speakboldly.space, with the visitor's address as Reply-To. Requests cannot override the recipient, and retries do not duplicate a delivered request.

## Apps Script deployment

The website and document downloads deploy automatically through GitHub Pages. To use the restored footer inside emails sent by Apps Script, replace the deployed code with the current `UnifiedCode.gs`, then choose **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the existing web app URL, connection key and Script Properties.

For a split-file setup, update `EmailActions.gs`, `StudentContact.gs`, `EmailRouting.gs` and `LibraryActions.gs` instead of also adding UnifiedCode. Do not install both combined and split copies.

The website update does not create or change mailboxes or SMTP credentials. No live emails were sent during validation.
