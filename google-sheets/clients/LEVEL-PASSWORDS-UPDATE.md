# Combined Student Hub update — 20 October 2026

Use the complete `UnifiedCode.gs` in this folder. It includes earlier calendar, booking, email, reports, exam marking, Notes, Native English and Daily Motivation features, plus the new level access/password controls. Existing Script Properties and saved Sheet data stay in place.

## One-time activation from a laptop

1. Open the raw `UnifiedCode.gs` file and copy all its contents.
2. Open your existing Apps Script project. Replace all of `Code.gs`, then Save. Do not paste beneath old code or add duplicate function files.
3. Deploy → Manage deployments → pencil → New version → Deploy. Keep the existing deployment URL and existing access/execute-as settings.
4. Close and reopen the instructor app, or refresh the website.
5. Open Instructor Portal → **Student Hub access & passwords** → Refresh.

No new trigger, API key or manually entered Script Property is required.

## Levels and passwords

- Practice Zone, Learning Library and Test Yourself each have Level 1–12 buttons. They start dimmed.
- Open the relevant section in **Student Hub access & passwords**. Each row shows its current four-digit password, an **Open** checkbox and Save.
- Check Open to undim that level, change the four-digit password if desired, then Save. Uncheck Open and Save to dim it.
- Opening/closing a level also updates its registered material/worksheet files. The existing individual-file Dim/Undim controls can still adjust files separately. Saving only a password does not reopen a file you individually dimmed.
- Passwords change automatically on the first day of every month at midnight Cairo time. Manual passwords apply to the current month. Your Open/Closed choices persist.
- Two wrong attempts lock that browser's selected level/section for 15 minutes. Correct passwords cannot bypass an active lock. This is a shared-password system, not individual student accounts.
- Books/material for Levels 9–12 must be uploaded before they can display. The eight existing interactive examinations are retained; examination buttons 9–12 remain dimmed until those exams are prepared.

## Free sections

Daily Challenge and Real English have small Free badges. They are free for everyone now. Both switch automatically to password access on **1 February 2027 at midnight Cairo time**.

Each has instructor settings for **Automatically: 1 Feb 2027**, **Keep free**, or **Require now**, plus Open/Closed and the current month's four-digit password. Their badges follow the selected access policy.

## Dashboard and Contact Instructor

Contact Instructor and Session Calendar are stacked at the beginning. Daily Challenge and Real English are stacked at the end. The middle sections are Practice Zone, Learning Library, Test Yourself and SB Studio. Listening audios remain in Learning Library.

SB Studio opens directly to a dimmed Stay Tuned page with a microphone illustration. Roleplay/recording controls are not active.

Contact Instructor contains session, grammar, vocabulary and practice FAQs, followed by an inline question form. Students can choose a topic and send their question without leaving that section.

## Check once with your own test account

Open one level, save its four-digit password, enter it from a second browser/device and confirm the right material opens. Check a Contact Instructor test email. Student exam scores remain private; the writing response still awaits your manual mark.

Automated checks used mocked Sheets/MailApp and phone/laptop browser widths. They did not send real client emails or deploy to your Google account. Publicly shared Drive or repository files remain public outside the portal; these controls do not make those underlying URLs confidential.
