# FIR Draft: built screens beside their designs

Each image shows the design on the left and the built screen on the right, at phone width (430 px). Screens with no design are shown on their own. They were captured by `scripts/verify-fir-full-flow.cjs` on the local build with synthetic TEST ONLY data, then composed by `scripts/fir-screens-compose.cjs`. The raw captures are in `built/`.

| Flow | Screen | Design | Side by side | Note |
|---|---|---|---|---|
| C1 | FIR Draft landing | `design/client/fir-draft/F0a-landing-v2.png` | [C1-landing.png](C1-landing.png) |  |
| C1a | Request a Callback | `design/client/fir-draft/F1-request-callback.png` | [C1a-request-callback.png](C1a-request-callback.png) |  |
| C1a | Request a Callback: submitted | none | [C1a-request-callback-submitted.png](C1a-request-callback-submitted.png) | Existing submitted state; no design. |
| C1b | Support Chat | `design/client/fir-draft/F2-support-chat.png` | [C1b-support-chat.png](C1b-support-chat.png) |  |
| C1b | Support Chat: after a quick question is sent | none | [C1b-support-chat-sent.png](C1b-support-chat-sent.png) | State; no design. |
| C2 | Why a proper FIR draft is important | `design/41-fir-info.jpeg` | [C2-why-fir.png](C2-why-fir.png) |  |
| C3 | Step 1 of 5: Quick Submission | `design/client/fir-draft/F0b-step1-v2.png` | [C3-step1-quick-submission.png](C3-step1-quick-submission.png) |  |
| C4 | Step 2 of 5: Incident Details | `design/43-fir-step2-incident.png` | [C4-step2-incident.png](C4-step2-incident.png) |  |
| C5 | Step 3 of 5: People Involved | `design/44-fir-step3-people.png` | [C5-step3-people.png](C5-step3-people.png) |  |
| C5 | Complainant details pop-up | none | [C5-complainant-sheet.png](C5-complainant-sheet.png) | No design (§9.2). |
| C5 | Add Accused / Opposite Party pop-up | none | [C5-accused-sheet.png](C5-accused-sheet.png) | No design (§9.2). |
| C5 | Add Witness pop-up | none | [C5-witness-sheet.png](C5-witness-sheet.png) | No design (§9.2). |
| C6 | Step 4 of 5: Documents & Evidence | `design/45-fir-step4-documents.jpeg` | [C6-step4-documents.png](C6-step4-documents.png) |  |
| C6 | Step 4: Continue blocked, reasons beside the missing slots | none | [C6-step4-documents-blocked.png](C6-step4-documents-blocked.png) | State; no design. |
| C7 | Step 5 of 5: Review & Submit | `design/46-fir-step5-review.jpeg` | [C7-step5-review.png](C7-step5-review.png) |  |
| C8 | Complete Payment | `design/client/fir-draft/F3-complete-payment.png` | [C8-F3-complete-payment.png](C8-F3-complete-payment.png) |  |
| C8a | Scan & Pay | `design/client/fir-draft/F4-scan-pay.png` | [C8a-F4-scan-pay.png](C8a-F4-scan-pay.png) |  |
| C8b | Payment Successful | `design/client/fir-draft/F5-payment-success.png` | [C8b-F5-payment-success.png](C8b-F5-payment-success.png) |  |
| C9 | Request Submitted | `design/47-fir-submitted.png` | [C9-request-submitted.png](C9-request-submitted.png) |  |
| C10 | FIR Draft Status: stage 2, Information Review | `design/48-fir-status.jpeg` | [C10-status-stage2.png](C10-status-stage2.png) |  |
| C10 | FIR Draft Status: stage 4, Awaiting Your Approval | `design/48-fir-status.jpeg` | [C10-status-stage4.png](C10-status-stage4.png) | Same design, later state. |
| C10 | FIR Draft Status: stage 3 after the client asked for changes | `design/48-fir-status.jpeg` | [C10-status-stage3-changes.png](C10-status-stage3-changes.png) | Same design, later state. |
| C10 | FIR Draft Status: stage 5, completed | `design/48-fir-status.jpeg` | [C10-status-stage5-completed.png](C10-status-stage5-completed.png) | Same design, later state. |
| C11 | Your FIR Draft Is Ready: decision due | `design/client/fir-draft/F6-draft-ready-decision.png` | [C11-F6-draft-ready-decision.png](C11-F6-draft-ready-decision.png) |  |
| C11 | Approve confirmation | none | [C11-approve-confirm.png](C11-approve-confirm.png) | No design (§9.2). |
| C11 | Your FIR Draft Is Ready: no decision pending | `design/49-fir-draft-ready.png` | [C11-49-draft-ready-no-decision.png](C11-49-draft-ready-no-decision.png) |  |
| C12 | Request Changes | `design/client/fir-draft/F7-request-changes.png` | [C12-F7-request-changes.png](C12-F7-request-changes.png) |  |
| C12 | Request Changes: nothing chosen yet | none | [C12-F7-request-changes-validation.png](C12-F7-request-changes-validation.png) | State; no design. |
| C13 | Change Request Submitted | `design/client/fir-draft/F8-change-request-submitted.png` | [C13-F8-change-request-submitted.png](C13-F8-change-request-submitted.png) |  |
| C14 | FIR Draft Approved (client submits at the police station, Q119/Q120) | `design/client/fir-draft/F9-draft-approved.png` | [C14-F9-draft-approved.png](C14-F9-draft-approved.png) |  |
| A1 | Advocate: Cases list | `design/213-adv-cases-full.png` | [A1-cases-list.png](A1-cases-list.png) |  |
| A1 | Advocate: Cases list, FIR Draft filter | `design/214-adv-cases-fir.png` | [A1-cases-list-fir.png](A1-cases-list-fir.png) |  |
| A1 | Advocate: Cases list after rejecting the request | none | [A1-cases-list-empty.png](A1-cases-list-empty.png) | Empty state; no design. |
| A1 | Advocate: FIR card, Sent to Admin | `design/214-adv-cases-fir.png` | [A1-cases-list-sent-to-admin.png](A1-cases-list-sent-to-admin.png) | Same design, later state. |
| A1 | Advocate: FIR card, Admin Returned | `design/214-adv-cases-fir.png` | [A1-cases-list-admin-returned.png](A1-cases-list-admin-returned.png) | Same design, later state. |
| A1 | Advocate: FIR card, Client Changes | `design/214-adv-cases-fir.png` | [A1-cases-list-client-changes.png](A1-cases-list-client-changes.png) | Same design, later state. |
| A2 | Advocate: FIR Request Details | `design/215-adv-fir-request.png` | [A2-request-details.png](A2-request-details.png) |  |
| A2 | Advocate: Reject reason pop-up | none | [A2-reject-sheet.png](A2-reject-sheet.png) | No design (§9.2). |
| A2 | Advocate: Accept confirmation | none | [A2-accept-confirm.png](A2-accept-confirm.png) | No design (§9.2). |
| A3 | Advocate: Review Documents | `design/216-adv-fir-documents.png` | [A3-review-documents.png](A3-review-documents.png) |  |
| A4 | Advocate: FIR Draft Generator | `design/217-adv-fir-generator.png` | [A4-draft-generator.png](A4-draft-generator.png) |  |
| A5 | Advocate: FIR proforma editor, as opened | `design/218-adv-fir-draft.png` | [A5-proforma-editor-initial.png](A5-proforma-editor-initial.png) |  |
| A5 | Advocate: FIR proforma editor, filled and saved | `design/218-adv-fir-draft.png` | [A5-proforma-editor.png](A5-proforma-editor.png) |  |
| A5 | Advocate: Add Legal Section (BNS) pop-up | none | [A5-legal-section-sheet.png](A5-legal-section-sheet.png) | No design (§9.2). |
| A5 | Advocate: editor with the admin’s return reason | `design/218-adv-fir-draft.png` | [A5-proforma-admin-returned.png](A5-proforma-admin-returned.png) | Same design, later state. |
| A5 | Advocate: editor with the client’s change request | `design/218-adv-fir-draft.png` | [A5-proforma-client-changes.png](A5-proforma-client-changes.png) | Same design, later state. |
| A6 | Advocate: FIR Review after sending (compact) | `design/449-adv-fir-review-waiting-compact.png` | [A6-review-waiting-admin-449.png](A6-review-waiting-admin-449.png) |  |
| A6 | Advocate: FIR Review, waiting for admin | `design/219-adv-fir-review.png` | [A6-review-waiting-admin-219.png](A6-review-waiting-admin-219.png) |  |
| A6 | Advocate: FIR Review, admin returned | `design/219-adv-fir-review.png` | [A6-review-admin-returned.png](A6-review-admin-returned.png) | Same design, other state. |
| A6 | Advocate: FIR Review, client requested changes | `design/219-adv-fir-review.png` | [A6-review-client-changes.png](A6-review-client-changes.png) | Same design, other state. |
| A6 | Advocate: FIR Review, completed on client approval | `design/219-adv-fir-review.png` | [A6-review-completed.png](A6-review-completed.png) | Same design, final state. |
| A1 | Advocate: FIR card, Completed | `design/214-adv-cases-fir.png` | [A1-cases-list-completed.png](A1-cases-list-completed.png) | Same design, later state. |
| A7 | Advocate: FIR Completed | `design/220-adv-fir-completed.png` | [A7-completed.png](A7-completed.png) |  |
| A7 | Advocate: Wallet showing the FIR share | none | [A7-wallet.png](A7-wallet.png) | Existing wallet screen. |
| §3 / C1 | Admin: Support inbox with the FIR Draft callback and chat | none | [ADMIN-support-inbox.png](ADMIN-support-inbox.png) | Awaiting Figma admin designs (§9.2). |
| §3.1 | Admin: FIR Drafts list | none | [ADMIN-fir-list.png](ADMIN-fir-list.png) | Awaiting Figma admin designs (§9.2). |
| §3.1 | Admin: new paid request, assign an advocate | none | [ADMIN-new-request.png](ADMIN-new-request.png) | Awaiting Figma admin designs (§9.2). |
| §3.2 | Admin: advocate rejected, reason shown, reassign | none | [ADMIN-advocate-rejected.png](ADMIN-advocate-rejected.png) | Awaiting Figma admin designs (§9.2). |
| §3.3 | Admin: draft awaiting approval | none | [ADMIN-approval-queue.png](ADMIN-approval-queue.png) | Awaiting Figma admin designs (§9.2). |
| §3.3 | Admin: return to advocate with a reason | none | [ADMIN-return-for-correction.png](ADMIN-return-for-correction.png) | Awaiting Figma admin designs (§9.2). |
| §3.3 | Admin: approve and send to client | none | [ADMIN-approve.png](ADMIN-approve.png) | Awaiting Figma admin designs (§9.2). |
| §3.3 | Admin: sent to client | none | [ADMIN-sent-to-client.png](ADMIN-sent-to-client.png) | Awaiting Figma admin designs (§9.2). |
