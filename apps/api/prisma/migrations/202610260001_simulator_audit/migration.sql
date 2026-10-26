ALTER TABLE case_events ADD COLUMN source TEXT NOT NULL DEFAULT 'real';
ALTER TABLE payments ADD COLUMN payer_id UUID REFERENCES users(id);
UPDATE payments p SET payer_id = c.client_id FROM cases c WHERE c.id = p.case_id;
ALTER TABLE payments ALTER COLUMN payer_id SET NOT NULL;
ALTER TABLE payments ADD COLUMN simulated BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE notifications ADD COLUMN simulated BOOLEAN NOT NULL DEFAULT false;
CREATE TABLE auth_events (
 id BIGSERIAL PRIMARY KEY,
 user_id UUID REFERENCES users(id),
 identifier TEXT NOT NULL,
 event TEXT NOT NULL,
 simulated BOOLEAN NOT NULL DEFAULT false,
 ip INET,
 user_agent TEXT,
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX auth_events_identifier_created_at_idx ON auth_events(identifier, created_at DESC);
CREATE INDEX auth_events_user_id_created_at_idx ON auth_events(user_id, created_at DESC);
