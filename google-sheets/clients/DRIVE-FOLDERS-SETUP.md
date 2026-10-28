# Private Drive folders → Practice Zone and Learning Library

The website code is ready for these two private folders:

- Practice Zone: https://drive.google.com/drive/folders/14sQwnxHRaZ9Lw0bAaJttvyHIKrse0c9L
- Learning Library: https://drive.google.com/drive/folders/1PDDCug1wmNKH-TpsJQeLdb7VlpdS_d_Y

This uses the existing Clients Apps Script web app, running as its owner. No Cloud Run deployment, billing account, service-account JSON key or student Google login is required. The previously created service account is not needed for this method. Keep both folders Restricted. The Google account that executes your existing Clients web app must have read access to BOTH folders; ChatGPT’s Drive connection does not grant access to Apps Script.

## Activate once

1. Open your existing Clients Google Sheet → Extensions → Apps Script. Keep your original Code.gs, CalendarEditing.gs, Rewards.gs and email signatures.
2. Click **+ next to Files → Script**. Name the NEW file **DriveFolders**. Paste the entire contents of DriveFolders.gs into it. Do not paste it over Code.gs, and do not add a second doPost function.
3. In your existing Code.gs, find `function doPost(event) {` (your event parameter might have another name). Add this small block immediately INSIDE that function, before its existing code or other routing blocks:

```javascript
  if (typeof sbDriveFoldersHandleEvent === 'function') {
    const driveResponse = sbDriveFoldersHandleEvent(arguments[0]);
    if (driveResponse !== null) return driveResponse;
  }
```

The handler intercepts only the file catalogue, the new private folder reader, authenticated folder settings and folder-backed Library Dim/Undim actions. All other calendar, client, booking, email and rewards actions return to your original router. It does not modify client/session/Portal access rows or replace existing signatures.

4. In Apps Script click **+ next to Services → Drive API → Add** (v3). This enables the Drive API for the script’s default Cloud project. If you selected a separate standard Cloud project for this Apps Script project, also enable Google Drive API in THAT project's Cloud Console. You do not need to change the Apps Script project's Cloud project or enable billing.
5. Save. In the function dropdown choose **setupDriveFolders → Run**, then authorise the required Drive access. Run ONLY that setup function. Do not run doPost or rerun client/calendar setup functions. If it says it cannot access a folder, share the folder as Viewer with the account executing this web app.
6. **Deploy → Manage deployments → your EXISTING Clients web app → pencil → New version → Deploy.** Keep its existing deployment URL, Execute as Me and existing access settings. Do not create a replacement endpoint.
7. Refresh your website. Enter the current Practice Zone password. The uploaded worksheets should appear. Instructor Portal → uploaded resources → Refresh files should report “Drive syncing is active”.

There is no Google Cloud billing step. Apps Script and Drive quotas still apply, and Google Drive storage is your existing account allowance.

## Upload workflow

Upload PDFs, JPG/PNG/WebP/GIF images, audio or MP4/WebM videos directly into the two Drive folders. Files appear on the website’s next folder open or Refresh files; no second registration/upload is required. Removed files disappear on refresh, and the reader rejects removed/moved/trashed files immediately. This is refresh-based discovery, not a live push notification. Hidden unsupported formats, Google-native Docs/Slides and shortcuts do not show as inline materials; export those as PDF first.

### Practice Zone

Upload into the Practice Zone folder or subfolders. All files use the existing **exercises:1 monthly password** and remain level-less to learners. No per-file dim toggle is added to Practice Zone.

### Learning Library

To preserve the website’s existing level access rules, general materials MUST have a **Level 1 … Level 12** folder or filename. Example:

```
Learning Library/
  General English/
    Level 1/
      Main Book/book.pdf
      Activities/worksheet.pdf
      Audio/listening.mp3
    Level 2/...
  Pronunciation workshop/
    worksheet.pdf
  E-mail and business writing workshop/
    worksheet.pdf
```

Recognised learner program-folder names: English Momentum, Interview preparation workshop, IELTS preparation, E-mail and business writing workshop, Let the kids speak!, Pronunciation & intonation workshop, Meetings, presentation and public speaking workshop, Write Boldly!, Reclaim your focus workshop. Instructor-training folders are excluded. General English is one folder with Level 1 through Level 12 inside; four/eight-session plans do not have separate folders. They map to the existing website program folders and their current shared material:1 access rule. General files without a level are omitted rather than assigned to the wrong students. Program-folder files use level 1 internally, preserving the portal’s existing program-folder convention.

Direct folder additions inherit their corresponding section/level access setting. They are visible immediately when that level is enabled and password-authorised. For individual files that already have an explicit Portal access dim setting, that setting is respected. Library files retain Dim/Undim controls in the instructor dashboard. Practice Zone has no individual dim controls. You can also manage availability through level access controls or move files outside the connected root. Existing file uploads and registered materials remain in place.

## Honest limits

- Private previews stay inside Speak Boldly. No public Drive links or Drive iframe redirects are sent for the connected-folder files.
- The server rechecks the current password grant, file location, level, explicit registered dim state and file revision on EVERY chunk. Tokens/credentials never appear in public code.
- Supported files can be up to **100 MB each**; they load in 2 MB chunks with a progress message. Large audio/video must FINISH loading before playback. This is not streaming. Large files are slower and consume Apps Script requests/quotas and phone memory; split/compress long videos.
- Maximum 1,000 scanned files and six nested subfolders per root. Quota failures show a retryable error; they do not enable public sharing or incur Cloud Run charges.
- Once an authorised student has received file bytes, a website cannot prevent saving or redistributing them.
- Existing website-hosted files remain available under their existing behaviour; this module does not make their historic public URLs private. Remove/replace historic copies only as a separate deliberate migration after testing.

## Pause or rollback

Set the script property `SB_DRIVE_FOLDERS_ENABLED` to `false` and deploy a New version, or remove the small routing block and redeploy. The original catalog/reader continue. No data or files are deleted. Folder files are stored in your Drive, not copied to the spreadsheet.

## Verify before relying on it

1. New PDF upload appears on refresh without registering it.
2. Correct monthly password opens it inside the site; wrong/no password rejects reading.
3. A Level 2 library file cannot be read using only a Level 1 password grant.
4. A file outside the two roots cannot be fetched by guessing its ID.
5. A PDF larger than 7 MB finishes loading and displays; a changed file fails safely mid-download.
6. Move a file out: its next read fails and it disappears on refresh.
7. Existing bookings, calendar, client sync and email workflows still work.

## Program-card update (28 October 2026)

If you already installed DriveFolders.gs, replace ONLY that file with the updated version and deploy a New version of the same Clients web app. Keep the existing doPost routing block and Code.gs. No need to run setupDriveFolders again. This adds recognition for the new learner-program folders; General English level-password rules are unchanged. The program cards are updated automatically by the website deployment.
