# Review album

Reviews are separate from the student reminder Google Sheet. No requests are sent to that sheet by the Reviews page.

The album supports left/right arrows, with the selected review in front and neighboring cards blurred. Submissions appear immediately without approval after successful shared-storage confirmation. Names and ages are optional. No review email is sent.

The existing private server implements persistent public reviews and authenticated owner deletion. Deploy it and configure EXAM_BACKEND_URL to enable live shared reviews. Alternatively configure a dedicated review endpoint in reviews-api.js; do not use the student reminder endpoint.

Public storage is currently not configured, so the published submission button does not claim to save reviews. Local tests verify album navigation, immediate rendering after a confirmed submission, safe text, and optional fields. Live cross-browser verification is still needed after storage deployment.
