# Legalitt — which design is the current one

28 October 2026

The client has redrawn screens over time without removing the old versions.
The app has in places been built from **both**. This document says which
version is current for every screen where more than one exists.

**Rule from here on:** before building any screen, check this table. If the
screen is listed, the "Current" column is the only version that may be built.
If a screen is not listed, there is only one version and it is current.

---

## 1. Legal Notice, client side — a complete generation change

In **October 2026** the client redrew the whole Legal Notice client journey
from payment onward. Six consecutive screens were replaced and two new ones
added. The September `.webp` versions are **dead**.

| Superseded (Sep, `.webp`) | Current (Oct, `.png`) | What changed |
|---|---|---|
| `28-ln-step6-payment` | `434-ln-complete-payment` | redrawn |
| `29-ln-scan-pay` | `435-ln-scan-pay` | redrawn |
| `30-ln-payment-success` | `436-payment-success-psr` | redrawn |
| `31-ln-tracking-drafting` | `437-ln-request-submitted` | **rebuilt properly** |
| `32-ln-tracking-approval` | `437` + `438-ln-draft-ready-decision` | **rebuilt properly** |
| `33-chat-advocate` | `439-ln-client-advocate-chat` | redrawn, adds a microphone |
| — | `440-ln-notice-delivery` | **new** |
| — | `441-ln-notice-delivered` | **new** |

### Why 31 and 32 must not be built

Design 32 is an unfinished draft. As drawn it contains:

- the REQUEST STATUS section holding the draft card **instead of the
  seven-step timeline** — the timeline vanishes at this state
- **two contradictory draft cards** at once: one offering "Review Draft", one
  saying "Being prepared by your advocate — View Draft" (locked)
- a **bare textarea** with no heading and no button
- **two competing primary buttons**: "Review Draft" and "Review & Approve
  Draft"

437 fixes every one of those. It keeps the full timeline, has one draft card,
and ends with a titled "Your Decision" section containing Approve & Proceed
and Request Changes.

**An app built faithfully from 32 looks broken, and is not the client's
intent.** This was the cause of the 28 October review failure.

### The flow 437 and 438 actually describe

437 is the whole tracking screen. 438 is the **same screen after the client
taps Request Changes**: the advocate card and timeline drop away, the textarea
appears, and the single button becomes Request Changes.

So the textarea is **revealed by the tap**, not always present. In design 32 it
was always visible. That is a behavioural difference, not just a visual one.

---

## 2. Still current — no newer version exists

These `.webp` files are old but have **no replacement**. They remain the
specification.

| Screen | Covers |
|---|---|
| `22`, `23` | Legal Notice detail and info |
| `24`, `25`, `26`, `39` / `91`, `27` | Legal Notice intake steps 1–5 |
| `14`–`21` | client cases, hearings, case details |
| `34`, `35`, `36` | property verification, support chat, request callback |

Note `39-ln-step4-review-docs` and `91-ln-step4-upload` are **two different
screens of the same step**, not two generations: upload, then review.

---

## 3. Suspected redraws — checked, all clear

Four pairs looked like redraws from their filenames. **None of them are.**
Checked by opening them.

| Pair | Verdict |
|---|---|
| `184-adv-cases-list` vs `443-adv-cases-list` | **Two states of one screen.** 443 is 184 with the "FIR Draft" filter chip selected. Both are current. 443 also shows the card button changing by state — "Continue Draft" where 184 shows "Review Request" |
| `117-advocate-profile-b` vs `433-advocate-profile-full` | **Not a pair.** 117 is the Legal Advice follow-up booking screen; the filename misleads |
| `204` / `213` / `221` / `442-adv-cases-long` | Same screen at different content lengths, not generations |
| `18-case-details` vs `444-adv-client-case-detail` | Opposite sides — client and advocate. Both current |

**Conclusion: the Legal Notice generation change is the only one in the whole
design set.** Nothing else needs retiring.

---

## 3a. 440 and 441 are one destination at two states

Open questions 20 and 21 asked how Notice Delivered (441) is reached, and what
440 shows after delivery. Reading both screens answers it without asking the
client.

**They are the same destination, rendered by state.**

| Shipment state | Screen | Header | Content |
|---|---|---|---|
| anything before delivered | `440` | "Notice Delivery" | progress list, latest courier update, "Physical Notice on the Way" |
| delivered | `441` | "Notice Delivered" | delivery details, signed POD, signed notice, case completed |

So:

- **441 needs no separate route.** The client taps through to delivery
  tracking exactly as before; which screen they get depends on the shipment.
- **440 after delivery does not exist**, so its "Physical Notice on the Way"
  headline never goes stale. Question 21 dissolves.
- This is **not** navigation. Nothing moves the client while they watch. The
  screen they are on re-renders when the state changes, which §2.12 allows and
  which is what "the screen may change what it shows" means.

Supporting evidence from the designs themselves: 440's Statutory Evidence
Guarantee says a certificate of service "will automatically appear in your case
file" once delivered — and that certificate is precisely what 441 shows.

Both screens carry a back arrow, so both are pushed from the tracking screen,
not from each other.

---

## 4. Services with only one generation

Everything else — FIR, District Court, High Court, Legal Advice, Property
Search, Document Filing, the courier screens (275–287), the advocate
dashboards — exists in `.png` only, in a single generation. **The problem in
this document is confined to the Legal Notice client journey and a few
advocate list screens.**

That is the good news: eight services do not carry this.

---

## 5. How this happened, so it does not happen again

§1a says the designs are the specification. It never said **which** design when
two exist. Both generations were in the same folder, both were faithfully
built, and nothing in the process asked the question.

**Added to §1a:** where two designs cover the same screen, the newer supersedes
the older, and the older is not built. Where it is unclear which is newer, stop
and ask — do not build both.

## Legal Notice override — 12 November 2026

For Legal Notice use `design/figma-2026-11-12/Legal-Notice-Client-Side`,
`Legal-Notice-Advocate-Side`, and `Document-Viewer`, with the corrections in
`Legal-Notice-Changes`. `docs/flows/ISHAAN-ANSWERS-2026-11-12.md` overrides
`docs/flows/LEGAL-NOTICE-FLOW.md`, which maps the generic export filenames to
screens. The `Documents Forensic 16/17/30` files in the Legal Notice folder are
Legal Notice payment, Scan & Pay and success. Retire older numbered designs
where they conflict, particularly advocate dispatch and the Offences editor.
