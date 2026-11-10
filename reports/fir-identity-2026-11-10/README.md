# FIR required identity evidence — 10 November 2026

Client-confirmed policy: FIR requires any one of masked Aadhaar, passport,
voter ID or driving licence. Q15 is answered for FIR and remains open for other
services. Personal facts remain client intake data, read-only in the draft.

## Implementation

- Database setting: `services.config.fir_identity_policy` for `fir_draft`.
  Version 1 contains the four accepted types. Existing settings survive seed
  reruns. Operators can change the accepted list and increment its version
  without a code migration.
- Additive migration `202611100003_fir_identity_evidence` adds nullable JSON
  metadata and initialises the setting only if absent. Metadata contains only
  document type, masked-copy declaration, policy version and timestamp.
- Missing/unknown type and unconfirmed masked Aadhaar are refused before an
  upload is allocated. Intake submission, payment before gateway capture, PDF
  preview and sending for approval enforce accepted uploaded identity evidence.
- The client chooses a type from server configuration. Aadhaar requires an
  explicit masked-copy declaration and provides UIDAI download guidance.
  Loading, retry and missing-document messages explain blocked actions.
- Identity files remain opaque: no OCR, text, QR or ID-number extraction and
  no AI input. Structural MIME/page-count inspection remains for upload safety
  and combined-page pricing. Original identity filenames are discarded; neutral
  generated filenames reach storage, download headers and PDF manifests.
- Masking is an uploader declaration plus manual review, **not automatic image
  verification**. No verified/KYC claim is introduced. Admin sees declared type
  and masking, and a reminder never to transcribe an ID number.
- Draft selection includes the identity document in its attachment manifest.
  Admin approval still releases exactly the submitted PDF version. Previously
  completed PDFs are not regenerated.

Sources for download guidance, retrieved 2026-11-10:
[UIDAI](https://www.uidai.gov.in/en/my-aadhaar),
[Government of India PIB](https://www.pib.gov.in/Pressreleaseshare.aspx?PRID=1828797&lang=2&reg=48).
The client, not these sources, defines the accepted-document policy.

## Verification

`api-tests.txt` records **122 passing tests, zero failures/skips**; `mobile-types.txt`, `admin-types.txt` and
`local-build.txt` record frontend checks/builds. `local/verification.json` and
screenshots record the local client → advocate → admin → client walkthrough.
Only synthetic evidence and existing demo credentials were used; payment is
explicitly simulated. The local browser origin is outside S3's CORS list, so
local upload uses the real API/storage pipeline from the harness; the deployed
walkthrough uses the browser upload button.

The walkthrough checks the four visible choices, masked-copy upload block,
missing-ID submission refusal, passport upload, resumed personal facts,
required advocate selection, saved version conflict, retry, frozen admin review,
byte-identical released PDF and cross-client isolation in both directions.
One identity PDF page plus 25 supporting pages still produces one ₹25 overage
charge: total ₹1,498.53 with the existing FIR tariff.

## Release evidence

Deployment and live walkthrough results are recorded alongside this report
after the API image is pushed, its migration succeeds, Compute is updated, and
the published frontend bundles are verified. `capture-final.cjs` records the
persisted approval/release audit; the walkthrough's approval snapshot represents
the earlier pending review, so its `approved_at` is null at that point.
