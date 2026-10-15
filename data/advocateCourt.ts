import type { Href } from 'expo-router';

import type { CourtSpec } from '../components/court/types';

// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE HIGH COURT / DISTRICT COURT — designs 362–396, the advocate side of
// both court services (the client side is 289–355). Every screen is drawn from
// its spec below by components/court/CourtKit.tsx; routes live under
// app/advocate/court/.
//
// ⚠⚠ STATIC, NOT WIRED — UNSCOPED. Drawn, and nothing behind them:
//   • ALL AI — 364's AI Case Summary and AI Refresh, 366's consultation copilot,
//     367/368's Legalitt AI, 390's AI-assisted notes. AI surfaces twelve to
//     fifteen in this app; none is specified.
//   • The voice call on 369. No calling vendor is scoped.
//   • Every upload — NOC (394), court order (390), filing receipt (379), process
//     fee receipt (386), Add Document (374).
//   • Send Court Fee Request, Send Process Fee Request, Send to Client, Send NOC
//     to Client, Send Revised Documents, Mark as Filed, Save Note, Commence
//     Session, Start Hearing.
//   • Every Chat with Client / Call Client button.
//   • The live client-preview cards on 380 and 385 show static sample content;
//     they do not reflect typed input.
// Buttons that navigate are navigation only: they move between drawn screens.
//
// CONFLICTS — one value is picked so each screen builds; every variant is
// commented with its source file. Not resolved.
//
//  1. ⚠⚠ THE COMMISSION. design/363: Client Deposited Fee ₹25,000, Legalitt
//     Platform Fee −₹5,000, YOUR PAYMENT ₹20,000 — 20%. 395 and 396 confirm
//     ₹20,000 as the settled fee, so 20% holds across this batch. The wallet
//     (356–361) states "Platform Fee (10%)" with correct arithmetic on fourteen
//     rows. Two self-consistent, incompatible commission models.
//  2. design/362's bottom bar is four icon-only tabs; the app ships five
//     labelled. The tab bar is NOT changed (the 4-vs-5 question is the client's).
//  3. AADHAAR, three more places: 364's document list ("ID Proof.pdf", read by
//     AI), 374's "Aadhaar Card or PAN Card (self-attested copy)", 375's "Client
//     Identity Proof (Aadhaar Copy)" (and 376's). Same DPDP concern as 294/342.
//  4. DOCKET MIXING. HCR-2026-1048 (364, 365, 369, 371, 372, 378, 379, 384,
//     387–392, 395) and DC-2026-1048 (373, 380–383, 385, 386, 393, 394) on what
//     is otherwise one flow. 363's header says HC with no number; 382 reads
//     "District Court / High Court Representation". 384 shows both WP/2026/09876
//     (case number) and HC/IND/2026/18452 (filing number); 385/386 carry both
//     on a DISTRICT court case. 375/376 add a third id, #LGT-2026-8492.
//  5. design/388 labels 25 October 2026 "Sunday" (it is a Sunday) and 387/389
//     list the first hearing that day. Courts do not sit on Sundays.
//  6. STEP COUNTERS, all different: "Step 3 of 5" (370, 390), "Step 3 of 4"
//     (371, 372), "Step 4 of 4" (373), "Step 1 of 2" (375), "Step 5 of 10"
//     (377), "Step 1 of 3 Active" (385), "Step 6 of 9" (388), "Step 3 of 5"
//     (394), "Step 8 of 8" (396), "All 8 Steps Done" (395), "3 of 3 Completed"
//     (386). Each timeline also lists a different set of stages.
//  7. TITLES CLIPPED IN THE EXPORT, stored whole: 363 "High Court Reques",
//     379 "Confirm Court Filin", 381 "Court Fee Reques", 394 "Client Changed Ac".
//  8. NAMES. The advocate is "Abhishek Verma" (380–386, 393, 394) but "Adv.
//     Rahul" in 367/368's greeting; "Adv. Gurneet Chawla" verifies delivery on
//     376; the judge is "Hon'ble Justice Verma" (387–389) — the opposing party
//     is Amit Verma. 364's consultation line names "Adv. Priya Sharma" on 362.
//  9. design/373 is District Court (DC-2026-1048) inside the High Court flow.
// 10. design/364's AI card: tools "unlock once you accept representation" —
//     a gating rule that exists nowhere else.
// 11. PHONE NUMBERS. Rahul Sharma is +91 98765 43210 (363, 371, 372) and
//     +91 98260 12345 (375, 376).
// 12. design/363's email is clipped in the export: "rahul.sharma@er". Stored
//     as drawn, marked (?) — not guessed.
// 13. design/364's matter is a business / software IP agreement; every other
//     screen's is a property-title dispute (363 "Disputed Title & Demarcation
//     Injunction"). 364 also gives "Today, Oct 24 • 4:00 PM – 4:45 PM (GMT+1)" —
//     not IST — "Ref #2024-88C", and "₹28,500 / 45 min" against 363's ₹25,000.
// 14. design/363 lists 5 client documents (incl. "ID Proof.pdf"); 374 asks for
//     the same papers again as a checklist; 375 confirms 5 different ones.
// 15. design/378's "Continue to Hearing Update (Available after hearing)" and
//     384's "Add First Hearing" — two different routes into the hearing step.
// 16. design/380's Case Number is "Pending Filing" (fresh case); 385 has
//     WP/2026/09876 and a High Court filing number on the same District Court.
// 17. design/373's Decision Date is 5 October 2026; 383's approval is 07 Oct
//     2026; 379's filing 18 October; 375's delivery 25 Oct 2026 — after filing.
// 18. design/389 "Preview Live Hearing Mode" and 369 "Tap to finish hearing
//     prep session" — a hearing-prep call and a live-hearing mode, neither
//     specified.
// 19. design/391 is drawn at a larger type scale than every other screen in
//     the batch (about 1.15×) on the same 390pt width.
// ─────────────────────────────────────────────────────────────────────────────

