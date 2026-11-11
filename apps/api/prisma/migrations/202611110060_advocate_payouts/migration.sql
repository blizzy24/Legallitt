-- D-36/D-80..D-83: advocate bank account (stored for manual payment by Legalitt,
-- shown masked to the advocate, unverified) and payout requests settled outside
-- the app with a UTR recorded by an admin. Additive only; no money moves.
CREATE TABLE "advocate_bank_accounts" (
  "advocate_id" UUID PRIMARY KEY REFERENCES "users"("id"),
  "holder_name" TEXT NOT NULL,
  "bank_name" TEXT NOT NULL,
  "ifsc" TEXT NOT NULL,
  "account_number" TEXT NOT NULL,
  "account_type" TEXT,
  "verified" BOOLEAN NOT NULL DEFAULT false,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now()
);
CREATE TABLE "payout_requests" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "advocate_id" UUID NOT NULL REFERENCES "users"("id"),
  "amount_paise" BIGINT NOT NULL CHECK ("amount_paise" > 0),
  "status" TEXT NOT NULL DEFAULT 'pending',
  "bank_snapshot" JSONB NOT NULL,
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "utr" TEXT,
  "paid_on" DATE,
  "paid_by" UUID REFERENCES "users"("id"),
  "paid_at" TIMESTAMPTZ(6)
);
CREATE INDEX "payout_requests_status_requested_idx" ON "payout_requests" ("status", "requested_at");
CREATE INDEX "payout_requests_advocate_idx" ON "payout_requests" ("advocate_id", "requested_at");
