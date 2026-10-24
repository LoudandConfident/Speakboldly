# Preferred public domain

The preferred public origin is `https://speakboldly.space/`.

- GitHub Pages serves `main` at `/`, with custom domain `speakboldly.space` and HTTPS enforced. The apex has GitHub's four A records; `www` points to `loudandconfident.github.io` as required by GitHub Pages.
- GitHub Pages supplies HTTP 301 redirects from `https://loudandconfident.github.io/Speakboldly/` to the custom domain. Inner paths and query strings are preserved. No JavaScript redirect is necessary.
- Every HTML canonical and every sitemap URL uses the preferred origin. Resource links now use it too. Historic permission keys deliberately retain their old path format; the access helper normalizes the new URLs so existing grants continue to work.
- The homepage title is `Speak Boldly | English Language Coaching`. No separate personal-name-focused title is served from the old host, which redirects.
- No new `noindex` or robots restrictions were added. Existing restrictions on private resource folders and existing unpublished pages remain.
- Email senders, recipients, SMTP configuration, Apps Script endpoints, and DNS mail records are untouched.

The read-only `Check custom domain` workflow checks DNS, GitHub Pages configuration, live redirects, canonicals, and sitemap. It also runs after successful Pages deployments. The initial live audit is recorded at https://github.com/LoudandConfident/Speakboldly/actions/runs/40132162716.

Google controls the time it takes to crawl the redirect and consolidate old search results. Submit `https://speakboldly.space/sitemap.xml` and request indexing of the preferred homepage in Google Search Console when available. Do not remove the old result using robots blocking before Google processes the redirect.
