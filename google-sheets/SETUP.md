# Connect anonymous results to your private Google Sheet

The website can score the test immediately without a backend. Central collection requires this one-time Google account setup. No name, email, or submitted answer choices are stored in the sheet.

1. Create a Google Sheet and leave sharing restricted/private.
2. In that sheet, open **Extensions → Apps Script**.
3. Replace the sample code with the complete contents of `Code.gs` in this folder. Save it.
4. Select `setupResultsSheet` from the function dropdown and click **Run**. Authorize the script to access your spreadsheet. This creates `Results` and `Analysis` tabs. Running setup again preserves existing results.
5. Choose **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**. Deploy and copy the web app URL ending in `/exec`. The deployment lets visitors submit anonymous results; it does not share the spreadsheet with them.
6. Put that public URL in `RESULTS_ENDPOINT` in `placement-config.js`, or send the URL to the website maintainer. Never send passwords, access tokens, or spreadsheet contents.
7. Publish the configuration change. Submit one sample test on the live site. Confirm it says the result was saved, and confirm a new row and updated analysis appear in your sheet. This live check is required before claiming collection works.

The Results tab stores an anonymous attempt ID, test version, UTC time, correct answers, total questions, percentage, estimated level, and answered count. The Analysis tab shows totals, average marks, average percentage, and the count and share of participants in each estimated range, with a pie chart.

The server grades the submitted choices itself; it does not trust client-supplied scores. Repeat requests for the same attempt ID reuse the original row. This is an anonymous self-assessment, not a proctored exam or identity-verified count of unique people. Browser-local attempt locking does not prevent repeat attempts on different devices or after storage is cleared.

The 60-item selection excludes source questions 9, 10, 13, 16, 18, 21, 25, 33, 43, and 54, retaining all eight advanced items. Answers are mapped directly from the uploaded Language Hub key. Bands (0–11 Below A1, 12–23 A1–A2, 24–35 A2–B1, 36–47 B1–B2, 48–60 B2–C1) are provisional Speak Boldly estimates, not publisher-validated cutoffs. Confirm through teacher assessment before assigning a course. The printable student PDF contains no answer key.

Only this script owner can view Results/Analysis unless the owner explicitly shares the sheet. The public endpoint offers no read-results or export-all-results operation. Set retention and delete rows through your private spreadsheet as appropriate.
