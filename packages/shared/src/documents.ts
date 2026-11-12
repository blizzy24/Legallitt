import { z } from "zod";
import {IdentityUploadSchema} from './fir-identity';

export const DOCUMENT_MAX_BYTES = 25_000_000;
export const DOCUMENT_URL_SECONDS = 300;
// FIR Scene Photos & Video accepts MP4 up to 50 MB; Ancillary Records accepts MP3
// audio (flow C6). Other services still take PDF and images only (see presign).
export const DOCUMENT_MEDIA_MAX_BYTES = 50_000_000;
export const DocumentMimeSchema = z.enum([
  "application/pdf",
  "image/jpeg",
  "image/png",
  "video/mp4",
  "audio/mpeg",
]);
export const MEDIA_MIMES: readonly string[] = ["video/mp4", "audio/mpeg"];
// Design 45: the Scene Photos & Video slot takes JPEG, PNG and MP4 up to 50 MB each.
export const documentMaxBytes = (mime: string | undefined, kind?: string) =>
  mime === "video/mp4" || kind === "fir_scene" ? DOCUMENT_MEDIA_MAX_BYTES : DOCUMENT_MAX_BYTES;
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
  // Kept for compatibility only: FIR no longer collects identity documents (Q114),
  // so the API refuses both fields on every upload. Never required.
  identity: IdentityUploadSchema.optional(),
  identity_last4: z.string().regex(/^\d{4}$/, "Enter the last four digits").optional(),
  // FIR only: the client's name for a custom upload slot.
  slot_label: metadata.refine((value) => value.length <= 60, "Use up to 60 characters").optional(),
});
// General guidance from §6d, not a per-service acceptance policy. The client
// still has to confirm acceptable evidence for each flow (§8).
export const ID_PROOF_NOTICE =
  "Use only the identity documents accepted for this service. Aadhaar must be masked. Identity files are excluded from content extraction; no ID numbers are extracted or recorded. An uploaded document is not identity verification.";
