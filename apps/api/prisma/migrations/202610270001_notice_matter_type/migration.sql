-- v5.4: chosen matter type is case data, independent of service code.
ALTER TABLE cases ADD COLUMN matter_type TEXT;
-- Preserve existing explicit selections. Do not infer from titles or draft prose.
UPDATE cases SET matter_type = replace(details->>'issueType', '-', '_')
WHERE service_code = 'legal_notice'
  AND details->>'issueType' IN ('property-dispute', 'money-recovery', 'tenant-issue',
    'family-dispute', 'cheque-bounce', 'consumer-complaint', 'other');
ALTER TABLE cases ADD CONSTRAINT legal_notice_matter_type_valid CHECK (
  service_code <> 'legal_notice' OR matter_type IS NULL OR matter_type IN (
    'property_dispute', 'money_recovery', 'tenant_issue', 'family_dispute',
    'cheque_bounce', 'consumer_complaint', 'other'
  )
);
