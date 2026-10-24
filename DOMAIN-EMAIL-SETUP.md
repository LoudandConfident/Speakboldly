# Domain email routing

| Purpose | Address |
| --- | --- |
| General inquiries / program consultations | Contactus@speakboldly.space |
| Team applications | Joinus@speakboldly.space |
| Private student questions / replies to learning reports | Askcoach@speakboldly.space |
| Payment screenshots / payment reminders / payment and registration confirmations | billing@speakboldly.space |
| Sender of progress reports, final reports, action plans and notes | noreply@speakboldly.space |

The four learning-report types deliberately share Noreply. Financial messages use Billing. Report replies go to Askcoach; financial replies go to Billing. A sender address is not supplied by a public visitor.

## Activate the Apps Script changes

The mailboxes and Gmail send-as aliases have been confirmed by the owner. These changes still need to be deployed to the existing Apps Script web app:

1. Replace the existing full `UnifiedCode.gs` with the repository's updated `google-sheets/clients/UnifiedCode.gs`.
2. Run `authorizeClientEmails()` once and approve Gmail access.
3. Run `checkDomainEmailSenders()`. It verifies Billing and Noreply against the executing account's aliases without sending any email.
4. Deploy → Manage deployments → Edit → **New version** → Deploy. Keep the same web-app URL and **Execute as: Me**.

The website checks the backend routing version before requesting a report/payment email, so an outdated deployment cannot silently send those messages from Gmail.

If a sender alias is missing, the send is rejected before a delivery-log entry is created. It never silently falls back to the underlying Gmail address. Existing sent-request IDs still prevent duplicate deliveries.

The one-time routing setup moves private assessment notifications to Askcoach and calendar notification preferences to Contactus. Payment/registration notifications use Billing. The underlying Google account, Sheets, Drive files, clients and saved permissions remain in place.

For split-file installations, add `EmailRouting.gs` alongside the updated EmailActions, RegistrationActions, LibraryActions, StudentContact and BookingActions files. The full UnifiedCode file already includes the helper.

The optional separately hosted SMTP backend uses `SMTP_NOREPLY_FROM` (default `noreply@speakboldly.space`) for learning-result messages. Its SMTP account must be authorized to send that identity; this is separate from the live Apps Script deployment.

Website navigation, share links, brochure hyperlink targets, email logos and registration review links use https://speakboldly.space/. Legacy stored file URLs and permission keys remain compatible rather than being rewritten in the Sheets.
