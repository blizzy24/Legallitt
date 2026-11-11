# Builder E — account area part B (pending merge into DECISIONS.md and architecture §9)

Branch `p0-account-b`. Covers D-20, D-21, D-22, D-23, D-24, D-25, D-27, D-29, D-30.

## New decisions (D-68 – D-75)

- **D-68. "Sign Out of All Devices" signs out this device too.** Cognito's global
  sign-out revokes every refresh and access token for the user, including the
  current one; it can't spare one device without device tracking (D-21 already
  omits per-device sign-out). The row reads "Sign out everywhere, including this
  device", the confirmation says so, and the app returns to sign-in afterwards.
  Design 15's "except this phone" wording is not used because it would be false.
- **D-69. Seeded demo accounts can't change their password in the app.** Any
  account on `@legalitt.invalid` shows "Demo account — managed by Legalitt" and the
  API refuses with 409. The demo password is a shared credential in Secrets Manager
  (AGENTS.md: never change it on its own); letting a demo viewer change it would lock
  everyone else out.
- **D-70. Notification preferences quiet, they never hide.** Turning off an in-app
  category (Case updates, Consultations, Payments) still files every notification in
  the inbox, but it arrives already read, so it raises no unread badge. Nothing a
  client needs is lost. Category rule is one shared function
  (`notificationCategory`) used by the inbox filters and the adapter.
- **D-71. Active Sessions shows sign-in method and time; device only when recorded.**
  `auth_events` doesn't capture the user agent for current sign-in paths, so the
  device label appears only on rows that recorded one ("Web browser", "Android
  device", "iPhone or iPad"); otherwise the row says "Signed in with password / one-
  time code". Recording the user agent at sign-in is a small follow-up in AuthService.
- **D-72. Change Password: no in-app reset.** The design's "Forgot your password?
  Reset Password" link has no built reset flow; the screen says reset isn't available
  in the app yet and points to Legalitt Support.
- **D-73. Download My Data is a JSON file** of the caller's own profile (no Cognito
  identifiers), preferences, cases they own, their payments, messages in their case
  threads and saved advocates. On web it downloads; on native it opens the share sheet.
- **D-74. Deletion requests deactivate immediately and are idempotent per user.** One
  pending request per user (partial unique index). `users.status='deactivated'` makes
  every authenticated request fail at `AuthService.identity`. Blocked while a case is
  in any paid, uncompleted state (paid → dispatched, including advocate_declined).
  Retention after deletion stays an open client question (§12 Q5).
- **D-75. Saved Advocates shows only active, approved advocates**, labelled "Approved
  by Legalitt" (a fact from `advocate_profiles.verification`), with availability from
  their published weekly hours ("Hours today" / weekday list / "No hours published"),
  and the consultation total computed from the confirmed Legal Advice tariff (₹885).
  "Book Consultation" preselects the advocate in the Legal Advice booking step; it's
  disabled, with the reason, if the advocate has no published hours. No ratings,
  presence dots or "Available Today/Tomorrow" claims (D-02). The heart appears on each
  advocate in the Legal Advice booking list (advocate profile pages remain gated
  outside case context).

## §9.2 entries

- **Privacy & Security hub (profile-13)** — built as drawn minus the "2FA Active"
  badge and "Verification enabled" line (D-01, D-21).
- **Login & Security (profile-15)** — Two-Step Verification and Login Alerts omitted;
  Google shows "Not available yet"; mobile number masked; Sign Out of All Devices
  wording per D-68.
- **Active Sessions (profile-16)** — location and per-device sign-out omitted (D-21,
  D-71).
- **Privacy Settings (profile-17)** — drawn toggles replaced by a who-sees-what summary
  (D-23). Built from existing card/row components.
- **Privacy Policy** — built without a design: placeholder "Being finalised" with
  Contact Support (D-43).
- **Data & Documents (profile-18)** — "protected under Legalitt client privacy" footer
  omitted (D-01); "Delete Uploaded Documents" row replaced by My Documents (builder D's
  delete rules apply there).
- **Delete Account (profile-19)** — request flow, blockers listed with links to each
  case, irreversible-action confirmation (D-24, D-74).
- **Notification Preferences** — built without a design from existing rows/switches
  (D-20, D-70); SMS and WhatsApp "Not available yet".
- **Language (profile-12)** — other languages disabled "Coming soon" (D-22).
- **Help Center (profile-20)** — answers rewritten from built behaviour (D-25); the
  "Confidential Legal Assistance" footer omitted (D-01). Support hours in one constant
  `SUPPORT_HOURS` in `apps/mobile/features/account/faq.ts` (D-03).
- **Saved Advocates (profile-6)** — D-75.
- **Home search (11/12)** — live filtering of services; carousel stays omitted (D-30).

## §9.1 register

Nothing new is simulated. Password change and global sign-out are real Cognito calls.

## Notes for the integrator

- The Profile hub (builder D) hides the Language row in API mode
  (`shownPreferences`). Language is now live at `/language`; the hub should show it.
- `scripts/mobile-smoke.mjs` route count changed 329 → 337 for this branch's eight new
  routes; recompute after merging all branches.
- New routes: `/account/password`, `/account/security`, `/account/sessions`,
  `/account/privacy-settings`, `/account/data`, `/account/delete`,
  `/notification-preferences`, `/privacy-policy`. Ungated: `/privacy`, `/language`,
  `/help`, `/advocates`.
