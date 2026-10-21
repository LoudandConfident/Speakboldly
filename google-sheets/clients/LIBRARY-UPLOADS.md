# Library and Practice uploads

Update the existing Apps Script deployment once to activate private uploaded-file reading:

1. Replace the contents of your existing `UnifiedCode.gs` with the complete version in this folder. Do not add a second copy.
2. Save, then open **Deploy → Manage deployments → Edit → New version → Deploy**. Keep the same web-app URL and existing settings.
3. Open the instructor dashboard → **Library & Practice uploads**.

Choose Learning Library or Practice Zone, select Level 1–12, and choose Main book, Activities or Audio for the Library. Select files and press Upload files. Uploads start dimmed. Use Undim after opening the relevant level in Student Hub access & passwords.

Files remain private in the existing Google Drive library. Authorized learners read PDFs, images, audio and video inside the portal using their current level password. The website never exposes the instructor connection key to students. Student upload controls are removed, including when the instructor is signed in on that device.

The existing upload endpoint accepts files up to 5 MB each. Split or compress larger files. Missing Drive library folders are created automatically on the first owner upload. If uploading succeeds but saving the portal listing fails, press Upload files again to finish registering the saved file without uploading it twice.

Previously added external Drive links retain their existing embedded-preview behavior.