const R = (p: string) => `/advocate/court/${p}` as Href;

/** Shared case facts. */
const CASE = {
  client: 'Rahul Sharma',
  initials: 'RS',
  title: 'Rahul Sharma vs Amit Verma',
  /** ⚠ CONFLICT 11 — 375/376 give +91 98260 12345. */
  phone: '+91 98765 43210',
  phone2: '+91 98260 12345',
  hcr: 'HCR-2026-1048',
  dc: 'DC-2026-1048',
  caseNo: 'WP/2026/09876',
  filingNo: 'HC/IND/2026/18452',
  court: 'Madhya Pradesh High Court',
  bench: 'Indore Bench',
  hcRep: 'High Court Representation',
  dcRep: 'District Court Representation',
};

// ── design/363 — High Court request (Before Accept / Request Accepted) ──────

const requestBefore: CourtSpec = {
  // ⚠ CONFLICT 7 — clipped "High Court Reques" in the export.
  title: 'High Court Request',
  headerPill: { pill: 'Under Review', tone: 'panel', dot: true, lg: true },
  switcher: { label: 'STATE MODE', options: ['Before Accept', 'Request Accepted'] },
  blocks: [
    {
      k: 'lead',
      title: 'High Court Request',
      right: { pill: 'New Request', tone: 'peach', dot: true, lg: true },
      text: 'Civil Writ Petition • MP HC',
    },
    {
      k: 'card',
      top: 'leadGap',
      head: { title: 'CLIENT PROFILE', caps: true, right: { pill: 'Verified Lead', tone: 'grey' } },
      blocks: [
        { k: 'person', initials: CASE.initials, name: CASE.client, sub: 'Indore, Madhya Pradesh', subIcon: 'mapPin' },
        {
          k: 'grid',
          top: 'phoneTop',
          boxed: 'panel',
          cells: [
            { label: 'Phone', value: CASE.phone, sideIcon: 'phone' },
            // ⚠ CONFLICT 12 (?) — clipped in the export; not guessed.
            { label: 'Email', value: 'rahul.sharma@er', sideIcon: 'mail' },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'CASE DETAILS', caps: true, right: { pill: 'High Court Tier', tone: 'help' } },
      blocks: [
        { k: 'text', t: CASE.title, tone: 'title' },
        { k: 'text', t: 'Disputed Title & Demarcation Injunction', top: 'subTop' },
        {
          k: 'grid',
          top: 'gridTop',
          boxed: 'columns',
          cells: [
            { label: 'Court', value: 'Madhya Pradesh HC' },
            { label: 'Bench', value: CASE.bench },
            { label: 'Matter Type', value: 'Civil Dispute' },
            { label: 'Next Date', value: '12 Oct 2026', tone: 'green' },
          ],
        },
      ],
    },
    {
      k: 'card',
      tone: 'panel',
      head: { icon: 'quote', title: 'WHAT HAPPENED?', caps: true, right: 'Rahul Sharma • Client' },
      blocks: [
        {
          k: 'text',
          t: '"I bought a property from Amit Verma. There is a dispute about the ownership documents. I need help with the case."',
          tone: 'quote',
          top: 'quoteTop',
          bottom: 'quoteBottom',
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'CLIENT DOCUMENTS', caps: true, pills: [{ pill: '5 Files', tone: 'peach' }], right: '46 Pages Total' },
      blocks: [
        {
          k: 'docs',
          pdf: true,
          bottom: 'docsBottom',
          // ⚠ UNSCOPED — View PDF opens nothing (no document viewer).
          items: [
            { name: 'Case Papers.pdf', meta: '12 Pages • 6.2 MB', btn: 'View PDF' },
            { name: 'Previous Court Order.pdf', meta: '8 Pages • 3.4 MB', btn: 'View PDF' },
            { name: 'Sale Deed.pdf', meta: '14 Pages • 5.8 MB', btn: 'View PDF' },
            // ⚠ CONFLICT 3 — an identity document, read before acceptance.
            { name: 'ID Proof.pdf', meta: '2 Pages • 1.2 MB', btn: 'View PDF' },
            { name: 'Property Documents.pdf', meta: '10 Pages • 4.6 MB', btn: 'View PDF' },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'PAYMENT', caps: true, right: { pill: 'Direct Deposit', tone: 'mint', dot: true } },
      blocks: [
        {
          k: 'rows',
          top: 'payRowsTop',
          rows: [
            // ⚠⚠ CONFLICT 1 — 20% here; the wallet (356–361) says 10%.
            ['Client Deposited Fee', '₹25,000'],
            ['Legalitt Platform Fee', '-₹5,000'],
          ],
        },
        { k: 'amount', top: 'payBoxTop', tone: 'payPeach', valueRight: true, label: 'YOUR PAYMENT', sub: 'You will get this amount', value: '₹20,000' },
      ],
    },
    {
      k: 'card',
      tone: 'panel',
      blocks: [
        {
          k: 'person',
          icon: 'lock',
          greyDisc: true,
          small: true,
          bottom: 'aiBottom',
          name: 'Legalitt AI Case Tools',
          // ⚠ CONFLICT 10 — a gating rule found nowhere else.
          sub: 'AI Document Summary & Semantic PDF Search unlock once you accept representation.',
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'Your Decision' },
      blocks: [
        {
          k: 'text',
          t: 'Please assess potential conflicts of interest and High Court schedule availability before making your determination.',
          tone: 'small',
          top: 'decisionTextTop',
        },
      ],
    },
  ],
  footer: [
    // ⚠ No rejected state is drawn: Reject Request does nothing.
    { label: 'Reject Request', variant: 'danger', icon: 'x' },
    { label: 'Accept Case', iconRight: 'arrowRight', to: R('ai-summary') },
  ],
};

/**
 * ⚠ "Request Accepted" has NO DRAWN SCREEN. It is 363's layout with the drawn
 * copy changed: the header pill and the decision card take 370's step copy
 * ("Request Accepted — You accepted the client invitation"), and the decision
 * buttons give way to the one drawn next step, the AI case summary (364).
 */
const requestAccepted: CourtSpec = {
  ...requestBefore,
  headerPill: { pill: 'Request Accepted', tone: 'green', dot: true, lg: true },
  blocks: requestBefore.blocks.map((b) =>
    b.k === 'card' && b.head?.title === 'Your Decision'
      ? { k: 'card', head: { title: 'Request Accepted' }, blocks: [{ k: 'text', t: 'You accepted the client invitation', tone: 'small' }] }
      : b,
  ),
  footer: [{ label: 'Ai Case Summary', iconRight: 'arrowRight', to: R('ai-summary') }],
};

export const COURT_REQUEST = [requestBefore, requestAccepted];
