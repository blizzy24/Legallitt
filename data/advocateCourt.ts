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
// 20. designs 367/368 are re-exports of 170/171 that disagree with them by up
//     to 20pt (see app/advocate/court/ai.tsx). 366 matches 182 within 4.5pt.
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

// ── design/364 — AI case summary ─────────────────────────────────────────────
// ⚠⚠ UNSCOPED — ALL AI. The summary, AI Refresh, "Synthesized Brief", Read PDFs
// and the semantic citation index are drawn copy: nothing is generated, read
// or indexed. Download / Share / Copy, Call Client and Chat with Client do
// nothing. ⚠ CONFLICT 13 — this matter is a software IP agreement, not 363's
// property dispute, and is billed ₹28,500 / 45 min (363: ₹25,000).

export const COURT_AI_SUMMARY: CourtSpec = {
  // Drawn "Ai Case Summary" — stored as drawn.
  title: 'Ai Case Summary',
  headerRight: { pill: 'AI', tone: 'peach' },
  blocks: [
    { k: 'label', text: 'ANALYSIS COMPLETE', dot: true, right: { pill: 'Verified Sync', tone: 'panel', icon: 'shieldCheck', lg: true } },
    {
      k: 'card',
      top: 'firstCardTop',
      head: { title: 'CASE DETAILS', caps: true, right: { pill: CASE.hcr, tone: 'grey', mono: true } },
      blocks: [
        { k: 'text', t: CASE.title, tone: 'title', top: 'titleTop' },
        { k: 'text', icon: 'user', parts: [{ t: 'Client: ' }, { t: CASE.client, bold: true }], top: 'clientTop' },
        {
          k: 'grid',
          boxed: 'cells',
          top: 'gridTop',
          cells: [
            { label: 'Court', value: 'MP High Court' },
            { label: 'Bench', value: CASE.bench },
            { label: 'Matter Type', value: 'Civil Dispute (Property Ownership)', wide: true, iconRight: 'gavel' },
          ],
        },
      ],
    },
    { k: 'label', text: 'MATTER BRIEFING', right: 'Ref #2024-88C', inset: true, top: 'briefLabelTop' },
    {
      k: 'card',
      top: 'briefCardTop',
      blocks: [
        { k: 'pills', items: [{ pill: 'Corporate & Commercial', tone: 'peach' }, { pill: 'Video • 45m', tone: 'grey', icon: 'video' }] },
        { k: 'amount', tone: 'none', label: '', value: '₹28,500', suffix: '/ 45 min', top: 'priceTop' },
        { k: 'info', icon: 'calendar', label: 'Requested Time Window', value: 'Today, Oct 24 • 4:00 PM – 4:45 PM (GMT+1)', top: 'windowTop' },
        { k: 'label', text: 'ADVOCATE SUMMARY', top: 'summaryLabelTop' },
        {
          k: 'scrollText',
          top: 'summaryTop',
          box: 'summaryH',
          large: true,
          paras: [
            'I have a business agreement with an international company for software and intellectual property. I need legal help to review the agreement before signing it. I am mainly concerned about the contract terms, responsibility for losses, and payment or damage claims. I also want to understand which court will handle any dispute. The agreement needs to be finalized soon.',
          ],
        },
        {
          k: 'chips',
          spread: true,
          top: 'actionsTop',
          items: [
            { label: 'Download', icon: 'download' },
            { label: 'Share', icon: 'share' },
            { label: 'Copy', icon: 'copy' },
          ],
        },
      ],
    },
    {
      k: 'card',
      top: 'refreshCardTop',
      head: {
        // The drawn tile is an empty peach square.
        tile: 'peach',
        title: 'AI Refresh',
        pills: [{ pill: 'Executive', tone: 'grey' }],
        sub: 'Clear summary for quick review',
        right: { link: 'Refresh', icon: 'refresh', chip: true },
      },
      blocks: [
        { k: 'text', t: 'Original description has been simplified and organized for easier reading.', top: 'refreshTextTop' },
        {
          k: 'card',
          tone: 'panel',
          pad: 'refreshPanelPad',
          top: 'refreshPanelTop',
          head: { icon: 'file', title: 'AI REFRESHED SUMMARY', caps: true, right: { link: 'Synthesized Brief' }, rule: true },
          blocks: [
            {
              k: 'scrollText',
              box: 'refreshH',
              bare: true,
              top: 'refreshBoxTop',
              paras: [
                { label: 'Issue', text: 'Review of an international IP assignment and software licensing agreement before signing.', stack: true },
                { label: 'Background:', text: ' Urgent legal review of the agreement, with focus on important contract terms, possible risks, and steps to reduce those risks before the board meeting tomorrow morning.' },
                { label: 'What Client Needs :', text: ' Urgent advisory and risk mitigation before final board execution tomorrow morning.', bullet: true },
                { label: 'Legal View:', text: ' Related laws, rules, and important cases.', bullet: true },
              ],
            },
          ],
        },
        { k: 'footRow', icon: 'info', t: 'AI generated • Review before use', right: { link: 'View Original', iconAfter: 'arrowUp' }, top: 'footRowTop' },
      ],
    },
    {
      k: 'card',
      top: 'docsCardTop',
      head: { title: 'Documents Read', sub: 'Indexed for semantic citation', right: { pill: '5 Files • 46 Pages', tone: 'peach' } },
      blocks: [
        {
          k: 'docs',
          top: 'docsTop',
          // ⚠ CONFLICT 3 — "ID Proof.pdf" (Aadhaar) is listed as read by the AI.
          items: [
            { name: 'Case Papers.pdf', meta: '12 Pages • ✓ Read', right: 'circleTick' },
            { name: 'Previous Order.pdf', meta: '8 Pages • ✓ Read', right: 'circleTick' },
            { name: 'Sale Deed.pdf', meta: '14 Pages • ✓ Read', right: 'circleTick' },
            { name: 'ID Proof.pdf', meta: '2 Pages • ✓ Read', right: 'circleTick' },
            { name: 'Property Documents.pdf', meta: '10 Pages • ✓ Read', right: 'circleTick' },
          ],
        },
        { k: 'button', btn: { label: 'Read PDFs', icon: 'eye', variant: 'soft' }, top: 'readTop' },
      ],
    },
    {
      k: 'card',
      top: 'nextCardTop',
      head: { icon: 'arrowRight', tile: 'disc', title: 'Next Step' },
      blocks: [{ k: 'text', t: 'Talk to the client before you continue. Confirm physical registry documents for filing.', top: 'nextTextTop', size: 'nextTextSize' }],
    },
  ],
  footer: [
    { label: 'Call Client', icon: 'phone', variant: 'panel', hug: true },
    { label: 'Chat with Client', icon: 'chat' },
  ],
};

