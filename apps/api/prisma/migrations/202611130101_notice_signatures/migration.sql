-- Additive: the previous API continues to use existing notice lifecycle fields.
CREATE TABLE advocate_signatures (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 advocate_id UUID NOT NULL REFERENCES users(id),
 document_id UUID NOT NULL REFERENCES documents(id),
 created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX advocate_signatures_owner_time ON advocate_signatures(advocate_id,created_at);
CREATE TABLE notice_signatures (
 id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
 case_id UUID NOT NULL REFERENCES cases(id),
 draft_id UUID NOT NULL REFERENCES drafts(id),
 advocate_id UUID NOT NULL REFERENCES users(id),
 document_id UUID NOT NULL REFERENCES documents(id),
 profile_signature_id UUID REFERENCES advocate_signatures(id),
 mode TEXT NOT NULL CHECK(mode IN ('uploaded','test')),
 signed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notice_signatures_case_version ON notice_signatures(case_id,draft_id,signed_at);
