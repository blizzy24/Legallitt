-- Additive: the old API can continue serving throughout migrate-before-deploy.
CREATE TABLE report_workflow_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), service_code TEXT NOT NULL,
  version INTEGER NOT NULL CHECK (version > 0), config JSONB NOT NULL,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (service_code, version)
);
CREATE TABLE report_workflows (
  case_id UUID PRIMARY KEY REFERENCES cases(id),
  policy_id UUID NOT NULL REFERENCES report_workflow_policies(id),
  revision INTEGER NOT NULL DEFAULT 0 CHECK (revision >= 0),
  data JSONB NOT NULL DEFAULT '{}'
);
INSERT INTO report_workflow_policies(service_code,version,config) VALUES
('property_search',1,'{"turnaround":{"ordinary":{"min":3,"max":5,"unit":"working_days"},"urgent":{"min":1,"max":2,"unit":"working_days"}},"chat_days_after_delivery":7,"chat_reopen_days":7,"followup_hours":48,"admin_review_hours":4,"max_upload_bytes":25000000,"working_weekdays":[1,2,3,4,5],"timezone":"Asia/Kolkata"}'),
('document_forensic',1,'{"turnaround":{"ordinary":{"min":3,"max":5,"unit":"working_days"},"urgent":{"min":24,"max":48,"unit":"hours"}},"chat_days_after_delivery":7,"chat_reopen_days":7,"followup_hours":48,"admin_review_hours":4,"max_upload_bytes":25000000,"working_weekdays":[1,2,3,4,5],"timezone":"Asia/Kolkata"}');

-- Map existing cases without rewriting prices, evidence, signatures or statuses.
-- Existing assignments already passed the former intake/assignment route. Preserve
-- that fact; do not claim a human ticked the newly introduced forensic checklist.
INSERT INTO report_workflows(case_id,policy_id,data)
SELECT c.id,p.id,jsonb_build_object(
 'legacy',true,'original_details',c.details,'tasks','[]'::jsonb,
 'phase',CASE
   WHEN c.status='completed' THEN 'delivered'
   WHEN c.sub_status='awaiting_admin_approval' THEN 'admin_review'
   WHEN c.sub_status='admin_changes_requested' THEN 'waiting'
   WHEN c.status IN ('advocate_accepted','in_progress','changes_requested','approved','dispatching','dispatched')
     THEN CASE WHEN c.service_code='document_forensic' THEN 'waiting' ELSE 'preparing' END
   WHEN c.advocate_id IS NOT NULL THEN 'assigned'
   WHEN c.status IN ('paid','assigning','advocate_declined') THEN 'verification'
   ELSE 'intake' END,
 'verification',CASE WHEN c.advocate_id IS NOT NULL OR c.status='completed'
   THEN jsonb_build_object('source','legacy_assignment','at',COALESCE(
     (SELECT min(e.created_at) FROM case_events e WHERE e.case_id=c.id AND e.to_status='assigned'),c.updated_at)) ELSE NULL END,
 'legacy_pending_submission',c.sub_status='awaiting_admin_approval'
) FROM cases c JOIN report_workflow_policies p ON p.service_code=c.service_code AND p.version=1;
