-- New representation requests only. Existing consultation cases/prices are untouched.
CREATE SEQUENCE court_district_reference_seq;
CREATE SEQUENCE court_high_reference_seq;
CREATE TABLE court_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), service_code text NOT NULL REFERENCES services(code),
 version integer NOT NULL, config jsonb NOT NULL, source_note text NOT NULL,
 created_by uuid REFERENCES users(id), effective_from timestamptz NOT NULL DEFAULT now(),
 UNIQUE(service_code,version)
);
CREATE TABLE court_workspaces (
 case_id uuid PRIMARY KEY REFERENCES cases(id), policy_id uuid NOT NULL REFERENCES court_policies(id),
 revision integer NOT NULL DEFAULT 0, data jsonb NOT NULL, private_notes jsonb NOT NULL DEFAULT '{}',
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE court_hearing_rates (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), service_code text NOT NULL REFERENCES services(code),
 kind text NOT NULL CHECK(kind IN ('effective','passive')), version integer NOT NULL,
 amount_paise bigint CHECK(amount_paise >= 0), created_by uuid REFERENCES users(id),
 effective_from timestamptz NOT NULL DEFAULT now(), UNIQUE(service_code,kind,version)
);
CREATE TABLE court_hearings (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id),
 advocate_id uuid NOT NULL REFERENCES users(id), at timestamptz NOT NULL,
 court text NOT NULL, room text NOT NULL, bench text NOT NULL, judge text,
 note text NOT NULL DEFAULT '', started_at timestamptz, update jsonb,
 private_note text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(),
 created_by uuid NOT NULL REFERENCES users(id)
);
CREATE INDEX court_hearings_case_date ON court_hearings(case_id,at);
CREATE TABLE court_hearing_credits (
 hearing_id uuid PRIMARY KEY REFERENCES court_hearings(id), case_id uuid NOT NULL REFERENCES cases(id),
 advocate_id uuid NOT NULL REFERENCES users(id), kind text NOT NULL CHECK(kind IN ('effective','passive')),
 rate_id uuid NOT NULL REFERENCES court_hearing_rates(id), amount_paise bigint NOT NULL CHECK(amount_paise >= 0),
 classified_by uuid NOT NULL REFERENCES users(id), classified_at timestamptz NOT NULL DEFAULT now(),
 reason text NOT NULL
);
CREATE INDEX court_hearing_credits_advocate ON court_hearing_credits(advocate_id,classified_at);
