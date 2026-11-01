# Chunk 1 — rebuild the Legal Notice tracking screen on design 437

28 October 2026 · Legal Notice, client side only

---

## The problem, precisely

`apps/mobile/app/legal-notice/tracking.tsx` (967 lines) renders **designs 31
and 32** — the September generation, superseded in October (see
`DESIGN-GENERATIONS.md`).

`app/legal-notice/request-submitted.tsx` is a seven-line wrapper:

```tsx
import TrackingScreen from './tracking';
export default function NoticeDecision() { return <TrackingScreen decision />; }
```

The `decision` flag **bolts design 437's "Your Decision" section onto the
bottom of design 32's layout**. 437 was never built as a screen; it was added
as an attachment to the screen it was meant to replace.

That is why one route looks right and the other looks broken. They are the same
component taking two code paths through a dead design.

### What design 32 contains, as drawn

Everything below is in the client's own superseded PNG. The app renders it
faithfully. **It must stop being rendered, not be fixed.**

- the REQUEST STATUS section holding the draft card **instead of the seven-step
  timeline**, so the timeline disappears at that state
- **two contradictory draft cards**: "Review Draft" next to "Being prepared by
  your advocate / View Draft" (locked)
- a **bare textarea** with no heading and no button
- **two competing primary buttons**: "Review Draft" and "Review & Approve Draft"

---

## What to build

**One screen, built from design 437, rendering four states.** Not a flag on the
old screen. The 31 and 32 layouts are deleted.

### The screen, top to bottom (design 437)

1. header card — status pill, tier, headline, sub-line, Request ID with Copy
2. NOTICE DETAILS — Notice Type (`matter_type`), Service, Submitted On,
   Current Status
3. ASSIGNED ADVOCATE — avatar, name, verified tick, experience, practice area,
   bar registration, rating, reviews, View Profile, Chat with Advocate
4. REQUEST STATUS — **the seven-step timeline, always**
5. LEGAL NOTICE DRAFT — **one** card only
6. Your Decision — state-dependent (below)

### The four states

| Case status | Header pill | Headline | Draft card | Your Decision |
|---|---|---|---|---|
| `paid`, `assigning`, `assigned`, `in_progress` | Drafting in Progress | Legal Notice Request Submitted | locked, "Being prepared by your advocate" | absent |
| `client_review` | Awaiting Your Approval | Your Legal Notice Draft is Ready | ready: filename, "Prepared by {advocate}", Review Draft, Download PDF | **Approve & Proceed** + **Request Changes** |
| `approved`, not yet dispatched | **no pill** | (see Q19) | ready | absent |
| `dispatching` onward | **no pill** | (see Q19) | ready | the drawn route to delivery tracking |

Timeline ticks follow `case_events` in every state.

### Request Changes (design 438)

Tapping Request Changes does **not** navigate away. 438 is this same screen in
a reduced form:

- the advocate card and the timeline drop away
- the textarea appears — **it is revealed by the tap, never visible before it**
- the single button becomes Request Changes, which submits

In design 32 that textarea was always on screen. It must not be.

---

## Delivery tracking is one destination at two states

`440` and `441` are the same destination (see `DESIGN-GENERATIONS.md` §3a):

- shipment not yet delivered → **440**, "Notice Delivery"
- shipment delivered → **441**, "Notice Delivered"

One route, chosen by shipment state. No navigation fires while the client
watches; the screen re-renders. This resolves open questions 20 and 21 — the
"Physical Notice on the Way" headline can never go stale, because at that point
the client is on 441.

---

## Delete

- every code path rendering design 31 or 32
- `STATE_SEGMENTS`, the `SegmentedControl`, and the `?state=approval` parameter
  — a prototype toggle has no place in a client-facing screen
- the hardcoded `LEGAL_NOTICE_ADVOCATE` import; the advocate comes from the case
- the duplicate draft card
- the always-present textarea

`request-submitted.tsx` and `tracking.tsx` must end up as **one route**. If both
paths are still needed for the deployed fixture demo, the second is a thin alias
of the first, with no second layout behind it.

---

## Empty states — the rule that was half-applied

When a fact is missing, **the whole element goes**, not just its value. The
separators, brackets, icons and labels around it go with it.

Seen on 28 October with no advocate assigned: an "ASSIGNED ADVOCATE" heading
above an empty white box holding two dead buttons. Either the section renders
with content, or it does not render.

---

## Not in this chunk

Deliberately excluded, so this stays reviewable:

- the other eight services
- the advocate side
- the seeded advocate's empty profile (chunk 2)
- the plural bugs ("1 Documents", "1 documents added")
- the onboarding text clipped at 375px, and the "Choose Your Role" heading
  rendering below its own options
- deep links bouncing to onboarding