// ── design/365 — chat with the client ────────────────────────────────────────
// ⚠ UNSCOPED — static transcript. The composer takes text; nothing is sent. The
// call icon, Call Client, View Documents, the attachment (+) and the mic do
// nothing. View Case opens the AI case summary (364); the AI mark opens the
// consultation copilot (366) — navigation only, the copilot answers nothing.
export const COURT_CHAT = {
  name: CASE.client,
  initials: CASE.initials,
  status: 'Online',
  matter: CASE.hcRep,
  matterSub: 'Civil Case',
  matterId: CASE.hcr,
  actions: [
    { label: 'Call Client', icon: 'phone' },
    { label: 'View Case', icon: 'briefcase', to: R('ai-summary') },
    { label: 'View Documents', icon: 'folder' },
  ] as { label: string; icon: 'phone' | 'briefcase' | 'folder'; to?: Href }[],
  today: 'TODAY',
  messages: [
    { from: 'me', text: 'Hello Rahul. I have checked your case details.', time: '10:30 AM' },
    { from: 'them', text: 'Okay. Can you explain what will happen next?', time: '10:32 AM' },
    { from: 'me', text: 'I will review your documents and prepare the case for court.', time: '10:33 AM' },
    { from: 'them', text: 'What documents do I need to send?', time: '10:35 AM' },
    { from: 'me', text: 'I will share the document list after our discussion.', time: '10:36 AM' },
  ] as { from: 'me' | 'them'; text: string; time: string }[],
  placeholder: 'Type a message...',
  copilot: R('copilot'),
  aiLabel: 'Legal AI',
};

// ── design/369 — call with the client (Active Call / Call Ended) ─────────────
// ⚠⚠ UNSCOPED — no calling vendor. Nothing is dialled, muted, routed to the
// speaker or noted; the timer does not run. END CALL selects the Call Ended
// state of the drawn switcher and goes nowhere.
// ⚠ "Call Ended" has NO DRAWN SCREEN: it is 369's layout with the drawn copy
// changed — the status reads the switcher's own "Call Ended", the waveform and
// END CALL give way, and the footnote stays.
// ⚠ CONFLICT 18 — "Tap to finish hearing prep session": no hearing-prep
// session is specified.
export const COURT_CALL = {
  title: 'Call With Client',
  switchLabel: 'PREVIEW STATE:',
  states: ['Active Call', 'Call Ended'],
  encrypted: '256-Bit Encrypted Audio',
  matter: `${CASE.hcRep} • ${CASE.hcr}`,
  initials: CASE.initials,
  role: 'ADVOCATE CLIENT',
  name: CASE.client,
  connected: 'Connected',
  ended: 'Call Ended',
  timer: '12:48',
  keys: [
    { label: 'Mute', icon: 'mic' as const },
    { label: 'Speaker', icon: 'speaker' as const },
    { label: 'Add Note', icon: 'note' as const },
  ],
  end: 'END CALL',
  foot: 'Tap to finish hearing prep session',
};

// ── design/370 — waiting for the client (Waiting for Client / Client Accepted)
// The drawn switcher ships. Its second state is design/371, drawn as its own
// screen (and its own route, client-accepted). ⚠ 371 draws no switcher; here
// the switcher stays above it so the state can be switched back.
// ⚠ UNSCOPED — "You will receive an instant notification": no push. View Case
// Notes and Contact Support open nothing.
// ⚠ CONFLICT 6 — "Step 3 of 5" here; 371 and 372 say "Step 3 of 4".

