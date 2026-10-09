# Activate class reminders

The website is on GitHub Pages, which cannot run scheduled email jobs. The prepared Render blueprint runs the private server continuously and keeps calendar/client records on a persistent disk. It selects Render's paid Starter plan plus a 1 GB disk. Review Render's current price before creating the service. No hosting service has been purchased or created by this change.

1. Sign in to Render and open [Deploy Speak Boldly](https://render.com/deploy?repo=https://github.com/LoudandConfident/Speakboldly). Review the blueprint and charges before deploying.
2. For `SMTP_PASSWORD`, enter a Gmail app password for `speakboldly16@gmail.com` in Render's secure environment settings. Gmail app passwords require two-step verification and may depend on your account's policies. Use [Google's app password settings](https://myaccount.google.com/apppasswords). Do not use your normal Gmail password or send passwords in chat.
3. Wait for the service to become healthy. Save the HTTPS URL Render gives you, for example `https://speak-boldly-private.onrender.com` (your actual URL may differ). Open its `/api/status` endpoint and confirm `remindersReady` is `true`. This verifies configuration presence; it does not prove Gmail delivery.
4. Set `EXAM_BACKEND_URL` in `exam-config.js` to that actual URL and publish the change. You can provide the URL in chat so Codex can do this step. The URL is not a password.
5. Open the website's Admin portal using the existing dashboard code. In the private storage connection section, use the generated `EXAM_ADMIN_PASSWORD` from Render's environment settings. Keep this password private. No exam uploads are required to schedule classes.
6. Re-enter existing clients in private storage with their email addresses. Browser-only client and calendar records are not automatically uploaded. Add each class's date, Cairo time and session number in the session calendar.
7. Test using your own email address as a test client. Add a future test session less than 24 hours away, wait for the next 30-second check, and verify the actual email arrives. Cancel the test session afterwards. Do not rely on reminders before this delivery check succeeds.

Scheduled classes send at the first scheduler check at or after 24 hours before class, ordinarily within 30 seconds while the server is running. Late bookings send shortly after saving. Sent reminders are recorded, failed deliveries retry up to three times, and cancellations stop pending reminders. Downtime can delay reminders. A delivery interrupted by shutdown is marked `delivery_unknown` to avoid blind duplicate sends; check Gmail/provider history before creating a replacement reminder.

The email confirms the session number, class date, Cairo time, Zoom link `https://us06web.zoom.us/j/79051707388`, passcode `7P1NpA`, and the rule that no same-day cancellations are allowed. It is sent from `speakboldly16@gmail.com`.
