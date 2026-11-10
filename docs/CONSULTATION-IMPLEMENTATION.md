# Consultation services — 10 November 2026

Scope: Legal Advice, District Court and High Court. The court codes retain their
own ₹600 / 30-minute consultation tariff. Representation is separately quoted;
there is no fixed court-service price. Existing cases retain their price snapshots.

## Assumptions awaiting client confirmation

1. Availability is weekly, in Asia/Kolkata, in non-overlapping half-hour periods.
   No date exceptions or instant-presence promise. Existing paid bookings survive
   an availability edit. Empty hours mean no bookable slots. A versioned policy
   starts with 28 days ahead, 30 minutes' notice and a 10-minute checkout hold.
2. Client chooses an approved advocate; admin confirms that same advocate's
   assignment. Active approved advocates who publish hours are bookable for all
   three services; no unconfirmed service-specific roster restrictions are added.
   Selection alone never grants access to a case. A missed appointment
   remains visible; the client can reschedule with the same advocate without
   charging again, provided the session has not started. No invented refund.
3. All sessions use actual in-app chat. Both participants explicitly join/start;
   they may mutually start early. Ending is an advocate action, never a timer.
   The purchased duration remains 30 minutes; actual start/end times are recorded.
4. The advocate writes a client brief (key points, next steps, outcome) and may
   keep separate internal notes. Admin approves the exact submitted PDF version;
   a required correction reason returns it to the same advocate. The client sees
   the waiting stage, never internal notes or correction reasons. No auto approval.
5. Court quotes follow the completed chat consultation. Scope and exclusions are
   required for informed acceptance; the advocate specifies their base share.
   Commission and GST reuse versioned pricing policy. Quote validity starts at
   seven days. A new offer supersedes an unpaid old offer; a captured offer cannot
   be replaced. Representation is one payment, not instalments.
6. PDF page overage is case-wide. Subsequent representation checkout charges only
   extra pages beyond those already charged, never the same pages twice. Generated
   client briefs are not client uploads and do not create another overage charge.
7. Court stages are manual records: preparation, filed, hearing and decision.
   Hearing updates retain design 425's hearing date/time, court room, next step,
   next hearing and explicitly selected order documents. Court/bench is
   client-entered (or explicitly unknown), then advocate-verified;
   state/district use the existing LGD data. There is no court-system integration,
   automatic filing, real-time hearing feed, or in-app collection of court fees.
8. On completion, the advocate submits a final client summary and supporting
   documents for admin approval. Approval closes the case and records entitlement
   using the captured quote. Actual settlement remains unbuilt; no escrow or bank
   transfer is claimed. Reassignment is not added to these services in this chunk.
9. No mandatory identity proof is introduced for these three services: Q15 is
   answered for FIR only. Optional identity uploads retain the global exclusion
   from extraction and ID-number persistence. No AI drafting or summary is added.
10. A client may rate their own completed consultation, updating their own single
    review even after case closure. Ratings do not invent verification badges or
    a platform-wide rank.

## Layout sources and substitutions

Reuse Legal Advice 104–112, 117, 124, advocate availability 149/274, session/docket
160–183 and 288; District Court 340–344 and 397–432; High Court 291–294 and 362–396.
Preserve their cards, steps, field groups and navigation. The confirmed flat tariff
supersedes experience/mode price tiers and drawn fixed court retainers. Audio/video
are labelled unavailable. Docket PDF excludes privileged notes. Remove drawn claims
about escrow, transfers, HSM/P2P encryption, AI recommendations and instant online
presence where no such capability exists. Admin booking, quote and report controls
have no supplied design and use the existing admin panel's visual language.

## Lifecycle and storage

`draft → submitted → payment_pending → paid → assigning → assigned →
advocate_accepted → in_progress`. Sub-status identifies scheduled/chat/report review
and court work. `changes_requested` is admin correction only for these services;
Legal Notice keeps its client correction path. Admin report approval completes
Legal Advice; court consultation approval proceeds to a separate representation
quote, payment and manual court stages, then final admin approval and `completed`.

The existing consultation row stores the reservation and actual session timestamps.
Weekly availability and scheduling policy are versioned rows. Separate immutable
court quote and report rows hold versions and supersession links. A per-case
workspace revision protects stale actions. Payment snapshots pin fee/commission/
page policies. Internal notes and admin reasons stay out of case details and public
event payloads. Only the canonical case-state-machine writes cases/events.
