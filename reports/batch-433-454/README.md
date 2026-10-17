# Batch 433–454 — inventory before implementation

The client confirmed 451–454 were renamed to the four re-export filenames. All 22 inputs are present. Compared decoded RGBA against the prior design inventory, then normalized-size pixel comparisons against the source designs of existing routes. Normalized comparisons include compression and device-frame differences; they are not browser screenshot fidelity scores. See pixel-diff.json for counts.

| Input | Classification | Existing reference / action |
|---|---|---|
| 433 | Near-identical re-export: 156 changed pixels, 10 over channel delta 20 | 118; same Rahul profile. Expose separately; never wire to Arjun. |
| 434 | Changed payment layout | 28; adds delivery fee, contradictory arithmetic. Preserve confirmed calculation pending answer. |
| 435 | Re-export | 29 Scan & Pay; reuse shared screen. |
| 436 | Re-export | 30 success, retains PSR/forensic template errors; retain service-specific runtime values. |
| 437 | Changed tracking / decision layout | 31–32; add approval and request-changes actions. |
| 438 | New request-changes layout | 32 shortened to decision form. |
| 439 | Re-export | 33 client chat. |
| 440 | New | Notice in transit; no existing client Legal Notice delivery screen. |
| 441 | New | Notice delivered; no existing client Legal Notice delivered screen. |
| 442 | Exact duplicate, zero changed pixels | 213 / 221 |
| 443 | Exact duplicate, zero changed pixels | 214 |
| 444 | Exact duplicate, zero changed pixels | 215 |
| 445 | Exact duplicate, zero changed pixels | 216 |
| 446 | Exact duplicate, zero changed pixels | 217; reuse generator. |
| 447 | Exact duplicate, zero changed pixels | 218; add local editing and removable chips last. |
| 448 | Exact duplicate, zero changed pixels | 219 Waiting; retain Approved / Changes preview notice. |
| 449 | New compact Waiting variant | 219 without reminder panel, plus Continue footer. |
| 450 | Exact duplicate, zero changed pixels | 220 success; reuse completed screen. |
| 289-reexport-2x | Measurement re-export | 780px content, x40–819, 2px/pt. |
| 415-reexport-2x | Measurement re-export | 780px content, x40–819, 2px/pt; still draws High Court wording. |
| 422-reexport-2x | Measurement re-export | 780px content, x16–795, 2px/pt. |
| 348-reexport-2x | Wrong export / exact duplicate | Exactly 381 at 430px wide, not a usable 348 export. Leave 348 unchanged. |

Both 448 and 449 visibly select Waiting and say WAITING FOR CLIENT. These are advocate-side views of the client's review status. Neither supplies the missing Approved or Changes state.

434 draws 999 + 179 delivery + 199 GST + 199 platform, but totals 1,377. Its step subtitle also contradicts its six-step rail. Previously confirmed GST and step-counter decisions take precedence pending fee clarification.

## Legal Notice implementation and validation

32 → /legal-notice/request-submitted (437) → /legal-notice/delivery (440) → /legal-notice/delivered (441). Request Changes opens /legal-notice/request-changes (438), then /chat/advocate (439) with the entered message. Delivery proof is a supporting viewer using the actual supplied thumbnail, with no invented document body.

Client subsequently authorised correcting 434's arithmetic. Service + delivery 179 + platform 199 are exclusive base fees; GST is 18% on their sum. Urgent: 999 +179 +199 +247.86 =1,624.86. Ordinary: 699 +179 +199 +193.86 =1,270.86. These replace the static1,377 in 434–436 and the inconsistent1,178.82 in 437. The same calculation feeds checkout, QR, success and tracking.

Local production browser walk passed approval→decision→delivery→delivered→case list, request-changes→chat with typed message, chat sending, proof viewer, existing Arjun profile, and calculated checkout row/total. No browser exceptions. `tsc --noEmit` passed before this stage.

## Supplied profile

