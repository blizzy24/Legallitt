Legal Notice closing — 4 November 2026

Owner decisions made in the client's absence, registered in architecture §9.2:
- Positive whole-day compliance period, default 15; advocate may set it per case.
- Separate compliance sentence before consequences, anchored to receipt.
- Empty/whitespace Offences means civil consequences alone; a supplied offence
  retains the drawn combined sentence. No offence placeholder is printed.

Settings: services.config.notice_policy (Legal Notice only). Default period,
criminal-clause mode and closing copy are configurable. Each draft snapshots the
period and policy; later settings changes cannot rewrite approved notices.
Migration adds nullable cases.compliance_period_days, drafts.compliance_period_days
and drafts.closing_policy. No historical record is backfilled with a deadline.
First save supplies the default; opening alone does not create a draft.

Tracking shows the period from the last sent draft, so an advocate's unsent
revision does not silently change the period presented to the client. No calendar
deadline is calculated without a receipt date.

Editable: Background & Facts, Offences, and the structured Compliance period
(days) field. Closing prose and the four intake sections remain read-only.

BLANK AUDIT (reported before non-offence changes; other handling left pending)
notice-pdf.ts nonempty() originally had six call sites:
1. Subject — underscores when cases.subject_line absent/whitespace.
2. Sender name — underscores when intake fullName absent/whitespace.
3. Father's name — underscores when case_parties.father_name absent/whitespace.
4. Sender address — underscores when intake address absent/whitespace.
5. Offences — REMOVED in this chunk; blank now selects civil-only consequence.
6. Place — underscores when assigned advocate profile city absent/whitespace.
Other missing-value paths: age prints four underscores; service fee prints eight;
an entirely absent recipient draws three ruled lines. A partially absent
recipient silently omits the absent part. Final and draft PDFs share these paths.
The signature line is intentionally blank for signing by hand.

No changes to those other blank paths without the pending required/optional-field
decision. Company LegalConsultants / LegalConsultant difference remains as drawn.

Validation:
- All five workspace typechecks.
- Shared: 19 tests; API: 79 tests, including real local Postgres 16 lifecycle,
  invalid periods, version snapshots, client visibility and PDF text extraction.
- PDF tests cover with/without/whitespace offences and sentence order.
- Deployment and browser evidence will be appended after live verification.

DEPLOYED VERIFICATION
Implementation commits: fe4bf41, d91503d.
Dev Compute image: notice-closing-20261104
Digest: sha256:c611da76a3e5047992214861bdb1ad0beefbba402f3c17d6637b528d88be471d
Migration applied successfully before rolling the service; ops task exited 0.
CDK template diff: no resource changes; image parameter updated only API/ops
revisions and the existing service. Dev API task revision 6; Core/prod unchanged.
Mobile: dpl_D7qCSexjbrZpYM5Yf7xiydDGTzxK, Ready, legalitt-5.vercel.app.
Full fixture smoke: 322 routes, zero failures.

Actual public app, two isolated browser sessions, seeded advocate and client:
- Existing synthetic case LN-2026-0015, explicitly named TEST ONLY.
- Loaded default 15; opening created no draft.
- Entered 1.5: inline validation; stayed in editor, no draft saved.
- Changed to 7; unsaved value survived polling; saved and reopened as 7.
- Generated v6 with supplied test offence, v7 with empty Offences.
- Both real API PDFs contain the seven-day sentence before consequences.
- Civil version contains no criminal clause or dangling offences wording.
- Neither PDF contains underscore placeholders (this test case has full intake).
- Sent civil v7 via the real document pipeline; client tracking displays
  '7 days from receipt of notice'. No browser errors.
- The case remains client_review; no notice was dispatched to anyone.

Artifacts:
notice-with-offence.pdf             Real generated draft v6, two pages
notice-without-offence.pdf          Real generated draft v7, two pages
with-offence-pages/page-1.png       PDF rendered for visual inspection
with-offence-pages/page-2.png       Flowed hand-signature block
without-offence-pages/page-1.png    Civil-only closing
without-offence-pages/page-2.png    Flowed hand-signature block
advocate-default-15.png            Public editor with default
advocate-civil-only.png            Public editor after changing period and clearing offence
client-tracking-period.png         Public client tracking after send
verification.json                 Assertions and real test-case reference

Persistence left by verification: two new draft versions and their audit events,
the sent v7 PDF in S3/documents and the real client review notification. All belong
to the existing TEST ONLY case. The one-off migration task has stopped; its task
definition revision and CloudWatch migration logs remain as deployment evidence.
No credentials were changed; no data was deleted.
