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
