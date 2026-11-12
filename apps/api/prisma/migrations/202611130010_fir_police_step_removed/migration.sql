-- Q119, Q120 (docs/flows/ISHAAN-ANSWERS-2026-11-12.md): the FIR police-submission
-- step is removed. The advocate's work ends with the approved draft, and the
-- client's approval completes the case. FIR cases left waiting for the advocate's
-- police receipt (status 'approved', sub-status 'awaiting_police_submission')
-- complete now, each with one case_events row, in one statement.
--
-- Data only. fir_police_submissions and fir_settings stay (dormant, no longer
-- read or written), and every value written here is one the running image
-- already handles: a completed FIR case with a null sub-status.
WITH moved AS (
  UPDATE "cases"
  SET "status" = 'completed',
      "sub_status" = NULL,
      "completed_at" = COALESCE("completed_at", now()),
      "updated_at" = now()
  WHERE "service_code" = 'fir_draft'
    AND "status" = 'approved'
    AND "sub_status" = 'awaiting_police_submission'
  RETURNING "id"
)
INSERT INTO "case_events" ("case_id", "type", "actor_id", "actor_role", "from_status", "to_status", "payload")
SELECT "id", 'fir_completed_on_client_approval', NULL, NULL,
  'approved'::"case_status", 'completed'::"case_status",
  '{"reason":"police submission step removed (Q119, Q120)"}'::jsonb
FROM moved;
