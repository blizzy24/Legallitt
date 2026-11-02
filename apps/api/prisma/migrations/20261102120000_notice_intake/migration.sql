-- Nullable additions preserve all existing cases. Demand selections and custom
-- prose occupy one dedicated JSONB column, never cases.details.
ALTER TABLE cases ADD COLUMN subject_matter TEXT,
  ADD COLUMN subject_line TEXT,
  ADD COLUMN legal_demand JSONB;
ALTER TABLE case_parties ADD COLUMN age INTEGER,
  ADD COLUMN father_name TEXT;
