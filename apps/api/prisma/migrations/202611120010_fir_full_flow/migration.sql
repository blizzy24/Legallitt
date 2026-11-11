-- FIR Draft full flow (docs/flows/FIR-DRAFT-FLOW.md §4). Additive only: new
-- tables plus nullable or defaulted columns, so the running image keeps working.

-- Upload slots: a client-named custom slot, and the last four digits of an
-- identity document (the only digits ever stored; shown as XXXX-XXXX-1234).
ALTER TABLE "documents" ADD COLUMN "slot_label" TEXT;
ALTER TABLE "documents" ADD COLUMN "identity_last4" TEXT CHECK ("identity_last4" ~ '^[0-9]{4}$');

-- Draft versions record whether AI was used (always false until D-08).
ALTER TABLE "drafts" ADD COLUMN "ai_used" BOOLEAN NOT NULL DEFAULT false;

-- Reviews by admin and client: the client's selected sections and one optional attachment.
ALTER TABLE "draft_reviews" ADD COLUMN "reviewer_role" TEXT;
ALTER TABLE "draft_reviews" ADD COLUMN "sections" TEXT[] NOT NULL DEFAULT '{}';
ALTER TABLE "draft_reviews" ADD COLUMN "attachment_document_id" UUID REFERENCES "documents"("id");

-- Support requests raised from a service screen (Request Chat / Request Callback).
ALTER TABLE "support_tickets" ADD COLUMN "service_code" TEXT;

-- C14: the advocate's police submission, with the police receipt or acknowledgement.
CREATE TABLE "fir_police_submissions" (
  "case_id" UUID PRIMARY KEY REFERENCES "cases"("id") ON DELETE CASCADE,
  "submitted_on" DATE NOT NULL,
  "receipt_document_id" UUID NOT NULL REFERENCES "documents"("id"),
  "marked_by" UUID NOT NULL REFERENCES "users"("id"),
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);

-- One switch for who takes the approved draft to the police (C14). On: the
-- advocate submits and uploads the receipt. Off: the client submits it.
CREATE TABLE "fir_settings" (
  "id" INTEGER PRIMARY KEY DEFAULT 1 CHECK ("id" = 1),
  "police_submission_by_advocate" BOOLEAN NOT NULL DEFAULT true,
  "updated_by" UUID REFERENCES "users"("id"),
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);
INSERT INTO "fir_settings" ("id") VALUES (1) ON CONFLICT DO NOTHING;
