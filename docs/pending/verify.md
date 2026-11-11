# Builder F — Advocate verification (D-35) and Advocate approvals queue (D-42)

## New decisions

- **D-76. One submission row per advocate; status stays on the profile.**
  `advocate_verifications` holds what the advocate entered (`details`, as
  entered, Bar Council number unaltered) plus the last decision and reason.
  `advocate_profiles.verification` remains the single status
  (`not_started → in_review → approved | needs_update | rejected`). Editing and
  uploads are allowed only in `not_started`, `needs_update` and `rejected`;
  `in_review` and `approved` are frozen (changing verified details goes through
  Support).
- **D-77. Verification documents are owner-scoped, not case documents.** Stored
  as `documents` rows with `case_id = NULL`, kinds `verification_identity`,
  `verification_enrolment`, `verification_practice`, S3 keys under
  `advocates/<user>/<doc>/`. The generic `/documents/*` endpoints join through
  `cases`, so they can never serve these files; only the verification endpoints
  do — to the owning advocate, and to admins. Identity filenames are replaced
  with generated names so an ID number in a filename is never stored; no content
  is extracted (§6d). The newest upload of each kind is the one reviewed.
- **D-78. Approval publishes the verified facts.** On approval the submitted
  Bar Council state/number/year, practice areas, city/state, years of practice,
  education, courts, languages and bio are copied to `advocate_profiles`, which
  every other screen already reads (D-02). Assignment and consultation booking
  already require `verification = 'approved'`; unchanged and covered by a test.
- **D-79. Decisions need a reason except approval.** "Request update" and
  "Reject" require a reason, shown to the advocate on the verification hub
  (243). Each decision has a confirmation step, writes `admin_actions`
  (`advocate_verification_<decision>`) and an in-app notification. Rejected
  advocates may correct and resubmit (no permanent ban is invented).

## §9.2 — built without a design

| Screen | Decision | Notes |
|---|---|---|
| Admin **Advocate approvals** list and detail (`/advocate-approvals`, `/advocate-approvals/:id`) | D-42, D-79 | Existing dark/orange counters, table, detail panels; waiting age reuses FIR `WaitingAge` |
| Advocate dashboard verification banner | D-35 | Existing card style; links to the verification hub; hidden once approved |
| Verification steps 234–239 in API mode | D-35, D-76 | One API-backed flow in the account-area cream/brown components; drawn sample values not used; the drawn 241 "incomplete" screen is the same hub as 233 |

## §9.2 — substitutions (D-01)

| Design | Drawn | Replacement |
|---|---|---|
| 238/239 | "BCI Compliance & Data Privacy: Information submitted is encrypted and strictly maintained…" | "Who sees this: Your details and documents are visible only to you and Legalitt’s review team." |
| 241 | "All uploaded documentation remains encrypted." | "Uploaded documents stay saved with your draft." |
| 236 | Drawn signature pad / e-sign hints | Not used; no signing is claimed |

## Schema

`advocate_verifications` (migration `202611110050_advocate_verification`),
DDL added to architecture §4.3a; `foundations.cjs` count 45 → 46.

## Routes

Mobile (API mode): `/advocate/verify/{intro,personal,professional,bar-council,practice,documents,review,submitted,incomplete,needs-update,complete}` all render the one flow; ungated.
Admin: `/advocate-approvals`, `/advocate-approvals/:id`, nav "Advocate approvals".
API: `GET/PATCH /advocate/verification`, `POST /advocate/verification/submit`,
`POST /advocate/verification/documents/presign`, `POST /advocate/verification/documents/:id/complete`,
`DELETE /advocate/verification/documents/:id`, `GET /advocate/verification/documents/:id/url`,
`GET /admin/advocate-approvals?status=waiting|decided`, `GET /admin/advocate-approvals/:id`,
`GET /admin/advocate-approvals/documents/:id/url`, `POST /admin/advocate-approvals/:id/decide`.
