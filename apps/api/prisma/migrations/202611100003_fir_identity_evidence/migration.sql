-- Additive: old API ignores the new nullable metadata and configuration key.
-- This stores declarations only, never extracted identity numbers/content.
ALTER TABLE "documents" ADD COLUMN "identity_evidence" JSONB;
UPDATE "services"
SET "config" = jsonb_set("config", '{fir_identity_policy}', '{"version":1,"required":true,"accepted_documents":[{"code":"masked_aadhaar","label":"Masked Aadhaar","requires_masking":true},{"code":"passport","label":"Passport","requires_masking":false},{"code":"voter_id","label":"Voter ID","requires_masking":false},{"code":"driving_licence","label":"Driving licence","requires_masking":false}]}')
WHERE "code" = 'fir_draft' AND NOT ("config" ? 'fir_identity_policy');
