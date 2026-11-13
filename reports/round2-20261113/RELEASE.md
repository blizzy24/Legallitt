# Round 2 release — 14 November 2026 (IST)

Authority: [Ishaan's Round 2 answers](../../docs/flows/ISHAAN-ANSWERS-2026-11-13.md),
sections A/B/C/E/F/H within the built-services scope. Legal Advice, court and KYC
workflow redesigns remain outside this release. This is not the earlier polish pass.

## What shipped

- Application commit/image **`7bc60d0`**; local evidence commit **`0df07c4`**.
- `LegalittDev-Compute-DevelopmentOnly`: **UPDATE_COMPLETE**, healthy API task
  `legalitt-dev-api:28`, image digest
  `sha256:2cf5d543e10c6ba15b2998fb020052b1c3a76662c1f45437f220f4363d774137`.
- Both Vercel projects successfully deployed `0df07c4`: client/advocate at
  https://legalitt-5.vercel.app and admin at https://legalitt-admin-panel.vercel.app.
  Subsequent verification/evidence-only commits do not change application code.
- Image pushed first; migrations **202611130100_round2_built_services** and
  **202611130101_notice_signatures** completed with exit 0 before the stack update.
- `seed-round2 7bc60d0` completed with exit 0 after both frontends succeeded.
  Confirmed versioned bases are PS Ordinary ₹499 / Urgent ₹999 and DF Ordinary
  ₹1,499 / Urgent ₹2,999. Existing prices are not rewritten.
- Required `docker builder prune -a -f` and `docker image prune -a -f` ran after
  the image push and again after deployment. Database volumes were preserved.

The [item-by-item audit](AUDIT.md) maps every in-scope answer to implementation and
evidence. Changes include report tariffs/support settings, permanent counterpart
phone privacy, PS admin review and office notes, DF original-document tracking,
and LN intake, signing/submission, reminders, deadlines, replies and cancellation.

## Verification

| Gate | Result |
|---|---|
| Full API suite | **224 passed**, 0 failed, 0 skipped — [log](full-api-final.log) |
| Shared package | **30 passed**, 0 failed — [log](shared-tests-final.log) |
| Authenticated routes | **348 checked**, 0 failures — [log](routes.log) |
| Frontends | Both typechecks and builds passed |
| Local browser journeys | All requested Round 2 journeys passed; unchanged earlier passes retained |
| Live PS/DF | Ordinary/Urgent intake/payment; clarification; decline/reassign; editor and uploaded report; admin return/approval; office-note-only outcome; DF originals and external attribution; both report/affidavit variants; viewing/downloads, one wallet credit per case, isolation and cancellation — [log](reports-live.log) |
| Live LN | Three method combinations, company and cheque-bounce intake; client changes; uploaded/test signature; explicit submission/chat lock; admin return/re-sign; admin verification; pre-acceptance cancellation/full simulated refund — [log](notice-live.log) |
| Live access/settings | Confirmed tariffs and admin-only editor, support hours, signature route, counterpart phone privacy; cross-client case reads **404 both ways** — [log](live-check.log) |
| Existing payments | **35 pre-release demo payment records unchanged**, compared by hashes |

LN courier retry ₹179, free electronic retry, reply uploads and delivery were
already passed locally and retained. Reminder 24h/72h idempotence, the seven-day
queue and overdue extension/client notification passed using isolated synthetic
local timestamps; deployed case dates were not changed to repeat those tests.

Live verification created only synthetic cases under the existing demo accounts.
No existing case was reset, no credential was changed, and no real money moved.
The live report runner initially hit picker timing and saved-form resume assumptions.
Focused picker checks passed both a saved form and a delayed save. Only the browser
script changed; the final complete run exited 0 with no unhandled browser errors.

## Screenshots

- [Legal Notice comparisons](../../docs/flows/ln-screens/README.md): 168 entries.
- [Property Search comparisons](../../docs/flows/ps-screens/README.md): 68 entries.
- [Document Forensic comparisons](../../docs/flows/df-screens/README.md): 88 entries.
- Supplemental live captures are retained locally under `notice/live/screens`,
  `reports/live/property_search` and `reports/live/document_forensic`.

All requested side-by-side comparisons, application code, test logs and live
result records are pushed to main. Uploads of the supplemental live PNGs repeatedly
failed with connection resets, including smaller Git packs and individual GitHub
blob requests. These optional additional images remain on disk and are preserved
in local backup commit `0d244c3` (`round2-evidence-backup-0d244c3`); their upload is
the only outstanding evidence-transfer item. They are not required to view the
already-pushed side-by-side comparison indexes above.

Comparison indexes include unchanged captures for context and label screens with
no separate drawing. New admin screens and substitutions are recorded in architecture §9.2.

## Explicit limits and recorded assumptions

- Payments/refunds and Aadhaar e-sign remain explicitly labelled test steps.
  Uploaded signatures are images, not digital certificates or notarisation.
- SES sender/identity remain unconfigured. No real email delivery is claimed;
  live LN cases stop at dispatch-ready. Email retry/delivery behavior was tested
  with the isolated local adapter. WhatsApp/courier events are manually recorded.
- DF Urgent uses **calendar days** pending confirmation. Original-document
  destination/postage comes from advocate instructions; no postage fee is invented.
- LN wallet credit remains at delivery pending answer I.5; courier retry revenue
  belongs to the platform. Partial refunds leave the case open.
- Phone privacy covers structured/API/notification data and known text in generated
  PDFs, including supported legacy generated PDFs. It does not OCR arbitrary
  uploaded evidence or identity images. Original evidence objects remain intact.
- Browser verification does not claim physical-device testing or real push receipt.

## Build provenance

The Debian download stalled, and ARM64 emulation was slow. After recovering the
stopped Docker engine, native Node **22.23.4** compiled the exact application source.
The image packages that platform-independent JavaScript in the pinned deployed
ARM64 runtime; API/shared dependency manifests and the lockfile were verified
unchanged. Its application and seed modules loaded successfully under ARM64 before
push. See [build recipe](native-build.sh), [Dockerfile](Dockerfile.native-build),
and [successful build log](native-build.log).
