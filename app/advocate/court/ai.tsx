// Advocate — Legalitt AI from the court flow (designs 367 and 368).
//
// REUSED — 367 is design/170 and 368 is design/171, re-exported in this batch:
// the same greeting, upload card, transcript and composer. This route is the
// existing Legalitt AI screen (app/advocate/ai), unchanged: it opens on 367's
// conversation, and 368's empty state is the same component's empty state.
//
// ⚠ CONFLICT — TWO EXPORTS OF ONE SCREEN DISAGREE. Rendered against 367 at
// 390pt (367's export clips the top 16pt of the header, a uniform +16): after
// that, 367 draws the greeting 8pt higher, the upload card 18pt higher, the
// transcript 9pt further left in wider bubbles, the composer 20pt higher, and a
// photo avatar where 170 has "AD". Not re-tuned: that would move 170's verified
// layout. Which export is authoritative is the client's call.
//
// ⚠⚠ UNSCOPED — AI. Nothing is generated (see app/advocate/ai/index.tsx).
// ⚠ CONFLICT 8 — the greeting says "Adv. Rahul"; the advocate is Abhishek Verma.
export { default } from '../ai';
