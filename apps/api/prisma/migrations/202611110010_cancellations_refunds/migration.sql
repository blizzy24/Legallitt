-- D-12/D-13: additive only; safe for the running image (it never reads these tables).
-- Rows belong to their case: they cascade with it (test teardown and the pre-authorised
-- development cleanup), and never block deleting a user's case history.
CREATE TABLE "cancellation_requests" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL REFERENCES "cases"("id") ON DELETE CASCADE,
  "client_id" UUID NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "mode" TEXT NOT NULL CHECK ("mode" IN ('self_serve','admin_review')),
  "reason" TEXT,
  "note" TEXT,
  "status" TEXT NOT NULL CHECK ("status" IN ('pending','approved','declined','completed')),
  "status_at_request" TEXT NOT NULL,
  "refundable_paise" BIGINT NOT NULL CHECK ("refundable_paise" >= 0),
  "refund_amount_paise" BIGINT CHECK ("refund_amount_paise" >= 0),
  "advocate_entitlement_paise" BIGINT CHECK ("advocate_entitlement_paise" >= 0),
  "decision_reason" TEXT,
  "decided_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "requested_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  "decided_at" TIMESTAMPTZ(6),
  CONSTRAINT "cancellation_requests_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "cancellation_requests_status_requested_at_idx" ON "cancellation_requests"("status","requested_at");
CREATE INDEX "cancellation_requests_case_id_idx" ON "cancellation_requests"("case_id");
-- At most one open request per case.
CREATE UNIQUE INDEX "cancellation_requests_one_pending" ON "cancellation_requests"("case_id") WHERE "status" = 'pending';

CREATE TABLE "refunds" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL REFERENCES "cases"("id") ON DELETE CASCADE,
  "payment_id" UUID NOT NULL REFERENCES "payments"("id") ON DELETE CASCADE,
  "cancellation_request_id" UUID REFERENCES "cancellation_requests"("id") ON DELETE CASCADE,
  "amount_paise" BIGINT NOT NULL CHECK ("amount_paise" > 0),
  "reason" TEXT NOT NULL,
  "decided_by" UUID REFERENCES "users"("id") ON DELETE SET NULL,
  "status" TEXT NOT NULL DEFAULT 'recorded',
  "simulated" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "refunds_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "refunds_case_id_idx" ON "refunds"("case_id");
CREATE INDEX "refunds_payment_id_idx" ON "refunds"("payment_id");
