# speakboldly.space

The existing Speak Boldly repository and website stay in place. `CNAME` selects `speakboldly.space` for the existing branch-based GitHub Pages deployment; no hosting move or redesign is involved.

## GitHub Pages

Open https://github.com/LoudandConfident/Speakboldly/settings/pages.
Keep the existing publishing source (`main`, repository root). Confirm that **Custom domain** is `speakboldly.space`; enter it and click **Save** if it is blank. The repository's CNAME file is already prepared.

The connected GitHub file tools cannot administer Pages settings. A successful repository deployment alone does not prove that the administrative custom-domain setting or HTTPS enforcement is enabled. Confirm these in Pages settings or in the **Check custom domain** workflow output.

## Namecheap DNS

Under Domain List → Manage → Advanced DNS → Host Records, add the following with TTL **Automatic**:

| Type | Host | Value |
| --- | --- | --- |
| A Record | @ | 185.199.108.153 |
| A Record | @ | 185.199.109.153 |
| A Record | @ | 185.199.110.153 |
| A Record | @ | 185.199.111.153 |
| CNAME Record | www | loudandconfident.github.io |

Replace conflicting parking, URL Redirect, A, AAAA, ALIAS, or CNAME records at `@` or `www`. Keep unrelated records, especially mail MX and TXT records. The www target has **no** `https://` or `/Speakboldly/` suffix. No extra hosting subscription or paid SSL certificate is required.

These Host Records apply when Namecheap is the authoritative DNS provider (normally Namecheap BasicDNS). If the domain uses other nameservers, edit these records at that provider instead of changing nameservers without checking existing services.

## HTTPS and redirects

DNS propagation and GitHub certificate provisioning can take up to 24 hours. After the GitHub Pages DNS check succeeds and the certificate is ready, select **Enforce HTTPS** in Pages settings.

With the apex configured as the custom domain and both DNS entries correct, GitHub Pages supports redirecting www.speakboldly.space to speakboldly.space and the old project URL https://loudandconfident.github.io/Speakboldly/ to the custom domain. Confirm both redirects after DNS propagates; do not add a Namecheap URL Redirect record in place of the A records.

Run **Actions → Check custom domain → Run workflow** to inspect public DNS, Pages CNAME, certificate/enforcement state, and the old URL response. This workflow is read-only; it does not claim to enable HTTPS or alter account settings.

## Existing functionality and device settings

All page assets and the app manifests retain relative URLs. Existing Sheets records, uploaded files, and permission IDs are unchanged. The document viewer rebases old public GitHub-hosted documents to the custom domain while preserving their saved grants. Backend-generated legacy URLs continue to rely on GitHub's redirects; an Apps Script redeployment is not needed for this migration.

Browser storage belongs to each origin. Existing local-only drafts, progress, and saved sheet-connection settings cannot transfer automatically from github.io to speakboldly.space. Cloud/Sheets data remains in place; reconnect the instructor dashboard and reinstall the phone app from the new domain where needed. No private connection keys are copied into URLs or public repository files.

Reference: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site
