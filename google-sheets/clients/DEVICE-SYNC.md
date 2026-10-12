# Shared Teacher Portal data

Replace the existing standalone Clients Code.gs with the complete Code-with-device-sync.gs provided to the owner, or use StandaloneClients.gs + Sessions.gs + TeacherDocuments.gs in the same project. Do not install both the complete script and the individual files. Preserve CLIENT_SHEET_ID, CLIENT_SYNC_KEY and the existing five-minute reminder trigger. Deploy a new version of the existing web app, retaining its /exec URL.

Clients retains its original nine columns. Column J stores access selections. Sessions stores calendar appointments. TeacherDocuments stores report field values, not PDF binaries. Its tab is created on the first authorized report sync. Version checks prevent a stale report save from overwriting a newer remote report. Client record editing remains last-write-wins; don't edit the same client simultaneously on two devices.

Connect the same sheet once per device using the private key. Future browser-only timed appointments and local report field data are migrated from each original device; never clear browser storage before migration is confirmed. The calendar displays already-shared appointments even if an old browser entry fails to upload. Connected devices refresh every minute and on focus. Open client, appointment and report editors are protected from automatic UI refresh.

The sheet does not provide secure cross-device student sign-in or private uploaded binary files. Those require the configured private server/authentication/storage. Connection credentials remain device-local. Class reminders still require setupSheetReminders and Google authorization.
