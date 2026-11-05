# Prepared integration — not activated

The existing Apps Script editor source and installed deployment have not yet been verified. This change edits the canonical `google-sheets/clients/UnifiedCode.gs`; it does not add an overlapping Apps Script file, run setup, change existing properties, or replace the deployment URL. Do not apply it over an uninspected live project.

## Shared selections

Authenticated `contentRotationOwner` and `saveContentRotation` actions control Motivation and Bold Blog separately. Public `contentRotationSettings` reads the shared state. State lives only in the new `SB_CONTENT_ROTATION_V1` Script Property; existing content, properties, clients, appointments and folders are retained.

Freeze holds the current item until resumed. Shuffle chooses another published item and preserves frozen/running mode. Resume advances the shared selection once per Cairo date. Drafts and future-dated articles/messages are excluded. Blog selection features one article first; the article archive and direct links stay available. Revisions reject concurrent stale writes. The owner buttons dim Freeze while frozen and Resume while running.

The website controls must not be released until the current Google project is inspected and the shared backend actions are deployed and verified at the existing address.

## Private Notes delivery

The existing Node server gains an optional HMAC-authenticated `/api/private-mail/notes` route. It sends from `Contactus@speakboldly.space` through Namecheap SMTP and saves the same MIME message in the configured IMAP Sent folder. `/api/private-mail/check` verifies SMTP credentials and access to that folder without sending a message.

Private hosting is not connected. It must support Node 24+, persistent private disk, HTTPS, and outbound TLS to Namecheap SMTP 465 and IMAP 993. GitHub Pages cannot host this relay. No paid hosting has been created or selected.

Server-side secret/configuration names:

- `PRIVATE_MAIL_ENABLED` — disabled unless explicitly `true`.
- `PRIVATE_MAIL_USER` — the Contactus mailbox address.
- `PRIVATE_MAIL_PASSWORD` — mailbox password/app password, stored only in hosting secrets.
- `PRIVATE_MAIL_SENT_FOLDER` — the folder name verified against the actual mailbox; never guessed or created automatically.
- `PRIVATE_MAIL_RELAY_SECRET` — a dedicated secret of at least 32 characters.
- `EXAM_DATA_DIR` — existing private storage root; Notes delivery records use its `notes-mail` subdirectory.

Existing Apps Script property names for this integration:

- `SB_NOTES_MAIL_RELAY_URL` — HTTPS relay URL ending `/api/private-mail/notes`.
- `SB_NOTES_MAIL_RELAY_SECRET` — the matching dedicated relay secret, not the mailbox password or client connection key.
- `SB_NOTES_MAIL_PROVIDER` — existing delivery is retained until explicitly set to `namecheap` after verification.

No credentials belong in website code, GitHub commits, browser storage, or chat. The mailbox password is never sent to Apps Script. Billing and other existing mail integrations are not rerouted.

Delivery records persist request ID, payload hash and the MIME message privately. Reusing an ID with different content is rejected. Once SMTP accepts a message, retrying a failed Sent copy does not send another client email. An uncertain SMTP result is never resent automatically. IMAP checks the stable Message-ID before appending, including after an interrupted append.

## Validation and remaining work

Local tests cover authenticated shared writes, frozen selection across days, shuffle, daily resume, hidden drafts, stale revisions, button states, Blog ordering, late-response races, HMAC validation, PDF/recipient validation, retry-safe sending, Sent-copy recovery, fail-closed configuration and the IMAP literal protocol.

These tests do not establish live Namecheap delivery, the deployed Apps Script version, or cross-device behavior. Live activation remains blocked on the editor/project source, a chosen private host, secure credentials, verified Sent folder, and a controlled end-to-end test.
