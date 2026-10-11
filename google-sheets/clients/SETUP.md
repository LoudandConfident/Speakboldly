# Students across devices

The Teacher Portal reads the private Clients sheet after teacher login and after connecting it, and includes Refresh students. The connection key remains private and must be entered once on each device. It is never included in the public website. The teacher convenience code alone does not authorize access to the sheet.

## Update the current deployment

For a separate Clients Apps Script project, replace its current client code with StandaloneClients.gs. For a combined Reviews/Clients project, use Clients.gs and keep the existing handleReviewPost and doGet functions. Do not install both client files together.

Keep the existing CLIENT_SYNC_KEY and CLIENT_SHEET_ID Script Properties. Existing rows and deployment URLs must be preserved. Choose Deploy > Manage deployments > Edit > New version > Deploy. The updated script supports authenticated checkConnection, listClients and upsertClient requests. Permissions are stored in column J; the existing nine columns remain compatible.

On the original device, use Sync existing students to upload browser-only records. Connecting now loads the sheet without automatically overwriting it with potentially older browser data. Then open Teacher Portal on the phone, expand Google Sheets — load and save students, and enter the existing private key there. Do not send the key in chat.

## Verify

1. Check that the same clients appear on the original device and phone after connecting.
2. Change a client's hours on one device; use Refresh students on the other and verify the update.
3. Verify that Student Codes with leading zeroes remain four digits.
4. Verify that report recipient selection lists the loaded clients.
5. A wrong connection key must not return client data. A failed request must report an error and preserve existing browser records.

The sheet takes precedence for matching Client IDs or emails. Browser-only records remain available until synced. Deleting connected clients through the browser is disabled; removing a sheet row does not erase an old browser copy. Client deletion and conflict resolution need a separate authenticated workflow. Calendar sessions, PDF drafts and email delivery are outside this change.
