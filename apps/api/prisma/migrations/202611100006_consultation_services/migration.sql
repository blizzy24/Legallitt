-- Add/widen only: the previously deployed API can continue serving throughout.
ALTER TABLE case_price_quotes ALTER COLUMN pricing_id DROP NOT NULL;
ALTER TABLE case_price_quotes ADD COLUMN purpose text NOT NULL DEFAULT 'service_fee', ADD COLUMN court_quote_id uuid;
ALTER TABLE consultations ADD COLUMN advocate_id uuid REFERENCES users(id), ADD COLUMN client_id uuid REFERENCES users(id),
  ADD COLUMN policy_id uuid, ADD COLUMN availability_id uuid, ADD COLUMN reserved_until timestamptz,
  ADD COLUMN client_joined_at timestamptz, ADD COLUMN started_at timestamptz, ADD COLUMN ended_at timestamptz,
  ADD COLUMN revision integer NOT NULL DEFAULT 0;

CREATE TABLE consultation_policies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version integer NOT NULL UNIQUE,
  config jsonb NOT NULL, effective_from timestamptz NOT NULL DEFAULT now(), effective_to timestamptz
);
CREATE TABLE advocate_availability (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), advocate_id uuid NOT NULL REFERENCES users(id),
  version integer NOT NULL, timezone text NOT NULL, intervals jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(advocate_id,version)
);
ALTER TABLE consultations ADD CONSTRAINT consultations_policy_id_fkey FOREIGN KEY(policy_id) REFERENCES consultation_policies(id),
  ADD CONSTRAINT consultations_availability_id_fkey FOREIGN KEY(availability_id) REFERENCES advocate_availability(id);
CREATE INDEX consultations_advocate_time_idx ON consultations(advocate_id,scheduled_at);
CREATE INDEX consultations_client_time_idx ON consultations(client_id,scheduled_at);
-- Legacy rows may exist without the new policy; new workflows have one booking per case.
CREATE UNIQUE INDEX consultations_policy_case_unique ON consultations(case_id) WHERE policy_id IS NOT NULL;

CREATE TABLE consultation_workspaces (
  case_id uuid PRIMARY KEY REFERENCES cases(id), revision integer NOT NULL DEFAULT 0,
  current_report_id uuid, current_court_quote_id uuid, internal_notes text NOT NULL DEFAULT '',
  consultation_approved_at timestamptz, updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE court_quotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id), version integer NOT NULL,
  advocate_id uuid NOT NULL REFERENCES users(id), base_amount_paise bigint NOT NULL CHECK(base_amount_paise>0),
  scope text NOT NULL, exclusions text NOT NULL, fee_policy_id uuid NOT NULL REFERENCES fee_policies(id),
  commission_rate_id uuid NOT NULL REFERENCES commission_rates(id), gst_bps integer NOT NULL,
  expires_at timestamptz NOT NULL, status text NOT NULL DEFAULT 'offered' CHECK(status IN ('offered','superseded','paid')),
  supersedes_id uuid REFERENCES court_quotes(id), accepted_at timestamptz, payment_id uuid REFERENCES payments(id),
  created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(case_id,version)
);
CREATE TABLE consultation_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id),
  kind text NOT NULL CHECK(kind IN ('consultation','completion')), version integer NOT NULL,
  advocate_id uuid NOT NULL REFERENCES users(id), content jsonb NOT NULL, filing_snapshot jsonb NOT NULL,
  document_id uuid REFERENCES documents(id), status text NOT NULL DEFAULT 'draft' CHECK(status IN ('draft','submitted','returned','approved')),
  supersedes_id uuid REFERENCES consultation_reports(id), submitted_at timestamptz, reviewed_at timestamptz,
  reviewed_by uuid REFERENCES users(id), reason text, created_at timestamptz NOT NULL DEFAULT now(), UNIQUE(case_id,version)
);
CREATE UNIQUE INDEX consultation_reports_one_pending ON consultation_reports(case_id) WHERE status='submitted';
CREATE TABLE court_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id), advocate_id uuid NOT NULL REFERENCES users(id),
  stage text NOT NULL CHECK(stage IN ('preparation','filed','hearing','decision')), "update" text NOT NULL,
  court text, case_number text, next_hearing timestamptz, document_ids uuid[] NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX court_progress_case_id_created_at_idx ON court_progress(case_id,created_at);
ALTER TABLE consultation_workspaces ADD CONSTRAINT consultation_workspace_report_fkey FOREIGN KEY(current_report_id) REFERENCES consultation_reports(id),
  ADD CONSTRAINT consultation_workspace_quote_fkey FOREIGN KEY(current_court_quote_id) REFERENCES court_quotes(id);
ALTER TABLE case_price_quotes ADD CONSTRAINT case_price_quotes_court_quote_fkey FOREIGN KEY(court_quote_id) REFERENCES court_quotes(id);

INSERT INTO consultation_policies(version,config,effective_from) VALUES(1,
  '{"version":1,"timezone":"Asia/Kolkata","duration_min":30,"booking_horizon_days":28,"minimum_notice_minutes":30,"hold_minutes":10,"reschedule_notice_minutes":0,"quote_valid_days":7,"completing_advocate_receives_all":true,"channel":"chat"}',
  '2026-11-10T00:00:00Z');
