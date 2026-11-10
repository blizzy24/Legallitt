-- Additive optional fields from hearing-update design 425; old images remain safe.
ALTER TABLE court_progress
  ADD COLUMN hearing_at timestamptz(6),
  ADD COLUMN court_room text,
  ADD COLUMN next_steps text;
