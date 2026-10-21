# Action plan email update

Use the existing Clients Apps Script project and web app deployment.

1. Replace its combined script with the updated `UnifiedCode.gs` in this folder. Keep all current Script Properties, spreadsheet IDs, passwords, triggers and private connection keys.
2. Save, then choose **Deploy → Manage deployments → Edit → Version: New version → Deploy**. Keep **Execute as: Me** and the existing access setting. The web app URL stays the same.
3. Refresh the instructor dashboard. Each current client row has **Send Action plan**. Open it, write the goals, activities, schedule and review date, then download the Word/PDF or send the PDF to that client. A confirmation appears before sending.

A client-specific editor opens; clicking the row button does not email an unfinished plan. The backend uses the email address stored for that client and logs retries to avoid duplicate sends. Existing report and Notes emails keep their types.

If your project uses the older split-file setup, update `EmailActions.gs` instead; do not add the combined script alongside those files.

Website loading improvements are published separately: hidden report panels no longer sync at dashboard startup, unchanged report lists need one read rather than two, material/access listings run concurrently, and repeated Notes/Action plan PDF operations reuse loaded font/logo assets and the unchanged PDF. Client-table updates are batched.
