# Culture Corner film editor

Keep your existing Code.gs and all existing script files. No passwords, sheets or calendar settings need changing.

1. Add a new script file called **CultureCorner** and paste the contents of CultureCorner.gs.
2. Find your existing `function doPost(event) {` in Code.gs. Immediately after its opening brace, before connection-key checks, add:

```javascript
  if (typeof sbCultureCornerHandleEvent === 'function') {
    const cultureResponse = sbCultureCornerHandleEvent(event);
    if (cultureResponse !== null) return cultureResponse;
  }
```

Keep the rest of doPost as it is. Do not create a second doPost and do not paste this block outside the function.

3. Save. Open **Deploy → Manage deployments → pencil → Version: New version → Deploy** for the existing website web app. Keep its URL and access settings.
4. In your instructor portal, open **Edit Culture Corner → Film recommendations** and click **Reload films**. You can leave the automatic two-week recommendations on, or publish your own two films. Monthly video and novel selections are edited separately, as before.

There is no setup function to run, no email sending and no new spreadsheet. Film settings are private Script Properties. The public route returns only published film descriptions; changing them requires the existing instructor authentication. Concurrent edits use a revision check.
