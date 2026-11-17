Namecheap Sent copies with the existing Private Email subscription

The consolidated script supports an optional hidden copy of each email to one
archive mailbox. This covers its GmailApp and MailApp delivery paths, including
notes, attachments, confirmations, reminders, motivations and notifications.
It keeps the existing sender, Reply-To and recipient addresses.

This is a mailbox copy, not a change of sending provider. Google still sends the
message. A Namecheap incoming-mail rule must file the copy into Sent; Apps Script
cannot verify or change that folder rule. Older Gmail Sent messages are not moved.

One-time activation, in this order:

1. Sign in to the destination Namecheap Private Email mailbox. In Settings → Mail
   → Filter rules, add a rule to file messages from the website's sending addresses
   into the mailbox's existing Sent folder and mark them as read. Include both
   verified domain senders (normally Noreply and Billing) and the Google account
   executing the script for the older MailApp notifications. Use an "any condition"
   rule, or one rule per sender. Rule labels can vary by webmail version. Apply this
   only to the intended sending addresses; do not file all incoming mail into Sent.
2. Replace Code.gs in the EXISTING Apps Script project with the latest combined
   script, or use the current UnifiedCode.gs. Preserve the existing Script Properties
   and deployment URL. There is no need to run setup or password-reset functions.
3. In Project Settings → Script Properties, add SB_SENT_COPY_EMAIL with the exact
   address of that Namecheap mailbox. Use one address only. No mailbox password is
   required for this approach.
4. Save, then Deploy → Manage deployments → Edit → New version → Deploy.

The optional checkSentCopySettings function is read-only and sends nothing. It
reports whether the archive address is configured, not whether Namecheap's filter
has run. Confirm the first normal website email in the Namecheap Sent folder. If it
arrives in Inbox, move that copy and adjust the filter; do not resend the client email.

To disable new archive copies, remove SB_SENT_COPY_EMAIL from Script Properties.
The default is off. The script preserves existing BCC recipients and avoids adding
another archive recipient when the mailbox is already in To, CC or BCC.

Sending directly through Namecheap with no Google delivery is a different setup.
The documented SMTP/IMAP route requires a private service that sends the message
and saves its Sent copy. The current optional copy feature does not activate one.
