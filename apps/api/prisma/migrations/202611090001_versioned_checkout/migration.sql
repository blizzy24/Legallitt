-- Additive only. Tariffs are activated by the repeatable seed AFTER API rollout.
CREATE TABLE "page_overage_policies" (
  "id" UUID PRIMARY KEY,
  "included_pages" INTEGER NOT NULL CHECK (included_pages >= 0),
  "unit_amount_paise" BIGINT NOT NULL CHECK (unit_amount_paise >= 0),
  "gst_bps" INTEGER NOT NULL CHECK (gst_bps >= 0),
  "aggregation" TEXT NOT NULL,
  "page_basis" TEXT NOT NULL,
  "revenue_recipient" TEXT NOT NULL,
  "confirmed" BOOLEAN NOT NULL,
  "source_note" TEXT NOT NULL,
  "effective_from" TIMESTAMPTZ NOT NULL,
  "effective_to" TIMESTAMPTZ,
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);
CREATE TABLE "fee_policies" (
  "id" UUID PRIMARY KEY,
  "service_code" TEXT NOT NULL REFERENCES services(code),
  "pricing_mode" TEXT NOT NULL,
  "base_represents" TEXT NOT NULL,
  "platform_calculation" TEXT NOT NULL,
  "gst_basis" TEXT NOT NULL,
  "delivery_recipient" TEXT NOT NULL,
  "rounding" TEXT NOT NULL,
  "delivery_pricing_id" UUID REFERENCES service_pricing(id),
  "page_overage_policy_id" UUID NOT NULL REFERENCES page_overage_policies(id),
  "confirmed" BOOLEAN NOT NULL,
  "source_note" TEXT NOT NULL,
  "effective_from" TIMESTAMPTZ NOT NULL,
  "effective_to" TIMESTAMPTZ,
  CHECK (effective_to IS NULL OR effective_to > effective_from)
);
CREATE INDEX "fee_policies_service_code_effective_from_idx" ON fee_policies(service_code, effective_from);
ALTER TABLE service_pricing ADD COLUMN duration_minutes INTEGER CHECK (duration_minutes > 0);
ALTER TABLE service_pricing ADD COLUMN fee_policy_id UUID REFERENCES fee_policies(id);
CREATE TABLE "case_price_quotes" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "case_id" UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  "pricing_id" UUID NOT NULL REFERENCES service_pricing(id),
  "commission_rate_id" UUID REFERENCES commission_rates(id),
  "fee_policy_id" UUID REFERENCES fee_policies(id),
  "delivery_pricing_id" UUID REFERENCES service_pricing(id),
  "page_overage_policy_id" UUID REFERENCES page_overage_policies(id),
  "document_fingerprint" TEXT NOT NULL,
  "snapshot" JSONB NOT NULL,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "case_price_quotes_case_id_created_at_idx" ON case_price_quotes(case_id, created_at);
ALTER TABLE payments ADD COLUMN quote_id UUID UNIQUE REFERENCES case_price_quotes(id);

-- Financial facts are never edited in place. New versions are new rows.
CREATE FUNCTION reject_quote_update() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Checkout quotes are immutable; create a new version'; END $$;
CREATE TRIGGER immutable_checkout_quote BEFORE UPDATE ON case_price_quotes
FOR EACH ROW EXECUTE FUNCTION reject_quote_update();
