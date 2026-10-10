# Automatic client saving

The website connection is prepared but requires Apps Script installation. Keep the spreadsheet private. Reviews and Clients use separate tabs.

1. In the existing sheet-bound Apps Script project, add a Script file called Clients and paste Clients.gs into it.
2. In the existing review Code.gs, rename only `function doPost(event)` to `function handleReviewPost(event)`. The Clients file contains the single doPost router; it preserves review submissions and handles authenticated client writes separately. Keep doGet unchanged.
3. Save and run setupClientSync. This creates the Clients tab and CLIENT_SYNC_KEY in Script Properties. Existing rows are not erased. Authorize spreadsheet access when requested.
4. Deploy → Manage deployments → Edit → Version: New version → Deploy. Keep the same web app URL and owner/Anyone settings.
5. In Teacher Portal open Google Sheets — automatic client saving. Enter the web app URL and private CLIENT_SYNC_KEY. Never send the key in chat or publish it. The key remains in memory for the current dashboard visit and is cleared on logout/navigation.
6. Add a test client and verify a row appears. Edit that same client and verify its row updates rather than duplicating. Incorrect keys and duplicate student codes, names or emails must show errors without pretending to save.

New or edited clients sync when saved. Existing browser-only entries are not bulk-uploaded automatically; edit/save each to sync it. The Clients tab does not schedule sessions or activate email reminders. Date/time/session scheduling needs a separate Classes setup.
