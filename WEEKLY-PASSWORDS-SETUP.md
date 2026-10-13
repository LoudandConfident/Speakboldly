# Activate weekly portal passwords

The Instructor Portal shows four read-only passwords under **Passwords for this week**: Material; Calendar; Exercises – Comprehension – Listening; and Assessments. Passwords stay fixed during the week and change every Monday at midnight Cairo time. Opening this section loads the current passwords; Refresh passwords updates the display. No weekly trigger is needed.

1. Open your existing Clients Google Sheet → Extensions → Apps Script.
2. Replace the contents of your existing unified script with the latest [UnifiedCode.gs](google-sheets/clients/UnifiedCode.gs), then save. Keep your existing Script Properties, connection key, spreadsheet and deployment.
3. Choose Deploy → Manage deployments → edit your existing web app → Version: New version → Deploy. Keep the same web app URL, execution account and access settings.
4. Refresh the website and open Instructor Portal → Passwords for this week. Connect your Clients sheet using your private key if this browser is not already connected.

No setup function needs to be rerun if your portal, assessments and calendar were already working. Until the Google deployment is updated, the website shows an activation message and existing fixed student passwords continue to work.

Material passwords cover Material, Levels 1–8 and the program folders. Exercises, Comprehension and Listening share a separate password. Assessments use their own password; the calendar uses its own password. Dim / Undim controls stay available and continue controlling each file or assessment. Changing the week does not delete files, bookings, reports, assessment answers or scores. Students already taking an assessment can finish with their existing session. Three wrong passwords still lock that browser until midnight Cairo time.

These are shared class passwords, not individual student accounts. Private reports continue to go by email. The dashboard displays the current passwords but does not send you an email each week.
