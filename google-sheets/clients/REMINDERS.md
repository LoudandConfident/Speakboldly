# Automatic class reminders from Clients

The Teacher Portal supports class appointments in the same private spreadsheet as Clients. Use the existing Clients deployment; preserve CLIENT_SYNC_KEY and CLIENT_SHEET_ID.

Replace the standalone Clients Code.gs with StandaloneClients.gs and add Sessions.gs in that project. A combined Reviews/Clients project instead uses Clients.gs with Sessions.gs, preserving the existing review functions. Run setupSheetReminders once and authorize Google spreadsheet, mail and trigger access. This creates the Sessions tab and an every-five-minutes trigger. Edit the existing web-app deployment to a New version and keep its URL unchanged.

After activation, connect the sheet on the original calendar device and Refresh students. Future browser sessions with a time are synced idempotently; earlier or untimed entries stay in browser storage. New appointments save to Sessions. Cancellation stops pending reminders. Reminders use the current Clients email, the existing Zoom link/passcode and Cairo time. They are sent at the first trigger on or after the 24-hour threshold; bookings inside 24 hours are handled at the next check.

Mail sends from the account that authorized the trigger, with the Speak Boldly display name and Askcoach@speakboldly.space reply-to. Mail quota exhaustion postpones sending. Sent means accepted by Google, not inbox-confirmed. Unknown delivery is not automatically retried. To verify, schedule a short-notice test with your own email and check the inbox and Sessions status after the next trigger.
