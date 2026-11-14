-- Add-only: existing consultation rows, tariffs and case membership are untouched.
CREATE TABLE legal_advice_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version integer NOT NULL UNIQUE,
 config jsonb NOT NULL, reason text NOT NULL, created_by uuid REFERENCES users(id),
 effective_from timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE legal_advice_bookings (
 case_id uuid PRIMARY KEY REFERENCES cases(id), policy_id uuid NOT NULL REFERENCES legal_advice_policies(id),
 revision integer NOT NULL DEFAULT 0, mode text NOT NULL CHECK(mode IN ('chat','audio','video')),
 tier_code text NOT NULL, chosen_advocate_id uuid NOT NULL REFERENCES users(id),
 accepted_advocate_id uuid REFERENCES users(id), accepted_at timestamptz,
 requested_at timestamptz NOT NULL, confirmed_at timestamptz,
 phase text NOT NULL DEFAULT 'draft', pricing_snapshot jsonb,
 session jsonb NOT NULL DEFAULT '{}', private_notes jsonb NOT NULL DEFAULT '{}',
 follow_up_of uuid REFERENCES legal_advice_bookings(case_id), reschedule_count integer NOT NULL DEFAULT 0 CHECK(reschedule_count>=0),
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK ((accepted_advocate_id IS NULL) = (accepted_at IS NULL))
);
CREATE TABLE legal_advice_invitations (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES legal_advice_bookings(case_id),
 advocate_id uuid NOT NULL REFERENCES users(id), assigned_by uuid NOT NULL REFERENCES users(id),
 state text NOT NULL DEFAULT 'pending' CHECK(state IN ('pending','accepted','declined','expired','superseded')),
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), decided_at timestamptz,
 reason text
);
CREATE UNIQUE INDEX legal_advice_one_pending_invitation ON legal_advice_invitations(case_id,advocate_id) WHERE state='pending';
CREATE UNIQUE INDEX legal_advice_one_winner ON legal_advice_invitations(case_id) WHERE state='accepted';
CREATE INDEX legal_advice_invitation_inbox ON legal_advice_invitations(advocate_id,state,expires_at);
CREATE TABLE legal_advice_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES legal_advice_bookings(case_id),
 actor_id uuid REFERENCES users(id), kind text NOT NULL, visibility text NOT NULL CHECK(visibility IN ('public','internal')),
 data jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX legal_advice_events_case ON legal_advice_events(case_id,created_at);
