-- D-35, D-76..D-79: advocate verification submissions. Additive; the running
-- image never reads this table. Status stays in advocate_profiles.verification.
CREATE TABLE "advocate_verifications" (
  "user_id" UUID NOT NULL REFERENCES "users"("id"),
  "details" JSONB NOT NULL DEFAULT '{}',
  "submitted_at" TIMESTAMPTZ(6),
  "decided_at" TIMESTAMPTZ(6),
  "decided_by" UUID REFERENCES "users"("id"),
  "decision" TEXT,
  "decision_reason" TEXT,
  "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT now(),
  CONSTRAINT "advocate_verifications_pkey" PRIMARY KEY ("user_id")
);
CREATE INDEX "advocate_verifications_submitted_idx" ON "advocate_verifications" ("submitted_at");
