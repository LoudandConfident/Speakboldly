# Booking approval, calendar and dashboard update

## What students do

1. Open Learning Hub → Calendar. No calendar password is required.
2. Choose Placement test (30 minutes), Session (90 minutes), or Trial session (90 minutes).
3. Choose a date and start time within the rolling six-week window. Placement start times are 30 minutes apart inside your existing available hours.
4. Enter their name, email, program and payment status.
5. Send the payment screenshot separately to **speakboldly16@gmail.com**, including name, program, date and time. If payment is not required, they can select that answer.
6. Submit the registration request. A request does not reserve the time until you accept it.

## What you do

You receive a notification email showing the name, email, program, appointment type, date, start/end time and reported payment status. The Accept and Decline links open that request in your private instructor dashboard. Sign in and confirm your decision there; opening an email link alone cannot change the calendar.

In **Booking requests**, choose the level and verified payment status, then **Accept** or **Decline**. Accepting adds one appointment and creates a client record if their email is new. Existing clients keep their enrollment history and current program; the appointment records the requested course separately. A competing request cannot overwrite an accepted appointment. Declining leaves the calendar unchanged.

Students see available and taken times without names. Accepted appointments also appear in your existing personal-calendar subscription when Apple Calendar next refreshes it. Client confirmation emails remain manual through Actions.

## Update the existing Apps Script deployment once

1. Open **UnifiedCode.gs**, choose **Raw**, and copy the complete file.
2. Replace all of **Code.gs** in your existing Apps Script project, then Save. Keep the existing script properties and deployment URL.
3. In **Project Settings → Script properties**, keep **SB_EXAM_NOTIFY_EMAIL** set to the address where you receive notifications. Set **SB_ZOOM_URL** to your Zoom meeting link and **SB_ZOOM_PASSCODE** to its passcode. Zoom details now stay in private settings instead of public code.
4. Run **verifySpeakBoldlyInstall**. This checks the complete script and does not send emails.
5. Select **Deploy → Manage deployments → Edit → New version → Deploy**. Execute as **Me** and keep the existing web-app access setting.
6. Refresh the website or reopen the installed app. Submit a test request with your own email, then accept or decline it in the instructor dashboard.

No setup rerun is needed for an already connected calendar. **Registration requests** and **Calendar availability** are created automatically when first used. Dimming a day blocks new requests and approvals without deleting existing appointments. The six-week boundary is checked by the server. Reports and examination scores remain private, and sending final reports is still manual.
