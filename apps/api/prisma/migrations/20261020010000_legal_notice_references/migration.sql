-- Atomic reference allocation; sequence gaps after rollback are intentional.
-- Minimum four digits, globally increasing across years (no annual reset).
CREATE SEQUENCE legal_notice_reference_seq AS BIGINT START WITH 1;
