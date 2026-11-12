BEGIN;
-- Paid legacy cases must participate in the deadline queue before anyone opens
-- their detail screen. No payment snapshot, entitlement or final PDF is changed.
INSERT INTO notice_lifecycles(case_id,policy_id,contacts)
 SELECT c.id,p.id,jsonb_strip_nulls(jsonb_build_object('methods',COALESCE(c.details->'noticee'->'methods','["courier"]'::jsonb),'fullName',c.details->'noticee'->>'fullName','address',c.details->'noticee'->>'address','pin',c.details->'noticee'->>'pin','email',c.details->'noticee'->>'email','whatsapp',c.details->'noticee'->>'whatsapp'))
 FROM cases c CROSS JOIN notice_workflow_policies p
 WHERE p.version=1 AND c.service_code='legal_notice' AND c.status IN ('paid','assigning','assigned','advocate_declined','advocate_accepted','in_progress','client_review','changes_requested')
 ON CONFLICT(case_id) DO NOTHING;
UPDATE notice_lifecycles l SET deadline_at=payment.paid_at+make_interval(days=>(p.config->'turnaround_days'->>CASE WHEN c.tier='urgent' THEN 'urgent' ELSE 'ordinary' END)::integer)
 FROM cases c,notice_workflow_policies p,(SELECT case_id,min(captured_at) AS paid_at FROM payments WHERE purpose='service_fee' AND status='captured' GROUP BY case_id) payment
 WHERE l.case_id=c.id AND l.policy_id=p.id AND payment.case_id=c.id AND l.deadline_at IS NULL;
-- Retain the original approval timestamp where an event is available.
UPDATE notice_lifecycles l SET handed_to_admin_at=approval.approved_at
 FROM (SELECT case_id,min(created_at) AS approved_at FROM case_events WHERE to_status='approved' AND from_status='client_review' GROUP BY case_id) approval
 WHERE l.case_id=approval.case_id AND l.handed_to_admin_at IS NOT NULL;
-- Old in-flight courier milestones remain visible in the new tracking view.
INSERT INTO notice_delivery_events(delivery_id,actor_id,occurred_at,text)
 SELECT d.id,e.actor_id,e.created_at,'Legacy courier update: '||replace(e.payload->>'to','_',' ')
 FROM notice_deliveries d JOIN case_events e ON e.case_id=d.case_id
 WHERE d.attempt=1 AND d.method='courier' AND e.type='shipment_status_changed' AND NULLIF(e.payload->>'to','') IS NOT NULL;
COMMIT;
