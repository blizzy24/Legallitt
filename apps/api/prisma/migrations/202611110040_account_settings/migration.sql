-- D-20, D-22, D-24, D-27: additive account settings. Safe for the running image.
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  language TEXT NOT NULL DEFAULT 'en',
  notifications JSONB NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE saved_advocates (
  user_id UUID NOT NULL REFERENCES users(id),
  advocate_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, advocate_id)
);
CREATE TABLE account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  reason TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ
);
CREATE UNIQUE INDEX account_deletion_requests_pending ON account_deletion_requests (user_id) WHERE status = 'pending';
