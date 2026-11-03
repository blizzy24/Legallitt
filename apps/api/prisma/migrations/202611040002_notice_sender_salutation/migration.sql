-- Owner instruction, 4 November 2026: the sender introduction carries an optional
-- salutation and parentage relation. The father's-name column widens to a father's
-- or husband's name. Existing rows keep their name and get no relation, so the
-- notice omits "S/o Shri …" until one is chosen rather than guessing it.
ALTER TABLE case_parties RENAME COLUMN father_name TO relative_name;
ALTER TABLE case_parties
  ADD COLUMN salutation TEXT CHECK (salutation IN ('Mr.', 'Mrs.', 'Ms.')),
  ADD COLUMN relation TEXT CHECK (relation IN ('S/o', 'D/o', 'W/o'));
