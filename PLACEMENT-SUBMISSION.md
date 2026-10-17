# Placement submission recovery

Manual submission shows an inline confirmation with Confirm submission and Keep reviewing. It does not depend on a native browser confirmation dialog. After completion, View results remains available while Previous/Next allow reviewing the locked choices.

Unsubmitted answers, current question page and original deadline are saved in sessionStorage for the current tab and question version. Refreshing the same tab resumes that attempt without extending its deadline. An expired recovered attempt submits automatically. Completed results are not stored as a draft. Storage failures do not prevent taking the test; recovery requires session storage to be available.

Submission needs no Apps Script deployment or email service. The estimated score and result card are generated in the browser. Drafts are removed only after successful result rendering. A rendering failure leaves choices available and displays a retry message.

Verified in browser tests at 390px and 1280px: five pages, reviewing with Previous/Next, restoring all 50 choices and the original deadline after refresh, cancelling and confirming inline submission with native confirms suppressed, correct scoring, locked answers, result-image download, and timeout while the confirmation is open.
