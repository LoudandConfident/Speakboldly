# Rewards: add to the existing Clients project

Keep the original **Code.gs** and every existing file. Do **not** replace client sync, calendar, email signatures, or spreadsheet properties. Do not create another `doPost` function.

## 1. Add one new file

Open the Google Sheet that contains **Clients** and **Sessions** → Extensions → Apps Script. Under **Files**, click **+ → Script**, name it **Rewards**, and paste the complete contents of [Rewards.gs](Rewards.gs) into that new file.

This is the Clients project, **not the separate Reviews project**. Review rewards remain inactive.

## 2. Routing through the current portal update

The latest supplied GeneralEnglishExams.gs forwards reward requests before private client authentication. Replace the contents of that existing file with the supplied private update. If the existing General English routing hook is already installed, no Code.gs edit is needed. Keep Code.gs and the current deployment URL.

For an installation without that existing General English hook, use the routing instructions in GENERAL-ENGLISH-EXAMS-SETUP.md first. Do not create another doPost.

## 3. Save and run setupRewards once

Choose **setupRewards** in the function dropdown and click **Run**. Approve access if Google asks. **Do not run doPost**, and do not re-run client setup.

Setup creates only **Reward claims** and **Reward referrals**, checks the existing billing sender, and enables this feature. It does not send test emails and does not edit Clients, Sessions, reviews, or their histories.

The existing email helpers `sbVerifiedFrom` and `sbSendDomainEmail` must still be present. `billing@speakboldly.space` must be a verified Gmail send-as alias (or the deploying account’s primary address). Existing email templates and signatures are not replaced; only the new reward emails use the new voucher template.

## 4. Update the existing deployment

**Deploy → Manage deployments → select the existing Clients Web app → pencil → New version → Deploy.** Keep the same deployment URL, execute as the owner, and retain public Web app access so claims can be submitted. Do not create a replacement deployment URL.

Refresh the website. The public reward sections activate only when this deployment reports `enabled: true`. Before installation, visitors do not see non-working claim buttons. The instructor Rewards panel remains available with this setup link.

## Locations and qualification

- **Contact Us**: public Share & Save and Refer & Save offers.
- **Contact Us → Manage vouchers · instructor**: private claim checks, approval/email, decline, resend and redemption. Unlock with the existing instructor connection.
- No reward cards in the student or instructor dashboards, and no extra claim button after blog/motivation sharing.

Share claims require a shared-post URL or a JPG/PNG screenshot (up to 2 MB). Screenshots are kept in a private Drive folder. A Share click alone does not prove publication. Only the instructor can approve a claim.

Refer & Save first emails a personal referral link and code. After a friend pays, the referrer submits the friend’s registered email. Approval requires a client who was added after the referral link was created, has their first round marked **Paid**, and has not already earned another referral reward. The coach must confirm the referral relationship.

## Voucher and email behaviour

Approval creates one authoritative voucher with the registered client’s name when available, email, 10%, Cairo issue date, and an unpredictable unique code. Current clients receive **next-round** eligibility; people not yet enrolled receive **first-round** eligibility. The instructor’s browser renders the personalised JPEG using the website’s ticket design; the authenticated backend sends it as an inline picture and attachment to the stored recipient. A public request cannot choose the email recipient or issue a voucher.

Duplicate claim requests and duplicate send retries do not create another voucher or automatically send another email. If delivery is uncertain, check Gmail **Sent** before using the explicit **Resend voucher** action. The same code/date are retained on resends.

Only one unused voucher can exist per recipient across the two offers. Vouchers cannot be combined. The QR on the picture opens the public Programs page; the unique voucher code is what the coach checks at redemption.

## Redeeming

Select **Redeem for eligible round** on an issued claim. The named learner must be in Clients under the same registered email. Enter a unique round reference and its tuition fee, then confirm this is their eligible **next** or **first** round. The backend checks identity, status, single use, and duplicate round references and calculates exactly 10%.

Round eligibility is confirmed by the coach: a new monthly round can be at the same English level, so level changes alone are not treated as proof of a new round. This action records the voucher’s use; it does not change current-round prices, Amount paid, or cash totals. Record the actual new payment normally.

## Quick checks

1. Confirm normal client sync, calendar, reports and existing emails still work.
2. Submit a share claim with a test link; it must appear Pending without an issued voucher.
3. Approve using your own test email. Confirm the email includes the correct name, Cairo date, first/next wording, code and JPEG.
4. Retry the same claim: no second voucher. Redeem once: a second redemption must fail.
5. Confirm Reviews still publish normally without a reward option.

To pause public rewards, set script property **SB_REWARDS_ENABLED** to **false**. This hides public offers; keep existing records. Do not delete the reward sheets.
