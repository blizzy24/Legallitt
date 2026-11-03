-- No retroactive deadline is imposed on existing notices or other services.
ALTER TABLE cases ADD COLUMN compliance_period_days INTEGER
  CHECK (compliance_period_days IS NULL OR compliance_period_days > 0);
ALTER TABLE drafts ADD COLUMN compliance_period_days INTEGER
  CHECK (compliance_period_days IS NULL OR compliance_period_days > 0);
ALTER TABLE drafts ADD COLUMN closing_policy JSONB;
-- Existing client settings always win; absent keys use the documented defaults.
UPDATE services SET config = jsonb_set(config, '{notice_policy}',
  '{"default_compliance_period_days":15,"criminal_clause":"when_offences"}'::jsonb
  || COALESCE(config->'notice_policy', '{}'::jsonb)) WHERE code = 'legal_notice';
