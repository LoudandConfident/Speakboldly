# Interactive examinations update

Website changes publish through GitHub Pages. The shared exam password, saving and private scoring also require updating your **existing Clients Apps Script deployment** once.

1. Open [UnifiedCode.gs](https://github.com/LoudandConfident/Speakboldly/blob/main/google-sheets/clients/UnifiedCode.gs) and select **Raw**. Copy the entire file, not the GitHub preview or a fragment.
2. In the existing Apps Script project, replace the entire contents of `Code.gs` with that code and **Save**. Do not add the unified code alongside older duplicate Clients/Exam/Email/Sessions files.
3. Run `setupStudentPortal` once. Approve Google permissions if asked. Existing clients, materials and submissions are retained.
4. Select **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Keep the existing web app deployment and URL. Its execution account needs access to your sheet and permission to send mail; the web app must remain accessible to your students.
5. Refresh the website or reopen the installed app. In Instructor Dashboard, open the password section: **Examinations — all levels** is the one password for the entire folder. Material passwords remain separate per level. Existing monthly password rotation remains in place.
6. Test with your own name: Learning Hub → Examinations → password → name and Level 1–8 → Start. The 20-minute timer begins when the saved attempt opens. No exam dim/undim action is required.
7. Read the submission notification email sent to your existing `SB_EXAM_NOTIFY_EMAIL` address. It includes automatic section scores, the writing paragraph and all submitted answers. Students receive only a submission receipt, never scores or feedback. Exam Review has been removed from the dashboard. Review writing and alternative correction/punctuation responses from the email, then prepare and send the final report manually.
8. Booking requests go to **billing@speakboldly.space** with Accept and Decline links. Sign in and confirm the choice. Accepting saves one appointment and marks its time taken anonymously for students; declining leaves it available. If the student has not arrived from a specific program, choose their program on the instructor approval form. The student is not asked for a program.
9. Calendar shows the current month and allows navigation through the six-week window from today (Cairo). Dates after the cutoff are dimmed and blocked on the server. Times appear in their day squares in 12-hour format. Only selecting a time opens the booking form.
10. Placement booking requires both free assessments and a placement-fee screenshot. A session also requires the spoken placement test and a course-fee screenshot. A trial requires both free assessments, with no fee instruction. Both tests are linked in the booking form.
11. Exercises has one folder password. Material asks for a level and that level’s password. No general Material password is used. Other existing monthly password settings remain.
12. Save the Placement Test or Learner Test result as an image: both include the logo and **© Prepared by Mira Nasser Louis** at the bottom.

## Mark allocation

| Section | Marks |
| --- | ---: |
| Choose the correct answer | 10 |
| Complete the sentences | 5 |
| Correct the mistake | 5 |
| Paragraph writing | 10 |
| Reading comprehension | 5 |
| Punctuation | 5 |
| **Total** | **40** |

The new templates are versioned `level-1-v2.json` through `level-8-v2.json`. Existing submissions retain their original 100-mark structure, saved review data and original templates. No old answers, materials or Drive files are deleted. Name/level identify the attempt; this shared-password flow does not verify student identity.

The eight existing uploaded books are shown under their matching Material levels with generic titles (Level 1 Book through Level 8 Book). The three previously uploaded, unlabelled worksheets appear in Exercises for each selected level; they are not assigned an invented level. Documents load only when opened.

Native English is a separate public Learning Hub card. Its curated page and original brief change on the first of each month in Cairo time: BBC in October 2026, TED in November, short stories in December, then mixed sources across a repeating twelve-month selection. It needs no script configuration.

No separate server or new hosting service is needed. Existing Google Apps Script and Sheets remain the backend for shared passwords, booking requests, submissions and email. The visual layout, monthly links and saved result images run in the browser. Browser-only preferences/check-ins are not represented as synchronised student records.

## Availability and card layout update

After deploying this version, Instructor Calendar → **Slots** beside a date lets you add start/end windows and dim, undim or remove individual windows. The existing date Dim/Undim button closes or opens the whole day. Changes are shared through the existing Apps Script; students can request only times inside enabled windows. Placement tests use 30-minute starts within those windows. Removing a window does not cancel an existing class. Accepting a booking rechecks that its window still exists and is enabled.

The former Exercises card is now **Activity**, and the separate Activities card is removed. Cards have horizontal icon/text layouts. Protected folders show a password popup before opening their section page. The back control is a green arrow. Native English now uses the supplied BBC course page for the current month.

## Weekly scheduling and AM/PM update

Replace your project code with the complete **UnifiedCode.gs**, save, then **Deploy → Manage deployments → Edit (pencil) → New version → Deploy**. Keep the existing deployment URL and script properties. You do not need to rerun setup for these scheduling changes.

Instructor scheduling now offers **This session only**, **Weekly for 6 weeks** (six appointments including the first), or **Until the program’s sessions are complete**. Enter the current session number; an eight-session program starting at session 5 schedules sessions 5–8 at the same weekday and time. Review the confirmation before saving. Existing conflicts or dimmed dates prevent the series from being saved. No client confirmation email is sent automatically.

New trial appointments last **60 minutes**; placement tests **30 minutes**; regular sessions and workshops **90 minutes** (English Momentum remains 60). Existing saved appointments retain their saved durations. Times and time selectors use **12-hour AM/PM** display. On phones, **Show clients** expands the client list; desktop clients stay visible.
