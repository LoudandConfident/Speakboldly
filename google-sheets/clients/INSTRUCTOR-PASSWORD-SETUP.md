ONE GOOGLE UPDATE — instructor login + public blog comments + glossary tools + Culture Corner film editor

Keep Code.gs, GeneralEnglishExams.gs and your other existing files. No Sheet passwords or protections are added.

1. Add a new Apps Script file called SpeakBoldlyPortalUpdate. Paste everything from Speak-Boldly-Portal-Update.txt.
2. Run setupInstructorPasswordOnly once. The agreed password is already filled in. This saves a private hash, not a spreadsheet cell. No emails are sent.
3. In Code.gs, find your existing function doPost(event) {. Add these lines FIRST INSIDE its opening brace:

  if (typeof sbSpeakBoldlyPortalEvent === 'function') {
    const portalResponse = sbSpeakBoldlyPortalEvent(arguments[0]);
    if (portalResponse !== null) return portalResponse;
  }

Keep the rest of doPost unchanged. Do not add a second doPost or paste the block outside it.
4. Deploy → Manage deployments → pencil → Version: New version → Deploy. Keep the same deployment URL.
5. Reload the website and use the agreed password. No connection key button is needed.

Culture Corner: Instructor portal → Edit Culture Corner → Film recommendations → Reload films. Automatic changes affect only the two film recommendations, every two weeks. You can publish your own choices instead.

Your existing clients, sessions, Google Calendar and sheet cells are not changed by this update.

This version also enables public anonymous comments and saves article-specific glossary tools. Comments stay in the private Blog comments sheet and are displayed publicly beneath their own post. They are never emailed or sent to WhatsApp. It creates no password cells or sheet protection.

If you already pasted an earlier version of this same update file, replace that file’s contents with this latest version. Do not add another copy. If your instructor password setup already succeeded, you can run setupPortalBlogComments once instead of resetting the password again, then deploy a New version.
