-- Widen only. A draft can be saved before its requested slot is selected.
ALTER TABLE legal_advice_bookings ALTER COLUMN requested_at DROP NOT NULL;
