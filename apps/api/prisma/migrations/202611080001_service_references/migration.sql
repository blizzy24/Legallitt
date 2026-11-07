-- Additive: keep the existing Legal Notice sequence and its current value.
-- Independent allocation per service; gaps after rollback are intentional.
DO $$
DECLARE service_code text;
BEGIN
  FOREACH service_code IN ARRAY ARRAY[
    'fir_draft', 'legal_advice', 'property_search', 'document_forensic',
    'high_court', 'district_court', 'court_marriage', 'courier'
  ] LOOP
    EXECUTE format('CREATE SEQUENCE %I AS BIGINT START WITH 1', service_code || '_reference_seq');
  END LOOP;
END $$;
