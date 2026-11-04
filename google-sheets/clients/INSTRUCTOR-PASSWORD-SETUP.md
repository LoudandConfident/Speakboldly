# One password, no connection-key button

No password is added to a Google Sheet, and no sheet protection is added or removed. The instructor password is hashed in the existing private Apps Script properties. Keep all existing client/calendar code and records.

Use the private ready-to-paste Instructor-Password-Ready.txt file provided with these steps. It contains the agreed password setup and the password-only login handler.

1. Add a script file called **InstructorPassword** and paste the ready file. Keep your existing script files. Keep Code.gs and GeneralEnglishExams.gs.
2. Run **setupInstructorPasswordOnly** once. This writes private Script Properties only. It does not send emails or change any sheet cells.
3. Add these lines FIRST inside your existing `function doPost(event) {`, before other routing or connection checks:

```javascript
  if (typeof sbInstructorPasswordEvent === 'function') {
    const passwordResponse = sbInstructorPasswordEvent(event);
    if (passwordResponse !== null) return passwordResponse;
  }
```

Do not add another doPost. The block must be inside the existing function.

4. **Deploy → Manage deployments → pencil → Version: New version → Deploy.** Keep the existing deployment URL.
5. Reload the website and sign in with the agreed instructor password. No connection key is needed.

This Google-side deployment must be done in the owner's Apps Script account; publishing the website does not update Google's private script deployment.
