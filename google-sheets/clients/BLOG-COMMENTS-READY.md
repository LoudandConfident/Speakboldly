# Public comments and article glossaries

Use the latest private Speak-Boldly-Portal-Update.txt in the existing Apps Script project. This combines password-only login, public comments, glossary metadata and the Culture Corner film editor in one file. Keep Code.gs and all client/calendar records.

The single sbSpeakBoldlyPortalEvent routing block must be first inside the existing doPost. If the earlier combined file is already installed, replace its contents rather than adding another file. Run setupPortalBlogComments once, then deploy a New version of the same web app.

Comments use the private Blog comments sheet; visitors receive only public fields. Names are generated automatically. No accounts, personal details, emails or WhatsApp submissions. The handler includes author/global rate limits, request deduplication, a honeypot, unsafe-link/embedding checks and basic content moderation. A row marked hidden or deleted stops exposing its text. Existing comments are preserved.

Each new article has vocabulary and expression fields in the instructor article editor. Aim for 15 words and 5 expressions with definitions and examples. Metadata is saved with the article in column I of Bold Blog. Only published articles and their learning tools are publicly readable. No credentials are written to that column.
