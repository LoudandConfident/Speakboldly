# Connect student codes across devices

The Node backend is prepared; it is not hosted or connected to the public site yet. Start with student login and assigned materials, then activate exam submissions after the private exam content is installed. Existing Google Apps Script email sending can remain in use.

## 1. Update Apps Script for manual-only emails

Open your existing Clients Google Sheet → Extensions → Apps Script. Replace the existing client script with the latest `google-sheets/clients/UnifiedCode.gs` from this repository, preserving Script Properties and sheet data. Save, run `disableAutomaticReminders`, and deploy **Manage deployments → Edit → New version** with **Execute as: Me**. Keep the same `/exec` URL. If the automatic trigger was already deleted, the helper simply ensures none remains. Do not install a second copy of the client functions.

## 2. Create the hosted service

Open https://render.com/deploy?repo=https://github.com/LoudandConfident/Speakboldly and connect your GitHub account. The blueprint chooses a paid Starter Node web service and a 1 GB persistent disk; review Render’s displayed price before deploying. The persistent disk holds student records, uploaded private materials, and exam answers.

The blueprint already sets Node 24, `EXAM_DATA_DIR=/var/data`, and `EXAM_ALLOWED_ORIGINS=https://loudandconfident.github.io`. It generates the private owner password. No SMTP password is required for this initial setup.

Enter these two values in Render’s environment settings:

- `EXAM_CLIENT_SHEET_URL`: the existing Clients Apps Script `/exec` URL used on your teacher dashboard.
- `EXAM_CLIENT_SHEET_KEY`: the existing `CLIENT_SYNC_KEY` from Apps Script Project Settings → Script Properties.

Enter the key only in Render’s private settings, never in public code or chat.

## 3. Check the service

Wait for deployment to complete. Open the service’s HTTPS URL followed by `/api/status`. `studentLoginReady: true` means the student login service is configured. `examsReady: false` is expected until the private exam data is installed. The HTTP health check can pass before exam content is present; it does not prove sheet access or email delivery.

Copy the service’s HTTPS base URL, for example `https://your-service.onrender.com`. Send that URL to your website maintainer so it can be placed in `EXAM_BACKEND_URL` in `exam-config.js` and the website published. The URL is not a password. Do not use a guessed service name.

## 4. Test student authorization

In the teacher dashboard, use the private owner password generated in Render to connect the private storage section. Use a test client and grant both the relevant folder and the exact file. Save the client to your connected sheet.

Open the public website in a separate browser or on another device, enter the test student’s individual code, and confirm the assigned file opens while an unassigned file is denied. The backend reads codes and permissions privately from your Clients sheet. Do not use 1962 for this test; it is the teacher preview code.

The existing portal still shows unassigned items as locked. A view containing only authorized items is a separate interface change. Existing public GitHub files remain public even if hidden or locked in the portal.

For confidential materials, upload through private backend storage and assign the individual file. Google Drive viewer-link emails remain a separate access route and require the recipient’s registered Google account.

## 5. Activate exam submissions

Private exam content must include the question data and verified teacher answer keys. The public transcribed questions do not contain these keys. Provide the six original Word exams or the verified answer keys privately so the backend exam data can be prepared.

For the original Word files, run `python3 scripts/prepare-exams.py /path/to/source-documents --out /path/to/private-data/exams.json`, upload that output to `/var/data/exams.json` on the hosted service, and restart it. This file contains private answers and listening scripts; keep it off GitHub Pages and out of the public repository. After restart, `/api/status` should report `examsReady: true`.

Authorize a test exam, submit answers from the separate student browser, and check that the teacher can review them and release the final result. Listening still needs the teacher’s instructions or a recording.

## 6. Optional result emails

SMTP can be added later if you want the private backend to email reviewed exam results. It is not required for student login, materials, or exam submissions, and is separate from Apps Script confirmations. Class emails remain manual-only: saving a class does not trigger a 24-hour reminder.
