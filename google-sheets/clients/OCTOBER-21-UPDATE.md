# 21 October — combined update

## Activate the hours fix
1. Copy the complete [UnifiedCode.gs](./UnifiedCode.gs), replace the entire Code.gs in the existing Clients Apps Script project, and Save.
2. Deploy → Manage deployments → pencil → New version → Deploy. Keep the existing deployment URL.
3. Refresh clients and calendar in Instructor Portal.

No new Script Property or trigger is needed.

## Level history and session numbering
- Move to next level preserves the old level and its recorded hours in an editable dimmed history row.
- The new level starts at zero hours. Completed non-cancelled sessions add their actual duration to that level only.
- Calendar numbering starts at Session 1 for the new level/program; confirmation uses the chosen appointment's saved session number and level.
- Lifetime hours taught include both current levels and archived level snapshots.
- Retrying a move does not create another archived line.
- For legacy moved clients with no saved hour snapshots, the script separates current-level completed sessions and preserves the remaining recorded total in the most recent missing historical snapshot. Review older history if a client has several pre-update moves; the old data did not record a per-level hour breakdown.

## Website changes
- Instructor Reviews shortcut removed; public Reviews stays available.
- Mobile homepage uses a landscape photo and four benefits in one row.
- Reviews return to green speech cards with scrolling text inside the card.
- Real English help/link controls stay in the page flow on phones.
- SB Studio uses the available width, with two tabs and a centred microphone. Voice Lab transcribes on supported browsers; Roleplay Room remains Stay Tuned.
- Daily Challenge has Hear / Say / Learn / Build / Try / Fix / Nail. The passage first appears in Say it. Nail it requires 2, 4 or 6 complete sentences.
- Level groups receive different daily topics. The existing 365-day library remains in use.
- Daily idiom and a small rotating text bubble sit beside the desktop challenge; phone layout puts them in a compact row.
- Writing checks run locally and catch common errors. They are suggestions, not a full language or pronunciation assessment.
- Browser speech recognition can use Apple/Google online processing and may be unavailable on some devices. Typing remains available.

## Security boundaries
Dim/Undim is a display/access control, not encryption. Public repository files or publicly shared Drive links can still be opened outside the portal. Four-digit shared passwords are not individual student accounts; browser-based attempt limits can be bypassed with another browser. Instructor writes require the private Clients connection key on the Apps Script server; the visible instructor convenience code is not the server credential. Keep that connection key private and do not use a public/shared device for instructor access.

## Validation
Syntax and isolated logic checks cover level-hour separation, history migration, cancellation, idempotent moves, session numbering, daily topic rotation, sentence minimums, local corrections, transcript flow and microphone cleanup. No real client emails were sent. A live phone/browser visual inspection was unavailable for this final batch.
