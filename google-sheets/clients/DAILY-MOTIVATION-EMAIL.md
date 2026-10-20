# Daily motivation emails

The client’s Actions menu now includes **Send daily motivation**. It previews today’s quote and the recipient. Nothing is sent until you press **OK**. The email includes the daily picture, text and a link to the matching motivation page. The signature is Speak Boldly, without an email address.

## Activate once

1. Open the full updated `UnifiedCode.gs` file in this folder and copy all of it on your laptop.
2. Open your existing Apps Script project. Replace the contents of `Code.gs` and save.
3. Choose **Deploy → Manage deployments → pencil → New version → Deploy**. Keep the existing deployment URL, properties and access settings.
4. Reload the website or installed instructor app.
5. Open **Clients → Actions → Send daily motivation**. Check the name and email, then press **OK**.

No new trigger or Script Property is needed. Only the instructor’s private Google Sheets connection can send these emails. Recipients come from the saved Clients sheet. Retries of the same request are logged to prevent duplicate delivery. If delivery is uncertain, check EmailLog before sending again.
