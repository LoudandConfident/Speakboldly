# Instructor calendar update

The calendar now has Month/Week/Day controls, a date shortcut, Refresh, and a confirmation button inside each booked day's appointment card. Confirmation sends only the selected appointment after you press OK. Nothing sends automatically.

Total hours taught includes completed sessions up to now (Cairo time), using each appointment's duration. Future and cancelled sessions are excluded; existing historical hours are preserved.

## Update the existing Apps Script deployment

1. Open [the complete updated script](https://raw.githubusercontent.com/LoudandConfident/Speakboldly/main/google-sheets/clients/UnifiedCode.gs) and copy the entire file.
2. In your existing Clients Apps Script project, replace the contents of Code.gs with that code. Save. Keep your existing Script Properties.
3. Select `updateSessionHours` and press Run once to refresh existing totals. Approve permissions if Google asks.
4. Choose Deploy → Manage deployments → the pencil beside your existing Web app → Version: New version → Deploy. Keep Execute as: Me and access: Anyone. Keep the same deployment URL.
5. Reopen or refresh the instructor portal and press Refresh in Calendar.

Open a booked day → Send confirmation → check the appointment details → OK. The confirmation goes only to that appointment's client. The existing client's Actions menu continues to confirm their next upcoming session.

These hours and selected-appointment email changes require the new script deployment. No new server, trigger, or setup run is needed.
