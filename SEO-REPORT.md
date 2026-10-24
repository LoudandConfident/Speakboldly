# Speak Boldly SEO — 24 October 2026

## Audit and changes

- Main problem: homepage tabs and course dialogs shared a canonical URL and metadata. Important course copy was generated in JavaScript and lacked crawlable course destinations. Created actual, server-rendered HTML pages on GitHub Pages; no framework migration, SPA fallback, form changes or email changes.
- Homepage: focused English speaking/communication title and description, matching social metadata, Organization/WebSite/WebPage JSON-LD, real navigation hrefs with existing JavaScript tab behaviour preserved, skip link and explicit logo dimensions. Retained the visible H1 and existing layout.
- Courses: `/programs/`, four active course pages, nine clearly labelled forthcoming previews. Four/eight-session General English schedules share one page to avoid duplicating the same course. Internal operational courses remain absent. Unique titles, descriptions, canonicals, social previews, breadcrumbs, Course and course-list data use actual program details; no invented testimonials, ratings, credentials or guarantees. Upcoming pages are noindex.
- Free resources: `/learn/`, `/learn/daily-idioms/`, `/learn/daily-challenges/`, `/learn/daily-quotes/`, `/assessments/`. Idioms include real meanings and examples; challenge samples include three level groups, optional browser audio and answer reveals. The existing daily mission system and frozen motivation schedule are unchanged.
- Existing motivation share pages: improved metadata and internal links; only the current published versions enter the sitemap. Superseded versions are noindex, and original artwork is untouched.
- Bold Blog: `/blog/` stays “Stay tuned” and noindex while empty. Article pages have stable `/blog/{id}/` URLs, visible full text, picture support and BlogPosting data. A six-hour GitHub workflow reads only already-public, due articles from the public Apps Script endpoint after the site’s Stay tuned flag is removed. It never reads drafts or private student information. Existing instructor publishing remains unchanged; private/scheduled-future content cannot enter the static export. Published changes can take up to six hours to appear in search-ready pages. Manual workflow dispatch is also available.
- Sitemap: 34 public URLs, no hash/query URLs, previews, empty blog or operational courses. `robots.txt` advertises the sitemap and excludes material/source folders from crawling. Robots exclusions are not access controls. Added a real 404 page without a misleading redirect to a 200 homepage.
- Loading: mobile hero now selects sharp, centre-cropped 640/960-pixel WebP variants; 640-pixel asset is approximately 57 KB instead of 137 KB. High priority for the hero, nonblocking font and portal-only styles, conservative CSS minification. No service-worker or backend changes.

## Validation and limits

- Ten focused SEO and email-routing tests pass. Browser checks at 390 and 1280 pixels cover every generated page, the original Programs tab, course dialogs, consultation and placement entry points; no horizontal overflow or JavaScript errors. Course content also verified with JavaScript disabled. No real emails were sent.
- Local Lighthouse, simulated mobile, uncompressed local HTTP: homepage performance 67 → 70; accessibility 100; SEO 100. First contentful paint 4.7 → 4.0 seconds; largest contentful paint 5.7 → 5.4 seconds. These are lab readings, not production Core Web Vitals or Google ranking predictions. The original large, layered app stylesheet remains the main performance limit. Public course pages use a small independent stylesheet; the General English page scored 100 for performance, accessibility, best practices and SEO in the same local mobile audit.
- Two pre-existing `courses.test.mjs` assertions fail because they assume the source array starts with General English and is pre-sorted; the actual UI sorts available courses first. Neither courses.js nor its price/order logic was changed. Focused public-page tests and browser checks validate actual rendered course availability and order.
- Sitemap submission/indexing and live Core Web Vitals need Google Search Console. Ownership verification and indexing requests were not altered. SEO cannot guarantee indexing or ranking.

## Request indexing next

1. https://speakboldly.space/ (refresh after the metadata update)
2. https://speakboldly.space/programs/
3. https://speakboldly.space/programs/general-english/
4. https://speakboldly.space/programs/english-momentum/
5. https://speakboldly.space/programs/english-interview-preparation/
6. https://speakboldly.space/programs/business-email-writing/
7. https://speakboldly.space/learn/daily-idioms/
8. https://speakboldly.space/learn/daily-challenges/
9. https://speakboldly.space/learn/daily-quotes/
10. https://speakboldly.space/assessments/

Submit https://speakboldly.space/sitemap.xml in Search Console. Do not request indexing for forthcoming previews or the empty blog.

## Maintain

Run `npm ci --ignore-scripts` then `npm run build:seo` after editing course data, shared CSS, idioms or public content. `scripts/build-public-pages.mjs` writes only its recorded generated HTML files and regenerates the sitemap. `scripts/build-search-assets.mjs` rebuilds conservative minified styles. Workflow `Refresh public search pages` repeats the build for relevant changes and on a six-hour schedule; if it commits new content, it explicitly requests a legacy Pages build. No Apps Script redeployment is required for these SEO changes.
