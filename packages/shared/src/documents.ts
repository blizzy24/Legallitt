import { z } from "zod";
import {IdentityUploadSchema} from './fir-identity';

export const DOCUMENT_MAX_BYTES = 25_000_000;
export const DOCUMENT_URL_SECONDS = 300;
export const DocumentMimeSchema = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
]);
// Metadata must not carry a full identity number. No OCR or identity-field
// extraction is used to inspect the file itself.
const metadata = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .refine(
    (value) => !/(?:^|[^\d])\d{4}[ -]?\d{4}[ -]?\d{4}(?!\d)/.test(value),
    "Do not include a full identity number in metadata",
  );
export const DocumentPresignSchema = z.strictObject({
  case_id: z.uuid(),
  kind: metadata.refine((value) => /^[a-z][a-z0-9_]*$/.test(value)),
  // S3 POST interprets ${filename}; do not allow template substitution in keys.
  filename: metadata.refine(
    (value) =>
      !/[\x00-\x1f\x7f/\\]/.test(value) &&
      !value.includes("..") &&
      !value.includes("${"),
  ),
  mime: DocumentMimeSchema,
  identity: IdentityUploadSchema.optional(),
});
// General guidance from §6d, not a per-service acceptance policy. The client
// still has to confirm acceptable evidence for each flow (§8).
export const ID_PROOF_NOTICE =
  "Use only the identity documents accepted for this service. Aadhaar must be masked. Identity files are excluded from content extraction; no ID numbers are extracted or recorded. An uploaded document is not identity verification.";
