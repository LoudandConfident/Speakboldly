# Personal French practice

Open Instructor Portal, sign in normally, then choose **FRENCH**. The same button appears on the instructor app page. It is not a student Learning Hub card and does not need a Google Sheet connection.

The library contains 365 daily lessons. The reading changes at midnight in Cairo and cycles after 365 days. Choose A1–A2, B1–B2 or C1–C2: readings get progressively longer and more reflective. Each lesson includes three expressions with explanations/examples in French, the five stages **Say it, Hear it, Learn it, Build it, Fix it**, a checked missing-word exercise, written practice with a model response, and a checked grammar correction with explanation. Some grammar examples are already correct; the instruction makes this explicit.

Optional read-aloud uses the device's French speech voice when available. There are no video links, external lessons, submissions or notification emails. Free writing is for self-review, not automatically marked. Accents matter in the missing-word check.

Notes, chosen level and completion are saved in the current browser on the current device. They remain separate from English Daily Task progress and are not synchronized between devices. Returning to the dashboard or signing out stops speech and closes the French view. Only the chunk needed for the current day loads after FRENCH is opened. The year contains 365 distinct readings at each of three levels (1,095 reading versions).

Content sources: `scripts/build-french-daily.py` and `scripts/french-year-content.py`. Rebuild with `python scripts/build-french-daily.py`. No Apps Script update is needed.
