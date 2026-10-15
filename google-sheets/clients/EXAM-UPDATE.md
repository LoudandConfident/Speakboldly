# Interactive examinations update

Website changes publish through GitHub Pages. The shared exam password, saving and private scoring also require updating your **existing Clients Apps Script deployment** once.

1. Open [UnifiedCode.gs](https://github.com/LoudandConfident/Speakboldly/blob/main/google-sheets/clients/UnifiedCode.gs) and select **Raw**. Copy the entire file, not the GitHub preview or a fragment.
2. In the existing Apps Script project, replace the entire contents of `Code.gs` with that code and **Save**. Do not add the unified code alongside older duplicate Clients/Exam/Email/Sessions files.
3. Run `setupStudentPortal` once. Approve Google permissions if asked. Existing clients, materials and submissions are retained.
4. Select **Deploy → Manage deployments → Edit (pencil) → Version: New version → Deploy**. Keep the existing web app deployment and URL. Its execution account needs access to your sheet and permission to send mail; the web app must remain accessible to your students.
5. Refresh the website or reopen the installed app. In Instructor Dashboard, open the password section: **Examinations — all levels** is the one password for the entire folder. Material passwords remain separate per level. Existing monthly password rotation remains in place.
6. Test with your own name: Learning Hub → Examinations → password → name and Level 1–8 → Start. The 20-minute timer begins when the saved attempt opens. No exam dim/undim action is required.
7. Read the submission notification email sent to your existing `SB_EXAM_NOTIFY_EMAIL` address. It includes automatic section scores, the writing paragraph and all submitted answers. Students receive only a submission receipt, never scores or feedback. Exam Review has been removed from the dashboard. Review writing and alternative correction/punctuation responses from the email, then prepare and send the final report manually.
8. Booking requests go to **speakboldly16@gmail.com** with Accept and Decline links. Sign in and confirm the choice. Accepting saves one appointment and marks its time taken anonymously for students; declining leaves it available. If the student has not arrived from a specific program, choose their program on the instructor approval form. The student is not asked for a program.
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
