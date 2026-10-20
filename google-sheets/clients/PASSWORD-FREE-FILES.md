# Password-free folders, dimmed files

All Student Portal folder password prompts are removed. Students can choose a level and see the file cards. All existing files and all eight exams start dimmed. Only instructor Dim/Undim controls open individual files. The instructor login and private connection key are unchanged.

## Activate

1. Copy the complete updated `UnifiedCode.gs` from this folder.
2. Replace all contents of your existing Apps Script `Code.gs`, then Save.
3. Deploy → Manage deployments → pencil → New version → Deploy. Keep the existing URL and settings.
4. Reopen the website/app. The first portal request dims every existing Portal access row once. Future refreshes preserve your choices.
5. Instructor Portal → Dim / Undim → Refresh → open a category → Undim the files you want available. Examinations has eight separate level switches.

Until the updated script is deployed, the new website keeps files dimmed rather than trusting older access settings. Books and worksheets bundled with the website also default to dimmed. Files are not deleted or moved.

A closed exam rejects new starts and reopening. An exam already in progress can still save/submit, so dimming does not throw away a student's work. Feedback and objective scores remain private to the instructor.

Dim/Undim controls portal access; it does not make a publicly shared Drive URL or public repository PDF confidential.
