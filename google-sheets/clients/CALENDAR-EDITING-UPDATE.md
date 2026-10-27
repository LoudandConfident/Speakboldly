# Enable Edit beside calendar sessions

The website update is ready. Your existing Clients Apps Script deployment needs this small routing update to save edits. Your **Reviews** Apps Script is separate; leave it as it is.

## Existing combined `UnifiedCode.gs` project

1. Add a new script file named **CalendarEditing** and paste the contents of [CalendarEditing.gs](CalendarEditing.gs) into it.
2. In your existing code, find the session-action list:

```javascript
['listSessions', 'saveSession', 'saveSessionSeries', 'cancelSession']
```

Replace it with:

```javascript
['listSessions', 'saveSession', 'saveSessionSeries', 'cancelSession', 'editSession']
```

3. In `handleSheetSessionAction(p)`, immediately after `try{`, add:

```javascript
if (p.action === 'editSession') sbEditSheetSession(p);
```

4. In that same function's final response, immediately after `sessionDurationReady:true,`, add:

```javascript
sessionEditingReady: typeof sbEditSheetSession === 'function',
```

5. Save. Select **Deploy → Manage deployments → pencil → New version → Deploy** on the existing **Clients** web app. Keep its URL, execution account, access settings, private keys and email signatures unchanged.
6. Refresh the website or instructor app and refresh the calendar. Open a day → **Edit** beside a session → change its number, date, time, level, program or duration → **Save session changes**.

These edits preserve the appointment ID, do not send emails, and recalculate completed-session hours. Future appointments count only after they finish. Existing manual adjustments and previous-level hours remain in place. Send a fresh session confirmation through Actions if you change the meeting details.

## If your Clients project uses separate files

Use the updated `Clients.gs` and `Sessions.gs` routing changes from this repository and add `CalendarEditing.gs`. Add `editSession` to both action lists in `Clients.gs`. Then update the existing Clients deployment as above.

## If replacing with the repository's updated full UnifiedCode.gs

The updated full file already includes the editing function and router changes. Do not add a second copy of `CalendarEditing.gs`. Preserve any live custom email signatures or other custom settings before replacing full source; the small update above avoids replacing those customizations.

Notes task attachments and the clearer Actions menu do **not** require an Apps Script update. Tasks are included in the single Notes PDF accepted by the current email service.
