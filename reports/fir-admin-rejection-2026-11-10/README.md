# FIR admin rejection — 10 November 2026

Approved scope: one review lifecycle for draft returns, identity replacement and
reassignment. Required reasons remain visible to successor advocates. Two draft
rejections enable reassignment; the new assignment starts at zero. The client
gets the approved neutral message and the former advocate gets a standalone
notification. Versioned policy pins the payment-based 24/48-hour thresholds and
the completing assignment's full captured advocate entitlement.

`202611100004_fir_admin_rejection` adds five tables and indexes. It does not
rename, drop or rewrite existing columns or PDFs. Legacy review history is
imported under the case lock, including submissions made by the old API between
migration and rollout.

Local browser evidence is under `local/`. The same synthetic case was resumed
after correcting test harness assumptions (the access guard hides the admin
approval route from clients; the local second advocate needed its existing
profile made available during the test). No deployed credentials were changed.
The run returned v2 with draft and identity corrections, accepted the client's
replacement, returned v3, reassigned, and approved v4. The released PDF matched
the completing advocate's preview byte for byte.

`api-tests.txt` records the complete suite in a new local test database. The
usual development test database was preserved because previous failed runs had
left fixtures. `scripts/verify-fir-clean-suite.cjs` reproduces the isolated run.
Mobile and admin TypeScript checks and production builds also pass.

All cases, documents, disputes and identity evidence in this report are
synthetic. Payments and courier activity use the existing demo integrations.
No real ID number or card image is used. Identity purge verification lists
storage versions and delete markers without reading identity content.

Release and deployed walkthrough results are appended after verification.
