# Bold Blog comments and replies

Readers can comment and reply publicly under each published post, without signing up or giving an email address. Display names are optional. Comments publish immediately; no approval queue is added. A server-verified Coach badge identifies replies posted through the private instructor dashboard. Reader display names are not verified identities.

The discussion sits below the existing reading pages, above the credentials. The article/glossary page count stays unchanged. The section is titled “Comments”, with “a safe space to share your bold opinion.” underneath. There is no separate invitation button or collapsed conversation panel. Threads show the newest activity first; replies stay together. Longer conversations have Earlier conversations / Show earlier replies controls.

## Activate once

1. Open the existing **Clients Google Sheet → Extensions → Apps Script**. Click **+ next to Files → Script**, name it **BlogComments**, and paste the complete contents of BlogComments.gs. This is a NEW file. Keep Code.gs, GeneralEnglishExams.gs, DriveFolders.gs, Rewards.gs and CalendarEditing.gs unchanged.
2. In the existing **Code.gs**, find `function doPost(...) {`. Add this small block immediately **inside its opening brace**, before the other routing blocks:

```javascript
  if (typeof sbBlogCommentsHandleEvent === 'function') {
    const commentResponse = sbBlogCommentsHandleEvent(arguments[0]);
    if (commentResponse !== null) return commentResponse;
  }
```

The return statements must be inside doPost, never at the top of a file. Do not add a second doPost function and do not replace the original Code.gs. All non-comment actions return to the existing routing code.

3. Save → choose **setupBlogComments → Run**. This creates only a **Blog comments** sheet and enables comments. It does not send emails, edit blog articles or touch client/calendar/report/exam data. Re-running setup does not reopen comments you have paused.
4. **Deploy → Manage deployments → existing Clients web app → pencil → New version → Deploy.** Keep the same URL, Execute as Me and the existing public access settings.
5. Refresh the website. Open a blog post and scroll to **Comments**. In the Instructor Dashboard open **Bold Blog · conversations → Refresh conversations**.

No billing account, new hosting service, Google API Console changes or email setup is required. This uses the existing Apps Script and Google Sheets quotas. Readers on different devices see the same shared discussions.

## Instructor controls

The private dashboard shows the latest 100 active comments/replies across posts, each with an Open this blog post link. **Post coach reply** publishes a public reply with the Coach badge. **Delete comment** removes its public text/name while preserving other readers' replies. **Allow reader comments and replies** pauses/reopens new reader posts; existing conversations stay readable and you can still reply as the coach.

Moderation is checked server-side with your existing private Clients connection key, not just the dashboard's convenience code. No key, author secret or private metadata is included in public comment responses. Removing comments through the dashboard keeps thread links intact; do not delete individual sheet rows manually.

## Reader controls and privacy

Readers can delete their own comments from the browser they used to post. A random browser secret is stored locally; its hash is stored in the sheet. No email is collected. Clearing browser storage loses the ability to delete earlier comments from that browser; the coach can still remove them. There are no accounts, private messages, email notifications or typing indicators.

All comment text is rendered as plain text. HTML/scripts are not executed. Comments are public; the form says this before posting. Readers automatically receive a fun animal nickname (for example Curious Lion); there is no real-name field. The nickname stays the same in the same browser, including replies. Existing reader comments are displayed with anonymous nicknames too. Verified coach replies retain their Coach badge. Nicknames are not unique accounts and may repeat. comments/replies can be up to 1,500 characters and contain up to two links. Limits allow 8 reader posts per 5 minutes / 50 per browser identity per day / 200 reader posts overall per day. These are lightweight controls, not a guarantee against spam from someone deliberately changing browser identities. The coach can pause posting or remove content.

Requests are idempotent: retrying the same comment cannot post it twice. Public reads are cached for up to 45 seconds and invalidated on comment changes. Comments load when the section approaches the viewport; they refresh every 30 seconds only while visible and connected to the current post, and while the reader is not composing a reply or browsing older history. Off-screen comment sections and hidden tabs do not poll. Posting a reply displays it immediately for that reader; others see it on refresh or the next background update.

Only published posts accept comments. The first built-in article is supported directly; future instructor-published posts are checked against the existing Bold Blog sheet and Cairo publish date. Draft/future posts do not expose public conversations.

This version caps the comments sheet at 4,000 records, including removed placeholders. If reached, archive complete older threads before continuing; don't remove a root while leaving its replies in the active sheet. Google Sheets is appropriate for this initial discussion feature; it is not a real-time messaging service.

## Verify

1. Open the same article in two different browsers. Post a comment in one, then a reply in the other.
2. Each reader can remove only their own comments; a reader named “Coach” cannot gain the Coach badge.
3. Deleting a parent preserves replies with a removed-comment placeholder.
4. The instructor can reply, remove comments and pause new reader posts.
5. Refresh/reopen confirms shared persistence. Retrying a timed-out post does not duplicate it.
6. Other blog posts keep separate threads; drafts and future posts reject public comment access.

## Updating to anonymous animal names

Replace only the contents of **BlogComments.gs** with this version. Keep Code.gs, its existing router and all other files unchanged. Choose Deploy → Manage deployments → pencil → New version → Deploy. Keep the same deployment URL. No setup rerun is needed, and existing comments are preserved.
