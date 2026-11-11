# Beyond Words

A standalone, unattributed literary space using the existing static hosting. It deliberately does not load the educational site's header, footer, app bundle, credentials, organisation schema, author information, analytics, or external assets. No new dependencies or services.

## Current public-facing draft

- `index.html`: all approved page copy and semantic sections.
- `beyond-words.css`: forest-green / ivory / muted-gold publication design; system serif type; mobile and reduced-motion styles.
- `beyond-words.js`: a small, optional scroll reveal. All content remains readable without JavaScript.
- `mark.svg`: neutral typographic browser icon, not a book cover.
- The homepage discovery arrow is in `../index.html`, on the right opposite the existing credentials. It opens `../literatespace/index.html`, the /literatespace/ editorial hub for Bold Blog and Bold Reads. Bold Reads opens this Beyond Words page. The arrow styling is at the end of `../interface-refinements.css`; it appears on hover/focus on desktop and remains visible on touch devices.

Publication approved by the user on 11 November 2026, including the homepage fit correction.

## Replace the teaser later

In `index.html`, find `<div class="teaser-slot" data-teaser-slot>`. Replace only its inner `.teaser-placeholder` with approved content. Keep the slot and section heading in place.

- Text: semantic paragraphs in `<div class="teaser-text">…</div>`.
- Image: an approved local `<img>` with descriptive alternative text and actual width/height.
- Video: an approved local `<video controls preload="metadata">`, with captions and a transcript. Avoid autoplay. Keep video assets reasonably sized for static hosting and mobile visitors.

Do not place private media, a manuscript, or draft chapters in this public website repository.

## Dormant future reading room

`reading-room.js` and `reading-room.css` are generic scaffolding only. They contain no manuscript or chapter content. They are not linked, imported, fetched, mounted or displayed by the current page.

Only after explicit publication approval:

1. Supply approved chapter text through a `chapters` array, with unique `id`, `title` and `paragraphs` (plain-text strings). Do not add unpublished content to public files.
2. Link the separate `reading-room.css` and import `mountReadingRoom` from `reading-room.js` in the future reading page.
3. Call `mountReadingRoom(host, { enabled: true, title, chapters })`. The default is disabled and an empty chapter list mounts nothing.

The scaffold provides chapter navigation and a table of contents, adjustable 16–24px text, light/dark modes, responsive reading width, and optional local chapter/position/preference persistence. Storage errors are tolerated; no accounts, network API, fees, printing controls, download controls, PDF or EPUB are provided.

Local progress is specific to the browser and can disappear when storage is cleared. On-page reading is not copy protection: browsers can still copy text, save pages and take screenshots.
