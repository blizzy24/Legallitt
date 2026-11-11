-- D-26 / D-42: support tickets, callbacks and support chat. Additive only.
CREATE TABLE support_tickets (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID NOT NULL REFERENCES users(id),
  kind           TEXT NOT NULL CHECK (kind IN ('ticket','callback','chat')),
  status         TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','closed')),
  subject        TEXT,
  related_to     TEXT,
  description    TEXT,
  contact_method TEXT,
  contact_name   TEXT,
  contact_phone  TEXT,
  case_id        UUID REFERENCES cases(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  closed_at      TIMESTAMPTZ,
  closed_by      UUID REFERENCES users(id)
);
CREATE INDEX support_tickets_status_created_idx ON support_tickets (status, created_at);
CREATE INDEX support_tickets_user_created_idx ON support_tickets (user_id, created_at);
CREATE TABLE support_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id    UUID NOT NULL REFERENCES support_tickets(id),
  sender_id    UUID NOT NULL REFERENCES users(id),
  sender_role  TEXT NOT NULL CHECK (sender_role IN ('client','advocate','admin')),
  body         TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at      TIMESTAMPTZ
);
CREATE INDEX support_messages_ticket_created_idx ON support_messages (ticket_id, created_at);
