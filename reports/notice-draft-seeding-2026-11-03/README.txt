Legal Notice editor — intake starting point, 3 November 2026

Creation finding
Opening the editor reads the case and its latest draft; it does not create a
draft row. Starting work changes case status only. The first Save Draft,
Generate Draft or Preview POST creates version 1 through saveNoticeDraft().
Seeding therefore belongs at initial controller load, before the first save.

Owner decisions incorporated
Exactly 2 of 7 sections are editable: Background & Facts and Offences.
Sender, Recipient, Subject and Legal Demand display the client's filing and
are read-only. Response Time & Closing displays the fixed letterhead text,
read-only. Labels explicitly identify both sources. No PDF contract changes.

New facts start from subject_matter. A saved draft's facts/offences always win,
including intentional blanks. Offences starts empty. Stored closing starts
empty; it is not used as the displayed template closing. Old versions remain
untouched. The controller's existing dirty guard preserves unsaved edits.

Verification case
LN-2026-0015, a694ed94-2b6c-43ab-9eda-369be9163221.
Client/recipient names begin TEST ONLY; all facts/contact details are synthetic.
Created through the real Dev API, with simulated service payment and explicit
admin assignment/advocate acceptance/start. No real dispute or payment.

Evidence
before-draft-188.png / before-editor-266.png: public build before the fix.
local-draft-188-seeded.png / local-editor-266-seeded.png: local API-mode export
in an isolated browser at the deployed origin, reading the same real case.
local.json: five seeded sections, two editable sections, polling preserves edits,
no fixture content and no browser errors. No draft saved by the local check.
Deployed evidence is added after rollout; the local check is not deployment proof.

Next chunk scope (not implemented)
Priority: a dedicated response-period field shared by the PDF, client tracking
and future reminders. Confirm required/default value, deadline start date and
exact letterhead placement first. The current PDF renderer has no hard-coded
fifteen-day deadline; that wording occurs in the old fixture demand.
Separate later chunk: versioned advocate overrides of filing fields, keeping
sender name/father's name/age/address structured, matching intake and letterhead.
