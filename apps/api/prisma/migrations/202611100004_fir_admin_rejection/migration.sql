-- Additive tables. Old API can continue serving until the new image is deployed.
CREATE TABLE fir_policies (id UUID PRIMARY KEY DEFAULT gen_random_uuid(), version INTEGER NOT NULL UNIQUE,
 config JSONB NOT NULL, effective_from TIMESTAMPTZ NOT NULL DEFAULT now());
INSERT INTO fir_policies(version,config) VALUES (1,'{"reassign_after_draft_rejections":2,"turnaround_warning_hours":24,"turnaround_overdue_hours":48,"payout_allocation":"completing_assignment_only","replaced_advocate_share_bps":0}');
CREATE TABLE fir_lifecycles (case_id UUID PRIMARY KEY REFERENCES cases(id) ON DELETE CASCADE,
 revision INTEGER NOT NULL DEFAULT 0,current_submission_id UUID,policy_id UUID NOT NULL REFERENCES fir_policies(id),paid_at TIMESTAMPTZ,
 completing_assignment_id UUID,advocate_entitlement_paise BIGINT,commission_rate_id UUID);
CREATE TABLE case_assignments (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
 advocate_id UUID NOT NULL,assigned_by UUID,assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),ended_at TIMESTAMPTZ,end_reason TEXT);
CREATE INDEX case_assignments_case_id_assigned_at_idx ON case_assignments(case_id,assigned_at);
CREATE UNIQUE INDEX case_assignments_one_current ON case_assignments(case_id) WHERE ended_at IS NULL;
CREATE TABLE fir_submissions (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
 assignment_id UUID NOT NULL REFERENCES case_assignments(id) ON DELETE CASCADE,draft_id UUID NOT NULL UNIQUE,version INTEGER NOT NULL,
 document_id UUID NOT NULL,identity_document_id UUID,identity_checked_by UUID,identity_checked_at TIMESTAMPTZ,
 supersedes_submission_id UUID UNIQUE,state TEXT NOT NULL DEFAULT 'pending',draft_reason TEXT,decided_by UUID,decided_at TIMESTAMPTZ,
 submitted_at TIMESTAMPTZ NOT NULL DEFAULT now(),CHECK(state IN ('pending','returned','withdrawn','approved')));
CREATE INDEX fir_submissions_case_id_submitted_at_idx ON fir_submissions(case_id,submitted_at);
CREATE UNIQUE INDEX fir_submissions_one_pending ON fir_submissions(case_id) WHERE state='pending';
CREATE TABLE fir_identity_returns (id UUID PRIMARY KEY DEFAULT gen_random_uuid(),case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
 submission_id UUID NOT NULL,document_id UUID NOT NULL UNIQUE,rejected_by UUID NOT NULL,rejected_at TIMESTAMPTZ NOT NULL DEFAULT now(),reason TEXT NOT NULL DEFAULT 'unmasked_aadhaar',
 replacement_document_id UUID,state TEXT NOT NULL DEFAULT 'replacement_required',reviewed_by UUID,reviewed_at TIMESTAMPTZ,
 purge_status TEXT NOT NULL DEFAULT 'pending',purge_after TIMESTAMPTZ NOT NULL,purge_attempted_at TIMESTAMPTZ);
CREATE INDEX fir_identity_returns_case_id_state_idx ON fir_identity_returns(case_id,state);
-- Existing history is imported by the new API under the case lock, so actions
-- performed by the old image during rollout are not missed. Completed PDFs and
-- decisions are retained verbatim; there is no data rewrite or deletion here.
