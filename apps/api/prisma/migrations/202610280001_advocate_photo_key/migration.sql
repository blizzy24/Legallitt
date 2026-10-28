-- The advocate's portrait. A bundled asset name today (advocate-05); an S3 key
-- once advocates upload their own. Same column either way, so no later migration.
ALTER TABLE advocate_profiles ADD COLUMN photo_key TEXT;
