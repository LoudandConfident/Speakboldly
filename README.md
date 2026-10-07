# Forma

A responsive adult English-learning website with searchable courses, practice lessons, enrollment, progress tracking, and local English teacher session requests.

## Run

Requires Node.js 20 or newer. No package installation is needed.

```sh
npm start
```

The server listens on port 3000; set `PORT` to override it.

```sh
npm test
```

## Demo scope

Course content and instructors are illustrative. Enrollment, completed exercises, and session requests are stored in this browser's localStorage. Booking requests are not sent to instructors; entered names and emails are not retained. There are no accounts, payments, video lessons, certificates, or backend synchronization. Google Fonts are optional; system fonts are used if unavailable.

To launch a production learning service, add authenticated accounts, a database, teacher scheduling, email delivery, and real course content.

## Publish with GitHub Pages

In the repository Settings → Pages, choose Deploy from a branch, select main and / (root), and save. Relative asset paths support GitHub Pages project hosting. Further pushes to main update the site automatically. This is a public demo: instructor profiles and course content are illustrative, and booking requests are not delivered.
