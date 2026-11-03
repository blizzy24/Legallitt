Deployed document upload verification — 3 November 2026

Result: PASS. No CORS failure reproduced. No infrastructure or application
configuration was changed, and no AWS deployment was performed for this check.

Both Vercel origins were already present in infra/src/core.ts and on the live
documents bucket. The Core CDK diff reports no differences (core-diff.txt).
The origins were previously added by commit c05a894. They are managed in CDK
and survive a subsequent deployment.

The deployed upload uses a presigned POST, not PUT. The API creates a POST
policy enforcing file size and MIME type; the browser sends multipart/form-data
with signature fields in the form. Replacing POST with PUT in CORS would break
the existing pipeline. No wildcard headers or origins are allowed.

Existing CORS rule, identical in CDK and AWS:
{
  "AllowedOrigins": [
    "http://localhost:8081",
    "http://127.0.0.1:5173",
    "https://legalitt-5.vercel.app",
    "https://legalitt-admin-panel.vercel.app"
  ],
  "AllowedMethods": ["POST", "GET", "HEAD"],
  "AllowedHeaders": ["Content-Type"],
  "ExposedHeaders": ["ETag"],
  "MaxAge": 300
}
Previously approved local origins and HEAD remain unchanged. The actual upload
uses Content-Type: multipart/form-data with a browser-generated boundary; no
Authorization header or x-amz-* request headers are sent by the upload code.

Browser verification:
1. Signed in through the deployed client UI as demo-client@legalitt.invalid.
2. Started Legal Notice LN-2026-0009; completed type/subject, noticee, sender
   and demand steps using labelled synthetic data, then reached Documents.
3. Selected deployed-upload-verification.pdf through the browser file picker.
4. S3 returned 204 with Access-Control-Allow-Origin matching the client origin.
   The document pipeline recorded status uploaded, one page, 1015 bytes and
   simulated=false. This is a real upload containing synthetic test content.
5. Signed in through the deployed admin UI in a separate browser context.
   Opened the draft case detail directly (unpaid drafts are excluded from the
   admin list). The Client documents group lists the PDF.
6. Clicked the PDF and visually confirmed the inline preview renders its text.
   A browser fetch from the admin origin returned 200 with the correct CORS
   origin; SHA-256 matched the original uploaded bytes. No browser errors.

Case: 7c50886b-eefa-49b6-aa50-c3e4646d5191
Document: ab41b33a-ba22-411c-b8b4-836b86611fc9
Client: https://legalitt-5.vercel.app/legal-notice/step4?caseId=7c50886b-eefa-49b6-aa50-c3e4646d5191
Admin: https://legalitt-admin-panel.vercel.app/legal-notices/7c50886b-eefa-49b6-aa50-c3e4646d5191

Evidence in this directory:
- client-uploaded.png — client Documents screen after upload
- admin-document.png — admin case detail lists the uploaded file
- admin-preview.png — actual PDF rendered in the admin preview
- deployed-upload-verification.pdf — the uploaded file
- result.json — sanitized browser network results and document metadata
- bucket-cors-before.json / bucket-cors-readback.json — live AWS rules
- core-diff.txt — no differences between CDK and deployed Core

Reproducible check: scripts/deployed-upload-check.cjs; requires the existing
ignored local API environment, built shared/API packages, Chrome and permission
to create a synthetic draft. Opt in with DEPLOYED_UPLOAD_CHECK=1. Use
DEPLOYED_UPLOAD_CASE_ID to revisit this case without creating another upload.
Credentials, signatures and signed download URLs are never saved in reports.
