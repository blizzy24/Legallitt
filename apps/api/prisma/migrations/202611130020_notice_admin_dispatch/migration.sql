-- Additive workflow storage. Old amounts and document bytes are never rewritten.
BEGIN;
CREATE TABLE IF NOT EXISTS notice_workflow_policies (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), version integer NOT NULL UNIQUE,
 config jsonb NOT NULL, effective_from timestamptz NOT NULL DEFAULT now()
);
INSERT INTO notice_workflow_policies(version,config) VALUES (1,
 '{"delivery_recipient":"platform","retry_courier_paise":"17900","turnaround_days":{"urgent":5,"ordinary":10},"deadline_alert_hours":12,"client_reminder_hours":[24,72],"client_idle_admin_hours":168,"change_round_alert":3,"esign_mode":"test","whatsapp_mode":"manual","email_mode":"ses"}') ON CONFLICT(version) DO NOTHING;
CREATE TABLE IF NOT EXISTS notice_lifecycles (
 case_id uuid PRIMARY KEY REFERENCES cases(id), policy_id uuid NOT NULL REFERENCES notice_workflow_policies(id),
 revision integer NOT NULL DEFAULT 0 CHECK(revision >= 0), approved_draft_id uuid REFERENCES drafts(id),
 approved_document_id uuid REFERENCES documents(id), handed_to_admin_at timestamptz,
 address_checked_at timestamptz, notice_checked_at timestamptz, test_esigned_at timestamptz,
 deadline_at timestamptz, contacts jsonb NOT NULL DEFAULT '{}'
);
CREATE TABLE IF NOT EXISTS notice_deliveries (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), case_id uuid NOT NULL REFERENCES cases(id),
 method text NOT NULL CHECK(method IN ('courier','email','whatsapp')), attempt integer NOT NULL CHECK(attempt > 0),
 status text NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','sending','sent','delivered','failed','unknown')),
 recipient jsonb NOT NULL, document_id uuid REFERENCES documents(id), carrier text, waybill text, dispatch_date date,
 receipt_document_id uuid REFERENCES documents(id), provider_message_id text, source text NOT NULL DEFAULT 'manual',
 sent_at timestamptz, delivered_at timestamptz, received_by text, proof_document_id uuid REFERENCES documents(id),
 failure_reason text, retry_payment_id uuid REFERENCES payments(id), created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(case_id,method,attempt)
);
CREATE INDEX IF NOT EXISTS notice_deliveries_case_id_status_idx ON notice_deliveries(case_id,status);
CREATE TABLE IF NOT EXISTS notice_delivery_events (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), delivery_id uuid NOT NULL REFERENCES notice_deliveries(id),
 actor_id uuid REFERENCES users(id), occurred_at timestamptz NOT NULL, place text, text text NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS notice_delivery_events_delivery_id_occurred_at_idx ON notice_delivery_events(delivery_id,occurred_at);

-- An approved old case has already been approved by its client. Preserve that
-- decision and final PDF. In-flight courier work does not go backwards to checks.
INSERT INTO notice_lifecycles(case_id,policy_id,approved_draft_id,approved_document_id,handed_to_admin_at,contacts)
 SELECT c.id,p.id,(SELECT d.id FROM drafts d WHERE d.case_id=c.id AND d.kind='legal_notice' ORDER BY d.version DESC LIMIT 1),
 c.notice_document_id,c.updated_at,jsonb_build_object('methods',jsonb_build_array('courier'),'address',c.details->'noticee'->>'address','fullName',c.details->'noticee'->>'fullName')
 FROM cases c CROSS JOIN notice_workflow_policies p
 WHERE p.version=1 AND c.service_code='legal_notice' AND c.status IN ('approved','dispatching','dispatched','completed') ON CONFLICT(case_id) DO NOTHING;
INSERT INTO notice_deliveries(case_id,method,attempt,status,recipient,document_id,carrier,waybill,dispatch_date,receipt_document_id,sent_at,delivered_at,received_by,proof_document_id,source)
 SELECT c.id,'courier',1,CASE WHEN c.status='completed' THEN 'delivered' ELSE 'sent' END,l.contacts,c.notice_document_id,
 s.carrier,s.waybill,s.dispatch_date,s.receipt_document_id,s.dispatched_at,s.delivered_at,s.received_by,s.pod_document_id,
 CASE WHEN s.simulated THEN 'simulated' ELSE 'manual' END
 FROM cases c JOIN notice_lifecycles l ON l.case_id=c.id
 LEFT JOIN LATERAL (SELECT * FROM shipments WHERE case_id=c.id AND direction='to_recipient' ORDER BY booked_at DESC LIMIT 1) s ON true
 WHERE c.status IN ('dispatched','completed') ON CONFLICT(case_id,method,attempt) DO NOTHING;
INSERT INTO case_events(case_id,type,source,actor_role,from_status,to_status,payload)
 SELECT id,'notice_admin_workflow_migrated','real',NULL,status,status,
 jsonb_build_object('previous_sub_status',sub_status,'preserved_document_id',notice_document_id)
 FROM cases WHERE service_code='legal_notice' AND status IN ('approved','dispatching','dispatched');
UPDATE cases SET sub_status=CASE WHEN status='dispatched' THEN 'notice_delivery_in_progress' ELSE 'notice_admin_address_check' END
 WHERE service_code='legal_notice' AND status IN ('approved','dispatching','dispatched');
COMMIT;