/advocates/rahul-sharma renders 433 using the existing conditional profile component, the PNG's photograph, and its literal Rahul-specific record. Browser checked name, bar enrollment, rating/review count and both reviews. No Legal Notice profile button changed; Arjun remains the assigned profile. Ready to wire after identity confirmation.

## FIR review states

448 reuses 219 at /advocate/fir/review. New 449 is /advocate/fir/review-compact. Both are Waiting; Approved and Changes keep their preview notice. In demo mode full Waiting advances to compact Waiting, whose drawn Continue leads to 450 (/advocate/fir/completed). Outside demo mode no approval or submission is fabricated. Remind Client no longer submits the FIR.

Browser verification passed both Waiting layouts, both preview tabs, and the demo landing at FIR Submitted Successfully. The walk exposed a flowMap precedence bug: the dynamic /advocate/fir/[id] entry shadowed exact screen routes. Exact entries now resolve first.

## Editable FIR proforma — built last

447 reuses 218 at /advocate/fir/draft. All fields and the narrative are editable. Legal-section chips remove and add typed values; counts update. Add Accused and Add Witness append empty editable fields. Document inclusion toggles, and the browser picker adds only user-selected filenames. Save Draft stays on the form. Frontend session memory retains edits when review's View Draft reopens it; no backend or AI generation is claimed.

Browser walk passed request 215/444 → documents 216/445 → generator 217/446 → draft 218/447 → review 219/448 → compact 449 → completed 220/450. Verified replacement typing, narrative editing, remove/add legal section, extra witness/accused, document inclusion, Save Draft, and retained values after review→View Draft. Terminal screen: FIR Submitted Successfully. No browser exceptions.

## Final validation

- TypeScript: `npx tsc --noEmit` — clean.
- Full exported-web smoke: 322 routes, 0 failures (baseline 315; 7 new route files).
- Focused routing/invoice regressions: `node scripts/check-batch-flows.cjs` — passed.
- Demo-off: both new FIR Waiting layouts and Legal Notice delivery remain pending. Remind Client does not submit. The existing shared Scan & Pay simulation intentionally still reaches success independently of the demo flag; it was preserved, not mistaken for a payment integration.
- Pixel comparison JSON now includes pre-batch browser renders at each design's full content-height viewport, in addition to source-image comparisons. These are difference measurements, not claims of pixel-perfect browser rendering; fonts, runtime identity/fees and viewport-dependent layout also contribute. 348 is excluded from measurement as instructed.

New route files: /legal-notice/request-submitted, /legal-notice/request-changes, /legal-notice/delivery, /legal-notice/delivered, /legal-notice/delivery-proof, /advocates/rahul-sharma, /advocate/fir/review-compact.

[Every changed re-export token and delta](measurements.md). 348 remains pending a correct export. The 433 profile is ready but deliberately unlinked from Legal Notice. Neither 448 nor 449 resolves the Approved/Changes design question. Frontend payments, KYC and saves remain the app's prototype mechanisms; no backend integration was added.

The complete Legal Notice browser walk also passed from /legal-notice through all six wizard steps, first DigiLocker verification and reuse, Ordinary checkout→QR→success (₹1,270.86 at each step), tracking→decision→courier→Notice Delivered. The Urgent invoice is ₹1,624.86. The separate changes/chat branch passed as well.

All feature groups were completed and committed before the 50-minute gate. The final visual pass restored 433's full drawn biography and verified badge, aligned 441's hero spacing/status fills, and made 450 explicitly terminal in flowMap. Remaining supplied-design questions are limited to 348's export, 433's identity, and 219's missing Approved/Changes mapping.

Final round-trip check: completion's View FIR now preserves the case ID and reopens that case's edited draft. Both the full→compact demo transition and completion→draft link carry it. Routing regression checks also preserve the existing default parameter substitution (/cases/all→/cases/1 and /advocates→/advocates/1) while exact routes take precedence.
