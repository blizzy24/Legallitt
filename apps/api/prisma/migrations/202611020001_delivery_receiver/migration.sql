-- Actual receiver differs from the intended noticee stored in recipient JSON.
-- Leave historical unknown receivers NULL; never backfill from the noticee.
ALTER TABLE shipments ADD COLUMN received_by TEXT;
