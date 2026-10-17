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

Client subsequently authorised correcting 434's arithmetic. Service + delivery179 + platform199 are exclusive base fees; GST is18% on their sum. Urgent:999 +179 +199 +247.86 =1,624.86. Ordinary:699 +179 +199 +193.86 =1,270.86. These replace the static1,377 in434–436 and the inconsistent1,178.82 in437. The same calculation feeds checkout, QR, success and tracking.

Local production browser walk passed approval→decision→delivery→delivered→case list, request-changes→chat with typed message, chat sending, proof viewer, existing Arjun profile, and calculated checkout row/total. No browser exceptions. `tsc --noEmit` passed before this stage.

## Supplied profile

/advocates/rahul-sharma renders433 using the existing conditional profile component, the PNG's photograph, and its literal Rahul-specific record. Browser checked name, bar enrollment, rating/review count and both reviews. No Legal Notice profile button changed; Arjun remains the assigned profile. Ready to wire after identity confirmation.
