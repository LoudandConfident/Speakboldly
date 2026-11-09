# Instructor session overlaps

The website now displays up to four named sessions in each calendar day. Additional sessions remain available by opening the day.

To enable intentional overlaps when adding, editing, or repeating instructor sessions in the connected sheet:

1. Open the existing Clients Google Apps Script project.
2. Replace its combined code with the updated `UnifiedCode.gs` from this folder.
3. Save, then choose **Deploy → Manage deployments → Edit → New version → Deploy** for the existing web app. Keep its current URL and access settings.

For a project maintained as separate files, update `Sessions.gs` and `CalendarEditing.gs` instead of the combined file, then deploy a new version in the same way.

The website sends `allowOverlap: true` only through the existing authenticated instructor session routes. Student booking availability, required authorization, stale-edit protection, duplicate session protection, and automatic-email behavior remain unchanged. Session numbers continue to identify each learner’s sessions independently of duration.
