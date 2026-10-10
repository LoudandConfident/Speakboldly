# Review album — Google Sheets

The configured Apps Script web app in reviews-api.js stores reviews in the private workbook Reviews tab. Reviews appear automatically without approval after a successful save. No review emails are sent. Student class reminders are separate; this review deployment does not activate them.

The sheet-bound code supplied in the conversation requires setupReviews to be run once and the web app deployed executing as the owner with Anyone access. Keep the workbook private.

Visitors use Reviews → Add a review → Submit review. Names and ages are optional. The album uses left/right arrows, with the selected review in front and neighboring cards blurred. Text is rendered safely as plain text.

To delete a review, delete its complete row from the Reviews tab, then refresh the website. Dashboard deletion is not supported by the supplied Apps Script.

Local adapter and carousel tests pass. Live verification remains required: open the web app URL to check for ok:true JSON, submit a test review, reload in another browser and confirm persistence. The execution environment cannot reach script.google.com because its network proxy rejects the connection. Do not claim live delivery has been verified.
