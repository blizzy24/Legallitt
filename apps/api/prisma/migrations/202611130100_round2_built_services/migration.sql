-- Additive only. Do not activate new tariffs or workflow-policy units while the
-- old API still serves. seed-round2 runs after API/frontend rollout.
CREATE TABLE support_policies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  version INTEGER NOT NULL UNIQUE,
  config JSONB NOT NULL,
  source_note TEXT NOT NULL,
  created_by UUID,
  effective_from TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO support_policies(version,config,source_note) VALUES
(1,'{"weekdays":[1,2,3,4,5,6],"opens_at":"10:00","closes_at":"19:00","timezone":"Asia/Kolkata","callback_hours":24}',
 'Ishaan round 2, 13 November 2026: Mon–Sat 10 AM–7 PM; callback within 24 hours.');