export const COURT_WAITING: CourtSpec = {
  title: 'Waiting For Client',
  switcher: { options: ['Waiting for Client', 'Client Accepted'], inline: true },
  blocks: [
    {
      k: 'hero',
      icon: 'clock',
      tone: 'peach',
      flat: true,
      badge: true,
      pill: { pill: 'Waiting for Client Reply', tone: 'peach', dot: true, lg: true },
      title: 'Waiting for Client',
      sub: 'The client is deciding whether to continue with you.',
    },
    {
      k: 'card',
      top: 'firstCardTop',
      blocks: [
        { k: 'text', icon: 'info', iconSize: 'spokenIcon', t: 'You have spoken with the client. The client will confirm if they want to continue.', size: 'spokenSize' },
        { k: 'text', icon: 'bell', iconSize: 'notifyIcon', t: 'You will receive an instant notification when Rahul Sharma responds.', tone: 'small', top: 'notifyTop', bottom: 'notifyBottom' },
      ],
    },
    {
      k: 'card',
      head: { title: 'Case Information', right: { pill: 'Active', tone: 'grey' } },
      blocks: [
        {
          k: 'grid',
          caps: true,
          top: 'infoGridTop',
          bottom: 'infoGridBottom',
          cells: [
            { label: 'CLIENT', value: CASE.client },
            { label: 'MATTER', value: 'Civil' },
            { label: 'CASE TITLE', value: CASE.title, wide: true },
            { label: 'COURT', value: CASE.court, wide: true },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'Case Progress', right: 'Step 3 of 5' },
      blocks: [
        {
          k: 'timeline',
          top: 'stepsTop',
          noRail: true,
          steps: [
            { title: 'Request Accepted', sub: 'You accepted the client invitation', state: 'done' },
            { title: 'Case Discussed', sub: 'Initial talk finished with Rahul Sharma', state: 'done' },
            { title: 'Waiting for Client', sub: 'Client is reviewing the conversation', state: 'active' },
            { title: 'Client Accepted', sub: 'Client confirms hiring', state: 'todo' },
            { title: 'Documents', sub: 'Upload and review required case papers', state: 'todo' },
          ],
        },
        { k: 'banner', icon: 'lock', tone: 'grey', text: 'Documents step unlocks once the client accepts.', top: 'lockTop' },
      ],
    },
    { k: 'button', btn: { label: 'View Case Notes', icon: 'file', variant: 'white' }, top: 'notesTop' },
    { k: 'button', btn: { label: 'Need Help? Contact Support', icon: 'headset', variant: 'link' }, top: 'helpTop' },
  ],
};

// ── design/371 — client accepted ─────────────────────────────────────────────
// Reached as 370's second switcher state, and as its own route. ⚠ Its header
// still reads "Waiting For Client" — kept as drawn.
// ⚠ UNSCOPED — Chat with Client and the call disc do nothing; the checklist is
// not pushed to the client.
export const COURT_ACCEPTED: CourtSpec = {
  title: 'Waiting For Client',
  blocks: [
    {
      k: 'hero',
      icon: 'check',
      tone: 'deepGreen',
      pill: { pill: 'CLIENT CONFIRMED • READY TO PROCEED', tone: 'sage', dot: true, lg: true },
      title: 'Client Accepted',
      sub: 'The client has chosen to continue with you for legal representation.',
    },
    {
      k: 'card',
      top: 'firstCardTop',
      head: { title: 'CLIENT DETAILS', caps: true, right: { pill: 'Verified Client', tone: 'verified', icon: 'checkCircle' } },
      blocks: [{ k: 'person', initials: CASE.initials, name: CASE.client, meta: CASE.phone, metaIcon: 'smartphone', call: true, top: 'personTop', bottom: 'personBottom' }],
    },
    {
      k: 'card',
      head: { title: 'CASE INFORMATION', caps: true, right: { pill: CASE.hcr, tone: 'grey', mono: true } },
      blocks: [
        { k: 'text', t: 'Service Type', tone: 'label', top: 'serviceTop' },
        { k: 'text', parts: [{ t: CASE.hcRep, bold: true }], pill: { pill: 'Civil', tone: 'peach' }, top: 'valueTop' },
        { k: 'text', t: 'Case Title', tone: 'label', top: 'labelTop' },
        { k: 'text', tone: 'title', parts: [{ t: 'Rahul Sharma ' }, { t: 'vs', muted: true }, { t: ' Amit Verma' }], top: 'valueTop' },
        { k: 'banner', icon: 'gavel', tone: 'grey', title: CASE.court, text: CASE.bench, top: 'courtTop' },
      ],
    },
    {
      k: 'card',
      head: { title: 'CASE PROGRESS', caps: true, right: 'Step 3 of 4' },
      blocks: [
        {
          k: 'timeline',
          top: 'stepsTop',
          deep: true,
          steps: [
            { title: 'Request Accepted', sub: 'Case intake confirmed', state: 'done' },
            { title: 'Case Discussed', sub: 'Brief overview completed', state: 'done' },
            { title: 'Client Accepted', sub: 'Client finalized the engagement', state: 'accent' },
            { title: 'Recommend Documents', sub: 'Send checklist for filing', state: 'todo' },
          ],
        },
      ],
    },
    {
      k: 'card',
      tone: 'cream',
      head: {
        icon: 'listChecks',
        tile: 'brown',
        kicker: { pill: 'RECOMMENDED NEXT STEP', tone: 'sand' },
        title: 'Recommend Documents',
        sub: 'Tell the client which documents you need to start preparing the filing.',
      },
      blocks: [
        {
          k: 'banner',
          icon: 'mailCheck',
          tone: 'white',
          parts: [{ t: CASE.client, bold: true }, { t: ' will receive your document checklist instantly in their Legalitt app.' }],
          text: '',
          top: 'nextBannerTop',
        },
      ],
    },
    { k: 'button', btn: { label: 'Recommend Documents', iconRight: 'arrowRight', to: R('recommend-documents') }, top: 'ctaTop' },
    { k: 'button', btn: { label: 'Chat with Client', icon: 'chat', variant: 'white' }, top: 'chatTop' },
  ],
};

export const COURT_WAITING_STATES = [COURT_WAITING, { ...COURT_ACCEPTED, title: COURT_WAITING.title }];

// ── design/372 — client accepted, the second drawing ─────────────────────────
// ⚠ DIFFERS FROM 371 (18.3% of pixels; 9.4% in the best 300pt window), though
// both draw the same state: 372 has a centred "Client Accepted" header with a
// plain chevron, a mint halo, "The client has chosen to continue with you." as
// one line, a CLIENT card with a call disc, one combined case card (Civil
// pill, the id as plain text, a one-line court strip), a "Confirmed" tag and
// "You are retained for this matter" on the third step, a grey next-step card
// with its icon at the right, and both buttons pinned in a white footer.
// Built as drawn; which of the two is current is the client's call.
export const COURT_ACCEPTED_2: CourtSpec = {
  title: 'Client Accepted',
  centerTitle: true,
  chevron: true,
  blocks: [
    {
      k: 'hero',
      icon: 'check',
      tone: 'mint',
      pill: { pill: 'CLIENT CONFIRMED • READY TO PROCEED', tone: 'panelGreen', dot: true, lg: true },
      title: 'Client Accepted',
      sub: 'The client has chosen to continue with you.',
    },
    {
      k: 'card',
      top: 'firstCardTop',
      head: { title: 'CLIENT', caps: true, right: { pill: 'Verified Client', tone: 'greyGreen', icon: 'checkCircle' } },
      blocks: [{ k: 'person', initials: CASE.initials, name: CASE.client, meta: CASE.phone, metaIcon: 'phone', call: true, top: 'personTop', bottom: 'personBottom' }],
    },
    {
      k: 'card',
      head: { title: '', right: CASE.hcr, pills: [{ pill: 'Civil', tone: 'grey' }] },
      blocks: [
        { k: 'text', t: CASE.hcRep, tone: 'label', top: 'serviceTop' },
        { k: 'text', t: CASE.title, tone: 'title', top: 'valueTop' },
        { k: 'banner', icon: 'gavel', tone: 'grey', text: `${CASE.court} • ${CASE.bench}`, top: 'courtTop', bottom: 'courtBottom' },
      ],
    },
    {
      k: 'card',
      head: { title: 'CASE PROGRESS', caps: true, right: 'Step 3 of 4' },
      blocks: [
        {
          k: 'timeline',
          top: 'stepsTop',
          deep: true,
          steps: [
            { title: 'Request Accepted', sub: 'Case intake confirmed', state: 'done' },
            { title: 'Case Discussed', sub: 'Brief overview completed', state: 'done' },
            { title: 'Client Accepted', sub: 'You are retained for this matter', state: 'done', right: { pill: 'Confirmed', tone: 'greyGreen' } },
            { title: 'Recommend Documents', sub: 'Send checklist for filing', state: 'next' },
          ],
        },
      ],
    },
    {
      k: 'card',
      tone: 'panel',
      head: { title: 'RECOMMENDED NEXT STEP', caps: true, right: { iconDisc: 'listChecks' } },
      blocks: [
        { k: 'text', t: 'Recommend Documents', tone: 'title', top: 'nextTitleTop' },
        { k: 'text', t: 'Tell the client which documents you need to start preparing the filing.', size: 'nextTextSize', top: 'nextTextTop' },
        {
          k: 'banner',
          icon: 'info',
          tone: 'white',
          parts: [{ t: CASE.client }, { t: ' will receive your document checklist instantly in their Legalitt app.' }],
          text: '',
          top: 'nextBannerTop',
        },
      ],
    },
  ],
  footer: [
    { label: 'Recommend Documents', iconRight: 'arrowRight', to: R('recommend-documents') },
    { label: 'Chat with Client', icon: 'chat', variant: 'white' },
  ],
  footerStack: true,
};

// ── design/373 — client declined (District Court) ────────────────────────────
// ⚠ CONFLICT 9 — District Court (DC-2026-1048) inside the High Court flow. No
// drawn control leads here; the decline is the client's (no switcher draws it).
// ⚠ CONFLICT 17 — declined 5 October 2026, before 383's 07 Oct approval and
// the 18 October filing of the same matter.
// ⚠ UNSCOPED — the info icon and the admin re-assignment. Back to Dashboard
// opens the advocate dashboard.
export const COURT_DECLINED: CourtSpec = {
  title: 'Client Declined',
  headerPill: { pill: CASE.dc, tone: 'help', mono: true },
  sub: CASE.dcRep,
  headerIcon: 'info',
  blocks: [
    {
      k: 'card',
      tone: 'decline',
      head: { icon: 'xCircle', tile: 'red', title: 'CASE REPRESENTATION', caps: true, tone: 'red', right: { pill: 'Decision Made', tone: 'help' } },
      blocks: [
        { k: 'text', t: 'Client Declined', tone: 'title', top: 'declTitleTop' },
        { k: 'text', t: 'The client did not accept your request.', size: 'declTextSize', top: 'declTextTop' },
        { k: 'text', icon: 'info', iconSize: 'declInfoIcon', t: "You are no longer waiting for the client's decision.", tone: 'small', top: 'declInfoTop' },
      ],
    },
    {
      k: 'card',
      head: { title: 'REQUEST LIFECYCLE', caps: true, right: 'Step 4 of 4' },
      blocks: [
        {
          k: 'bars',
          top: 'barsTop',
          steps: [
            { label: 'Received', state: 'done' },
            { label: 'Accepted', state: 'done' },
            { label: 'In Review', state: 'done' },
            { label: 'Declined', state: 'bad' },
          ],
        },
        { k: 'banner', icon: 'swap', tone: 'grey', text: 'Next: Admin Review for New Advocate', dot: true, top: 'nextRowTop' },
      ],
    },
    {
      k: 'card',
      head: { title: 'CLIENT', caps: true, right: { pill: 'Civil Matter', tone: 'peach' } },
      blocks: [
        { k: 'person', icon: 'user', greyDisc: 'help', name: CASE.client, sub: CASE.title, meta: 'District Court', metaIcon: 'gavel', top: 'personTop', bottom: 'personBottom' },
      ],
    },
    {
      k: 'card',
      head: { title: 'CLIENT DECISION', caps: true, right: { pill: 'Declined', tone: 'red', dot: true } },
      blocks: [
        {
          k: 'grid',
          boxed: 'cells',
          top: 'decisionTop',
          cells: [
            { label: 'Decision Date', value: '5 October 2026', icon: 'calendar' },
            { label: 'Decision Time', value: '6:40 PM', icon: 'clock' },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'CLIENT REASON', caps: true, right: { link: '', icon: 'quote' } },
      blocks: [
        { k: 'chip', t: 'I want a different advocate.', top: 'reasonTop' },
        {
          k: 'card',
          tone: 'panel',
          pad: 'notePad',
          top: 'noteTop',
          head: { title: 'CLIENT NOTE', caps: true, small: true },
          blocks: [{ k: 'text', t: '"I would prefer another advocate for this case."', tone: 'quote', top: 'noteTextTop' }],
        },
      ],
    },
    {
      k: 'card',
      tone: 'tier',
      head: { icon: 'help', tile: 'brown', title: 'Next Step', right: { pill: 'Request Closed for You', tone: 'white' } },
      blocks: [
        { k: 'text', t: 'The request has been sent to Legalitt for review. You are no longer assigned to this request.', size: 'nextTextSize', top: 'nextTextTop' },
        {
          k: 'banner',
          icon: 'shieldCheck',
          tone: 'white',
          text: 'Legalitt admin is reviewing the matter to reassign the client appropriately. Your acceptance metrics are safeguarded.',
          top: 'nextBannerTop',
        },
      ],
    },
    { k: 'button', btn: { label: 'Back to Dashboard', icon: 'dashboard', variant: 'panel', to: '/dashboard' as Href }, top: 'backTop' },
  ],
};

// ── design/374 — recommend documents ─────────────────────────────────────────
// ⚠ UNSCOPED — Send to Client sends nothing (no push, no checklist delivery);
// Add Document and each item's edit / delete do nothing; the message is drawn
// text, "Tap to edit" opens nothing.
// ⚠ CONFLICT 3 — "Aadhaar Card or PAN Card (self-attested copy)".
// ⚠ CONFLICT 14 — 363 shows these papers already uploaded.
export const COURT_RECOMMEND: CourtSpec = {
  title: 'Recommend Documents',
  blocks: [
    { k: 'text', t: 'Tell the client which documents to keep ready.', size: 'leadSize' },
    {
      k: 'card',
      top: 'clientTop',
      blocks: [
        {
          k: 'person',
          icon: 'user',
          kicker: 'CLIENT',
          name: CASE.client,
          right: { pill: 'Civil Matter', tone: 'grey' },
        },
        { k: 'text', icon: 'building', iconSize: 'courtIcon', t: CASE.court, tone: 'small', top: 'courtTop' },
      ],
    },
    {
      k: 'label',
      text: 'DOCUMENTS NEEDED',
      strong: true,
      pills: [
        { pill: '4 Required', tone: 'peach' },
        { pill: '1 Optional', tone: 'grey' },
      ],
      top: 'docsLabelTop',
    },
    {
      k: 'checklist',
      cards: true,
      top: 'docsTop',
      items: [
        { title: 'Original Case Papers', tag: { pill: 'Required', tone: 'peach' }, sub: 'All previous filings and petition copies', state: 'done', edit: true },
        { title: 'Latest Court Order', tag: { pill: 'Required', tone: 'peach' }, sub: 'Certified copy of the most recent interim order', state: 'done', edit: true },
        // ⚠ CONFLICT 3 — Aadhaar.
        { title: 'Identity Proof', tag: { pill: 'Required', tone: 'peach' }, sub: 'Aadhaar Card or PAN Card (self-attested copy)', state: 'done', edit: true },
        { title: 'Previous Advocate Papers', tag: { pill: 'Optional', tone: 'grey' }, sub: 'NOC or vakalatnama from earlier advocate if applicable', state: 'info', edit: true },
        { title: 'Property Papers', tag: { pill: 'Required', tone: 'peach' }, sub: 'Registry documents and revenue record excerpts', state: 'done', edit: true },
      ],
    },
    { k: 'button', btn: { label: 'Add Document', icon: 'plusCircle', variant: 'soft' }, top: 'addTop' },
    { k: 'label', text: 'MESSAGE TO RAHUL SHARMA', strong: true, right: { link: '', icon: 'note' }, top: 'msgLabelTop' },
    {
      k: 'card',
      top: 'msgTop',
      blocks: [
        { k: 'text', t: 'Please keep the original case papers and clear copies ready. I may ask for more documents if needed.', size: 'msgSize' },
        { k: 'footRow', t: 'Direct Advocate Note', right: 'Tap to edit', top: 'msgFootTop' },
      ],
    },
    { k: 'banner', icon: 'shieldCheck', tone: 'none', text: 'The client will see this note with your document checklist in their Legalitt app.', top: 'noteTop' },
  ],
  footer: [{ label: 'Send to Client', iconRight: 'arrowRight' }],
  footerNote: 'After sending, the client will be prompted to prepare and dispatch these documents.',
};

// ── design/375 — confirm documents ───────────────────────────────────────────
// The drawn checkbox gates Confirm Received, as the design draws it disabled:
// ticking the box enables it, and it opens Documents Received (376) —
// navigation only, nothing is recorded and the client is not notified.
// ⚠ UNSCOPED — "Report Missing Documents", the copy icon and Secure Audit.
// ⚠ CONFLICT 3 — "Client Identity Proof (Aadhaar Copy)".
// ⚠ CONFLICT 4 / 11 — a third id (#LGT-2026-8492) and a second phone number.
// ⚠ CONFLICT 17 — delivered 25 Oct 2026, a week after 379's 18 October filing.
// ⚠ The client photograph is not supplied: a neutral disc at the drawn size.
export const COURT_CONFIRM_DOCS: CourtSpec = {
  title: 'Confirm Documents',
  blocks: [
    {
      k: 'lead',
      pill: { pill: 'Step 1 of 2 • Manual Verification', tone: 'peach', dot: true },
      right: { link: 'Secure Audit', icon: 'lock', muted: true },
      text: 'Please check that you have received the physical legal documents from your client.',
    },
    {
      k: 'card',
      top: 'clientTop',
      head: { icon: 'idCard', title: 'CLIENT', caps: true, right: { pill: '#LGT-2026-8492', tone: 'grey', mono: true } },
      blocks: [
        {
          k: 'person',
          photo: true,
          name: CASE.client,
          sub: 'Property Dispute • High Court Bench',
          meta: CASE.phone2,
          metaIcon: 'phone',
          metaStrong: true,
          top: 'personTop',
        },
      ],
    },
    {
      k: 'card',
      head: { icon: 'archive', title: 'DOCUMENTS RECEIVED', caps: true, pills: [{ pill: '5 Physical Documents', tone: 'peach' }] },
      blocks: [
        { k: 'text', t: 'Check that each document is inside the package:', tone: 'small', top: 'checkTextTop' },
        {
          k: 'docs',
          discs: true,
          top: 'docsTop',
          bottom: 'docsBottom',
          items: [
            // Drawn broken after "&"; the next row, the same width, is not. The
            // break is kept as drawn.
            { name: 'Original Case Papers &\nVakalatnama', icon: 'file', right: 'ring' },
            // ⚠ CONFLICT 3 — Aadhaar.
            { name: 'Client Identity Proof (Aadhaar Copy)', icon: 'idCard', right: 'ring' },
            { name: 'Signed Petition Draft', icon: 'signature', right: 'ring' },
            { name: 'Supporting Annexure A & B', icon: 'folders', right: 'ring' },
            { name: 'Prior Court Orders & Notices', icon: 'gavel', right: 'ring' },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { icon: 'truck', title: 'DELIVERY DETAILS', caps: true, right: { pill: 'Delivered', tone: 'verified', dot: true } },
      blocks: [
        {
          k: 'grid',
          boxed: 'cells',
          top: 'deliveryTop',
          cells: [
            { label: 'Courier Partner', value: 'Blue Dart Express' },
            { label: 'Waybill Number', value: '8492 0419 5821', tone: 'mono', iconRight: 'copy' },
          ],
        },
        {
          k: 'iconRows',
          top: 'placeTop',
          rows: [
            { icon: 'calendarCheck', t: '25 Oct 2026, 11:30 AM', bold: true },
            { icon: 'building', t: 'Chamber Desk, High Court Bar Building' },
          ],
        },
      ],
    },
    {
      k: 'banner',
      icon: 'info',
      tone: 'cream',
      text: 'Courier delivery alone does not mean legal custody. You must confirm that you have the papers in hand.',
      top: 'custodyTop',
    },
    {
      k: 'card',
      top: 'checkTop',
      blocks: [
        {
          k: 'check',
          gate: true,
          title: 'I have received the physical documents.',
          sub: 'Once confirmed, your client will be notified and case preparation can start.',
          checked: false,
        },
      ],
    },
  ],
  footer: [{ label: 'Confirm Received', iconRight: 'arrowRight', variant: 'muted', gated: true, to: R('documents-received') }],
  footerLinks: [
    { icon: 'alert', t: 'Need help? Report Missing Documents', tone: 'red' },
    { t: 'Next: File Verification' },
  ],
};

// ── design/376 — documents received ──────────────────────────────────────────
// Reached from Confirm Received on 375. Open Case opens Case Preparation
// (377). ⚠ UNSCOPED — Call, the copy icon, Chat with Client; "Client Rahul
// Sharma has been notified" is drawn copy, no notification is sent.
// ⚠ CONFLICT 8 — "Verified by Adv. Gurneet Chawla"; the advocate is Abhishek
// Verma elsewhere. ⚠ CONFLICT 3 — Aadhaar again. ⚠ The waybill number is
// drawn broken after "0419" in a wide cell; kept as drawn.
export const COURT_DOCS_RECEIVED: CourtSpec = {
  title: 'Documents Received',
  centerTitle: true,
  blocks: [
    {
      k: 'hero',
      icon: 'check',
      tone: 'halo',
      pillBelow: true,
      pill: { pill: 'Confirmation Completed • In Advocate Custody', tone: 'help', dot: true, lg: true },
      title: 'Documents Received',
      sub: 'You confirmed that the physical documents were received.',
    },
    {
      k: 'card',
      top: 'firstCardTop',
      head: { title: 'CLIENT', caps: true, titleIcon: 'badgeCheck', right: { pill: 'Matter #LGT-2026-8492', tone: 'grey' } },
      blocks: [
        { k: 'person', initials: CASE.initials, name: CASE.client, sub: 'Property Dispute • High Court Bench', top: 'personTop' },
        { k: 'contact', icon: 'phone', t: CASE.phone2, btn: 'Call', top: 'contactTop' },
      ],
    },
    {
      k: 'label',
      text: 'Physical Bundle',
      title: true,
      pills: [{ pill: '5 Documents', tone: 'peach' }],
      right: { link: 'Received', icon: 'checkCircle', green: true },
      top: 'bundleTop',
    },
    {
      k: 'docs',
      cards: true,
      tiles: true,
      top: 'bundleDocsTop',
      items: [
        { name: 'Original Case Papers & Vakalatnama', meta: 'Hard copy with original physical signatures', icon: 'gavel', right: 'tick' },
        // ⚠ CONFLICT 3 — Aadhaar.
        { name: 'Client Identity Proof (Aadhaar Copy)', meta: 'Self-attested government identification', icon: 'idCard', right: 'tick' },
        { name: 'Signed Petition Draft', meta: 'Complete filing bundle ready for registry', icon: 'signature', right: 'tick' },
        { name: 'Supporting Annexure A & B', meta: 'Registry title deeds and tax clearance receipts', icon: 'archive', right: 'tick' },
        { name: 'Prior Court Orders & Notices', meta: 'Certified copies of previous interim directions', icon: 'scroll', right: 'tick' },
      ],
    },
    { k: 'banner', icon: 'lock', tone: 'grey', center: true, text: 'Physical docket safely received in chamber', top: 'docketTop' },
    {
      k: 'card',
      top: 'deliveryCardTop',
      head: { title: 'DELIVERY DETAILS', caps: true, right: { pill: 'Handed Over', tone: 'panelGreen', dot: true } },
      blocks: [
        {
          k: 'grid',
          boxed: 'cells',
          top: 'deliveryTop',
          cells: [
            { label: 'Sent By', value: 'Legalitt Delivery' },
            { label: 'Courier Partner', value: 'Blue Dart Express' },
            { label: 'Waybill Number', value: '8492 0419\n5821', wide: true, shade: true, iconDisc: 'copy' },
          ],
        },
        { k: 'text', icon: 'shieldCheck', iconSize: 'verifyIcon', t: 'Today, 11:45 AM • Verified by Adv. Gurneet Chawla', tone: 'small', top: 'verifyTop' },
      ],
    },
    {
      k: 'card',
      tone: 'tier',
      top: 'nextCardTop',
      head: { icon: 'flag', tile: 'disc', title: 'Start Case Preparation' },
      blocks: [
        {
          k: 'text',
          t: 'The documents are now ready for your case work. You can begin reviewing the petition notes or prepare registry filings.',
          tone: 'small',
          top: 'nextTextTop',
        },
        { k: 'text', icon: 'bell', iconSize: 'verifyIcon', t: 'Client Rahul Sharma has been notified.', tone: 'small', top: 'notifiedTop' },
      ],
    },
  ],
  footer: [
    { label: 'Open Case', iconRight: 'arrowRight', to: R('case-preparation') },
    { label: 'Chat with Client', icon: 'chat', variant: 'help' },
  ],
  footerStack: true,
};

// ── design/377 — case preparation ────────────────────────────────────────────
// Reached from Open Case on 376. ⚠ Continue is DRAWN DISABLED ("Complete all
// preparation tasks first") and the tasks are static, so it stays disabled:
// nothing drawn leads on to Court Filing (378) — reported as a dead end.
// ⚠ UNSCOPED — View Documents, Save Note, the tasks.
// ⚠ CONFLICT 6 — "Step 5 of 10" with a ten-step timeline; 370 draws five
// steps, 371/372 four, 388 nine, 395/396 eight.
// ⚠ Two task sub-lines are clipped at the card edge in the export; the cut
// word is completed and marked (?).
export const COURT_PREPARATION: CourtSpec = {
  title: 'Case Preparation',
  headerPill: { pill: 'In Progress', tone: 'help' },
  blocks: [
    {
      k: 'lead',
      pill: { pill: 'In Progress', tone: 'peach', dot: true },
      pillNote: 'Step 5 of 10',
      text: 'Prepare the petition and review evidence before court filing.',
    },
    {
      k: 'card',
      top: 'caseCardTop',
      head: { icon: 'folder', title: CASE.hcr, right: { pill: 'Civil', tone: 'grey' } },
      blocks: [
        { k: 'person', initials: CASE.initials, name: CASE.client, tag: { pill: 'Client', tone: 'grey' }, sub: CASE.title, top: 'personTop' },
        { k: 'banner', icon: 'building', tone: 'grey', title: CASE.court, text: CASE.bench, top: 'courtTop' },
      ],
    },
    {
      k: 'card',
      head: { title: 'Documents Received', size: 'docsHeadSize', pills: [{ pill: 'Received', tone: 'greenTile', icon: 'check' }], sub: 'Total: 5 Documents attached' },
      blocks: [
        {
          k: 'pills',
          outline: true,
          top: 'chipsTop',
          items: [
            { pill: 'Original Case Papers', tone: 'grey', icon: 'file' },
            { pill: 'Court Order', tone: 'grey', icon: 'gavel' },
            { pill: 'Identity Proof', tone: 'grey', icon: 'idCard' },
            { pill: 'Property Papers', tone: 'grey', icon: 'building' },
            { pill: 'Previous Vakalatnama', tone: 'grey', icon: 'scroll' },
          ],
        },
        // ⚠ UNSCOPED — no document viewer.
        { k: 'button', btn: { label: 'View Documents', icon: 'eye', variant: 'help' }, top: 'viewTop' },
      ],
    },
    { k: 'label', text: 'Preparation Tasks', title: true, right: '2 of 5 Tasks Done', top: 'tasksLabelTop' },
    { k: 'text', t: 'Complete each task before filing the case.', tone: 'small', top: 'tasksSubTop' },
    { k: 'progress', value: 0.4, top: 'progressTop' },
    {
      k: 'checklist',
      cards: true,
      light: true,
      top: 'tasksTop',
      items: [
        { title: 'Review Case', sub: 'Case details checked', state: 'done', right: { pill: 'Done', tone: 'greenTile', icon: 'check' } },
        { title: 'Review Documents', sub: 'All client documents reviewed', state: 'done', right: { pill: 'Done', tone: 'greenTile', icon: 'check' } },
        // ⚠ (?) clipped in the export after "court".
        { title: 'Prepare Court Papers', sub: 'Prepare the petition and other court papers', state: 'progress', icon: 'note', right: { pill: 'In Progress', tone: 'peach' } },
        { title: 'Check Filing Details', sub: 'Check the court and filing details.', state: 'none', right: { pill: 'Not Started', tone: 'grey' } },
        // ⚠ (?) clipped in the export after "hear".
        { title: 'Prepare for Hearing', sub: 'Get the case ready for the first hearing', state: 'none', right: { pill: 'Not Started', tone: 'grey' } },
      ],
    },
    { k: 'label', text: 'My Notes', title: true, top: 'notesLabelTop' },
    {
      k: 'card',
      top: 'notesTop',
      blocks: [
        { k: 'field', label: '', value: 'Property ownership papers have been checked. Previous court order also needs to be reviewed before filing.', multiline: true, bordered: true },
        // ⚠ UNSCOPED — Save Note saves nothing.
        // Drawn on two lines.
        { k: 'noteRow', icon: 'lock', t: 'Only visible to you and your chamber team', btn: 'Save\nNote', top: 'noteRowTop' },
      ],
    },
    { k: 'label', text: 'CASE PROGRESS', strong: true, top: 'progressLabelTop' },
    {
      k: 'card',
      top: 'timelineTop',
      blocks: [
        {
          k: 'timeline',
          light: true,
          steps: [
            { title: 'Request Submitted', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Advocate Accepted', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Client Accepted', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Documents Received', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Case Preparation', sub: 'Active • Drafting writ petition', state: 'current', tag: { pill: 'Current', tone: 'peach' } },
            { title: 'Court Filing', sub: 'Upcoming', state: 'todo' },
            { title: 'First Hearing', sub: 'Upcoming', state: 'todo' },
            { title: 'Hearing Update', sub: 'Upcoming', state: 'todo' },
            { title: 'Next Hearing', sub: 'Upcoming', state: 'todo' },
            { title: 'Case Completed', sub: 'Upcoming', state: 'todo' },
          ],
        },
      ],
    },
    {
      k: 'card',
      tone: 'tier',
      top: 'filingTop',
      head: { icon: 'inbox', title: 'Court Filing', size: 'docsHeadSize' },
      blocks: [
        { k: 'text', t: 'Complete the preparation tasks before filing the case.', size: 'filingTextSize', top: 'filingTextTop' },
        { k: 'text', icon: 'info', iconSize: 'filingInfoIcon', t: 'You can move to court filing once your drafts are ready.', tone: 'small', top: 'filingInfoTop' },
      ],
    },
  ],
  footer: [{ label: 'Continue', variant: 'disabled' }],
  footerNote: 'Complete all preparation tasks first.',
};

// ── design/378 — court filing ────────────────────────────────────────────────
// ⚠ No drawn control leads here: 377's Continue is drawn disabled. Reached
// from Continue on 383 (Client Approved).
// ⚠ UNSCOPED — Mark as Filed (both), the document View buttons, Complete
// Filing First. Nothing is filed.
// ⚠ CONFLICT 15 — "Continue to Hearing Update (Available after hearing)" here,
// "Add First Hearing" on 384: two routes into the hearing step.
// ⚠ CONFLICT 4 — the case number WP/2026/09876 already exists while the
// filing is "Not Filed Yet".
export const COURT_FILING: CourtSpec = {
  title: 'Court Filing',
  sub: CASE.hcRep,
  headerRight: { pill: CASE.hcr, tone: 'help' },
  blocks: [
    {
      k: 'card',
      head: { title: 'Court Filing Status', right: { pill: 'Not Filed Yet', tone: 'peach' } },
      blocks: [
        { k: 'text', t: 'Add the filing details after you submit the case in court.', size: 'statusTextSize', top: 'statusTextTop' },
        { k: 'button', btn: { label: 'Mark as Filed', icon: 'listChecks' }, top: 'markTop' },
      ],
    },
    {
      k: 'card',
      head: { title: 'CASE DETAILS', caps: true, right: { pill: 'Civil', tone: 'help' } },
      blocks: [
        {
          k: 'rows',
          top: 'rowsTop',
          bottom: 'rowsBottom',
          rows: [
            ['Client', CASE.client],
            ['Case Title', CASE.title],
            ['Court', CASE.court],
            ['Bench', CASE.bench],
            ['Case Number', CASE.caseNo, 'monoBrown'],
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'Filing Details', size: 'bigHeadSize', right: { pill: 'Not Filed Yet', tone: 'peach' } },
      blocks: [
        {
          k: 'grid',
          boxed: 'panel',
          top: 'filingGridTop',
          cells: [
            { label: 'Filing Date', value: 'Not Added' },
            { label: 'Filing Number', value: 'Not Added' },
          ],
        },
        { k: 'rows', top: 'caseNoTop', rows: [['Case Number', CASE.caseNo, 'mono']] },
        { k: 'footRow', icon: 'info', t: 'Filing status awaiting advocate submission.', top: 'awaitTop', bottom: 'awaitBottom' },
      ],
    },
    {
      k: 'card',
      head: { title: 'Filed Documents', size: 'bigHeadSize', right: '3 verified submissions' },
      blocks: [
        {
          k: 'docs',
          tiles: true,
          btnTone: 'help',
          top: 'filedTop',
          items: [
            { name: 'Petition.pdf', meta: '32 pages • PDF', icon: 'file', btn: 'View' },
            { name: 'Affidavit.pdf', meta: '8 pages • PDF', icon: 'shield', btn: 'View' },
            { name: 'Supporting Papers.pdf', meta: '18 pages • PDF', icon: 'paperclip', btn: 'View' },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { icon: 'gavel', title: 'First Hearing', size: 'bigHeadSize', right: { pill: 'Locked', tone: 'help' } },
      blocks: [
        {
          k: 'empty',
          icon: 'lock',
          title: 'Hearing date locked',
          text: 'First file the case in court before adding a hearing date.',
          btn: 'Complete Filing First',
          top: 'emptyTop',
        },
      ],
    },
    {
      k: 'card',
      tone: 'tier',
      top: 'whatTop',
      head: { icon: 'info', title: 'What happens next?', tone: 'brown', size: 'whatSize' },
      blocks: [
        {
          k: 'numbered',
          top: 'numTop',
          items: [
            'After you add the filing details, the court filing step is marked complete.',
            'Once the court provides your first hearing date, add it here to update tracking.',
            'The client will see case tracking update automatically in their app.',
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { title: 'Case Progress', size: 'bigHeadSize' },
      blocks: [
        {
          k: 'timeline',
          deep: true,
          discTop: true,
          top: 'stepsTop',
          steps: [
            { title: 'Documents Received', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Client Accepted', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Case Preparation', sub: 'Completed', state: 'done', subGreen: true },
            { title: 'Court Filing', sub: 'Current step • Awaiting submission', state: 'ring', subBrown: true },
            { title: 'First Hearing Scheduled', sub: 'Waiting for filing confirmation', state: 'wait' },
            { title: 'First Hearing', sub: 'Waiting', state: 'wait', muted: true },
            { title: 'Hearing Update', sub: 'Waiting', state: 'wait', muted: true },
            { title: 'Next Hearing', sub: 'Waiting', state: 'wait', muted: true },
            { title: 'Case Completed', sub: 'Waiting', state: 'wait', muted: true },
          ],
        },
      ],
    },
  ],
  footer: [{ label: 'Mark as Filed', icon: 'listChecks' }],
  footerNote: 'Add the filing details after you submit the case in court.',
  footerNote2: 'Continue to Hearing Update (Available after hearing)',
};

// ── design/379 — confirm court filing ────────────────────────────────────────
// ⚠ No drawn control leads here: Mark as Filed (378) is unscoped. Save Filing
// Details opens Case Filed (384) — navigation only, nothing is saved; Cancel
// goes back. ⚠ UNSCOPED — the receipt upload, View / Replace, the date picker.
// ⚠ CONFLICT 7 — "Confirm Court Filin" clipped in the export; stored whole.
// ⚠ (?) The receipt's name is clipped to "Filing_Receipt.p"; the base name is
// drawn whole, the extension is read as .pdf.
export const COURT_CONFIRM_FILING: CourtSpec = {
  title: 'Confirm Court Filing',
  sub: CASE.hcRep,
  headerRight: { pill: CASE.hcr, tone: 'help' },
  blocks: [
    {
      k: 'card',
      tone: 'halo',
      indent: true,
      head: { icon: 'clipboardCheck', tile: 'step', title: 'Add Filing Details', size: 'introTitleSize', sub: 'Enter the details after you submit the case in court.' },
      blocks: [{ k: 'text', icon: 'info', iconSize: 'introIcon', t: 'Legalitt will save the details you enter here.', tone: 'small', top: 'introInfoTop' }],
    },
    {
      k: 'card',
      top: 'caseTop',
      head: { icon: 'gavel', title: 'Case Details', right: { pill: 'Civil', tone: 'help' } },
      blocks: [
        {
          k: 'card',
          tone: 'panel',
          pad: 'rowsPad',
          top: 'rowsTop',
          bottom: 'rowsBottom',
          blocks: [
            {
              k: 'rows',
              rows: [
                ['Client', CASE.client],
                ['Case Title', CASE.title],
                ['Court', CASE.court],
                ['Bench', CASE.bench],
              ],
            },
          ],
        },
      ],
    },
    {
      k: 'card',
      head: { icon: 'filePen', title: 'Filing Details' },
      blocks: [
        { k: 'field', label: 'Filing Date', req: true, value: '18 October 2026', iconRight: 'calendar', hint: 'The actual date you submitted the case to the registry.', top: 'firstFieldTop' },
        { k: 'field', label: 'Filing Number', req: true, value: CASE.filingNo, hint: 'Enter the filing number given by the court.', top: 'fieldGap' },
        { k: 'field', label: 'Case Number', right: 'If assigned', value: CASE.caseNo, hint: 'Enter the case number if available.', top: 'fieldGap' },
        { k: 'field', label: 'Filing Status', req: true, top: 'fieldGap' },
        { k: 'choices', top: 'statusTop', items: [{ label: 'Filed', sub: 'Case has been filed in the court registry', selected: true, dot: true }] },
        { k: 'field', label: 'Filing Note', right: 'Optional', value: 'Petition submitted at the Indore Bench.', multiline: true, hint: 'Any additional remark for your legal file.', top: 'fieldGap' },
      ],
    },
    {
      k: 'card',
      head: { icon: 'receipt', title: 'Filing Receipt', right: 'Optional' },
      blocks: [
        { k: 'text', t: 'Upload the court receipt or filing acknowledgement if you have it.', size: 'receiptTextSize', top: 'receiptTextTop' },
        {
          k: 'docs',
          tiles: true,
          tileTone: 'wallet',
          top: 'uploadTop',
          // ⚠ (?) "Filing_Receipt.p" in the export.
          items: [{ name: 'Filing_Receipt.pdf', meta: '2.1 MB • Uploaded', icon: 'pdf', inline: ['View', 'Replace'] }],
        },
        { k: 'text', icon: 'checkCircle', iconSize: 'introIcon', t: 'PDF, JPG or PNG • Optional', tone: 'small', top: 'formatsTop' },
      ],
    },
    {
      k: 'card',
      tone: 'banner',
      top: 'confirmTop',
      blocks: [
        {
          k: 'check',
          checked: true,
          title: 'I confirm that I have submitted this case in court and the filing details above are correct.',
          sub: 'Legalitt records advocate-confirmed data for case tracking.',
        },
      ],
    },
  ],
  footer: [
    { label: 'Save Filing Details', icon: 'save', to: R('case-filed') },
    { label: 'Cancel', variant: 'link', back: true },
  ],
  footerStack: true,
};

// ── design/380 — create court fee request (District Court) ───────────────────
// ⚠ UNSCOPED — Send Court Fee Request sends nothing (no fee request, no SMS,
// no app notification); the receipt upload, View / Replace and Upload Another
// Document do nothing. ⚠ The Client View Preview is STATIC sample content: it
// does not reflect what is typed above.
// ⚠ The preview's "..." is drawn text, kept as written.
// ⚠ CONFLICT 16 — Case Number "Pending Filing" (fresh case); 385 has
// WP/2026/09876 and a High Court filing number on this District Court case.
// ⚠ The challan's file name is clipped in the export ("Court_Fee_Challan_I…"):
// a neutral placeholder, awaiting a clean re-export.
export const COURT_FEE_CREATE: CourtSpec = {
  title: 'Court Fee',
  headerPill: { pill: CASE.dc, tone: 'peach' },
  sub: CASE.dcRep,
  blocks: [
    {
      k: 'lead',
      pill: { pill: 'FRESH CASE • REQUIRED BEFORE FILING', tone: 'peach', dot: true, dotGreen: true },
      title: 'Create Court Fee Request',
      text: 'Request official court filing fee from client before submitting the fresh case to the registry.',
    },
    {
      k: 'card',
      top: 'caseTop',
      head: { icon: 'folderOpen', title: 'Case Details', right: { pill: 'Auto-filled from Record', tone: 'panel', icon: 'refresh', iconGreen: true } },
      blocks: [
        {
          k: 'grid',
          top: 'gridTop',
          cells: [
            { label: 'Client', value: CASE.client },
            { label: 'Case Type', value: 'Civil Suit' },
            { label: 'Matter', value: CASE.title, wide: true },
            { label: 'Court', value: 'District Court, Indore' },
            { label: 'Status', value: 'Fresh Case' },
            // ⚠ CONFLICT 16.
            { label: 'Case Number', value: 'Pending Filing', tone: 'muted' },
            { label: 'Assigned Advocate', value: 'Adv. Abhishek Verma' },
          ],
        },
        { k: 'banner', icon: 'link', tone: 'grey', text: 'Existing case details linked automatically from client onboarding request.', top: 'linkTop' },
      ],
    },
    {
      k: 'card',
      head: { icon: 'receipt', title: 'Fee Request Details', size: 'bigHeadSize' },
      blocks: [
        { k: 'field', label: 'Heading', req: true, right: 'Title seen by client', value: 'Court Fee for Case Filing', hint: 'Visible to client as the request title.', top: 'firstFieldTop' },
        {
          k: 'field',
          label: 'Description',
          req: true,
          right: 'Clear explanation',
          value: 'Court fee required before filing the fresh civil case in District Court registry as per official court valuation rules.',
          multiline: true,
          hint: 'Explain clearly why this court fee is needed.',
          top: 'fieldGap',
        },
        {
          k: 'field',
          label: 'Court Fee Amount (INR)',
          req: true,
          right: 'Exact valuation',
          prefix: '₹',
          value: '3,500',
          big: true,
          hint: 'Enter the exact court registry fee determined for this matter.',
          top: 'fieldGap',
        },
      ],
    },
    {
      k: 'card',
      tone: 'panel',
      top: 'previewCardTop',
      head: { icon: 'eye', title: 'Client View Preview', right: { link: 'Live preview', dot: true } },
      blocks: [
        {
          k: 'card',
          top: 'previewTop',
          pad: 'previewPad',
          blocks: [
            {
              k: 'lead',
              pill: { pill: 'Fee Requested by Advocate', tone: 'peach' },
              right: { link: 'Pending', icon: 'clock', muted: true, mutedIcon: true },
            },
            { k: 'text', t: 'Court Fee for Case Filing', tone: 'title', top: 'previewTitleTop' },
            { k: 'text', t: 'Court fee required before filing the fresh civil case in District Court registry as per official court...', tone: 'small', top: 'previewTextTop' },
            { k: 'amount', label: 'Payable Amount', value: '₹3,500', suffix: '• Payment Pending', suffixGreen: true, side: ['Advocate', 'Adv. Abhishek Verma'], top: 'previewAmountTop' },
          ],
        },
        { k: 'text', t: 'Rahul Sharma will see this payment screen card instantly upon dispatch.', tone: 'note', top: 'previewNoteTop' },
      ],
    },
    {
      k: 'card',
      top: 'receiptCardTop',
      head: { icon: 'receipt', title: 'Court Fee Receipt', right: { pill: 'Optional', tone: 'help' } },
      blocks: [
        { k: 'text', t: 'You can upload the court fee challan or proof of e-filing fee receipt if already paid or available.', tone: 'small', top: 'receiptTextTop' },
        {
          k: 'docs',
          tiles: true,
          top: 'uploadTop',
          // ⚠ Unreadable in the export — a neutral placeholder.
          items: [{ name: 'Court_Fee_Challan_XXXX', meta: '1.8 MB', metaGood: 'Receipt Added', icon: 'file', inline: ['View', 'Replace'] }],
        },
        { k: 'upload', inline: true, icon: 'plusCircle', title: 'Upload Another Document', sub: 'Supported: PDF, JPG, PNG (Max 10MB)', top: 'anotherTop' },
      ],
    },
    {
      k: 'banner',
      icon: 'bell',
      tone: 'cream',
      title: 'Immediate Client Notification',
      titleBrown: true,
      text: 'Client will be notified instantly via SMS & App notification once you send this request. Case moves to court filing immediately upon payment.',
      top: 'notifyTop',
    },
  ],
  footer: [{ label: 'Send Court Fee Request (₹3,500)', iconRight: 'arrowRight' }],
  footerLinks: [{ icon: 'lock', t: 'Official Case Record • Client Payment Awaited After Send', tone: 'green' }],
};
