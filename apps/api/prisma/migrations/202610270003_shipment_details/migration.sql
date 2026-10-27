ALTER TABLE shipments ALTER COLUMN status SET DEFAULT 'draft';
ALTER TABLE shipments
  ADD COLUMN dispatch_date DATE,
  ADD COLUMN courier_office TEXT,
  ADD COLUMN courier_phone TEXT,
  ADD COLUMN tracking_url TEXT,
  ADD COLUMN expected_delivery DATE,
  ADD COLUMN receipt_document_id UUID REFERENCES documents(id),
  ADD COLUMN dispatched_at TIMESTAMPTZ,
  ADD COLUMN simulated BOOLEAN NOT NULL DEFAULT false;
-- Historical human dates and dispatch times are unknown; do not invent a backfill.
