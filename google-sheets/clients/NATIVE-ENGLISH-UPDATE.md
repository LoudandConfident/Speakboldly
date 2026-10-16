# Edit Native English from Instructor Portal

This adds editing only for Native English. Daily Task is unchanged.

## Activate once

1. Open your existing Clients Apps Script project.
2. Replace the complete contents of Code.gs with [UnifiedCode.gs](https://raw.githubusercontent.com/LoudandConfident/Speakboldly/main/google-sheets/clients/UnifiedCode.gs). Do not add a second copy of the functions.
3. Save. Choose **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**.
4. Keep the existing deployment URL, script properties and connection key. No setup function or new service is required.
5. Reopen the website or installed instructor app. Unlock Instructor Portal and open **Edit Native English**. Connect the existing Clients sheet on that device if prompted.

## Edit a month

Choose a month and press **Load month**. Edit the source/channel, title, HTTPS website or video link, and introduction. **Preview** shows the card without saving. **Publish for this month** saves immediately to the existing Apps Script project. Students opening Native English see the version for the current Cairo calendar month. An already-open page checks for changes approximately once a minute while visible; reopening it checks immediately.

An override belongs to one specific year and month. Future months keep their original rotation unless edited separately. **Restore original** immediately returns that month to its original curated page. An edit made on another device blocks an older conflicting save: load the month again to see the latest version. A retry after a successful but unconfirmed save does not duplicate content.

Public visitors can read published page content. Only requests with the existing private Clients connection key can edit it; the public instructor convenience code alone cannot save changes. Titles and introductions render as plain text, not HTML. Use complete HTTPS links.

The shared edits are stored as small month-specific Script Properties in the existing Google Apps Script project. They are not private browser-only drafts or new Drive files. Existing sessions, materials, emails, password settings and daily tasks are not modified. Until the updated script is deployed, Native English continues showing the original monthly selection and the instructor editor explains that deployment is required.

For an intentionally separate multi-file project, update Clients.gs and add NativeEnglish.gs once; do not add NativeEnglish.gs to a project already using UnifiedCode.gs.
