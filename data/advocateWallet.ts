// ─────────────────────────────────────────────────────────────────────────────
// ADVOCATE WALLET — designs 356–361.
//
// 356 / 357 / 358 are ONE screen (the earnings tab) drawn in three period
// states: This Month, Last Month, This Year. The segmented control switches
// between the three records below. 359 is the withdrawal, 360 bank account
// management, 361 the UTR transfer details.
//
// ⚠⚠ STATIC, NOT WIRED — UNSCOPED. There is no payout rail, no bank API and no
// NEFT/IMPS/RTGS integration. Every payout action is drawn and does nothing:
// Withdraw Money, Confirm Withdrawal, Set as Primary, Add New Bank Account,
// Edit Details, Download Payout Receipt, the share / download icons, Copy on
// the UTR, the UTR Details links, View Statement, Payout Time & Limits,
// Connect with Advocate Desk, Advocate Support Desk.
//
// CONFLICTS — commented where they occur, not resolved:
//  2. "Total Before Fees" heads the Earnings Breakdown, but its rows sum to the
//     NET figure, not Total Billed, in all three periods (see WALLET_PERIODS).
//  3. The Platform Fee line is ~7.6% of Total Billed (₹6,500 / ₹85,000;
//     ₹7,800 / ₹1,02,000; ₹21,100 / ₹2,86,500) while every transaction row on
//     356–358 and 361 is exactly 10%; design/361 says "Platform Fee (10%)" four
//     times with correct arithmetic.
//  5–7, 4, 8 — see WALLET_BANK, WALLET_UTR and WALLET_WITHDRAW.
//  10. "Payout Time & Limits" and "View Statement" have no destination drawn
//     anywhere.
// ─────────────────────────────────────────────────────────────────────────────

export type WalletPeriodId = 'month' | 'last' | 'year';
export type PillTone = 'green' | 'peach' | 'cream' | 'grey' | 'tile';

export type WalletPayment = {
  initials: string;
  name: string;
  status: string;
  statusTone: PillTone;
  service: string;
  date: string;
  gross: string;
  fee: string;
  net: string;
};

export type WalletPeriod = {
  id: WalletPeriodId;
  label: string;
  /** design/357 and 358 draw a filter icon in the header; 356 does not. */
  filter: boolean;
  available: string;
  tiles: { label: string; icon: 'earned' | 'pending' | 'paid'; value: string; sub?: string; subGreen?: boolean }[];
  breakdown: { icon: 'consult' | 'draft' | 'court' | 'advisory'; title: string; sub: string; value: string; share: number }[];
  billed: string;
  platformFee: string;
  taxes: string;
  net: string;
  payments: WalletPayment[];
  transfer: {
    icon: 'sync' | 'check';
    title: string;
    sub?: string;
    pill: string;
    pillTone: PillTone;
    pillDot?: boolean;
    amount: string;
    ref: string;
  };
  /** design/357 and 358 close with the bank-transfer note; 356 does not. */
  note: boolean;
  /** design/357 draws the This Month chip in the panel grey, not white. */
  greyFirstChip?: boolean;
};

export const WALLET = {
  title: 'Wallet And Earnings',
  sub: 'Track your earnings and payouts',
  readyCaps: 'READY TO WITHDRAW',
  settled: 'Settled',
  paise: '.00',
  readySub: 'Ready to send to your verified bank account',
  withdraw: 'Withdraw Money',
  limits: 'Payout Time & Limits',
  nextSend: 'Sent next today at 6:00 PM',
  breakdownTitle: 'Earnings Breakdown',
  breakdownTag: 'Total Before Fees',
  feesTitle: 'Fees & Deductions',
  billedLabel: 'Total Billed',
  feeLabel: 'Platform Fee',
  /** ⚠ The chip beside "Platform Fee" repeats the label. Built as drawn. */
  feeChip: 'Platform Fee',
  taxesLabel: 'Taxes & Extra Charges',
  netLabel: 'Net Earnings (Your Take-Home)',
  paymentsTitle: 'Recent Payments',
  statement: 'View Statement',
  grossLabel: 'Gross: ',
  feeShort: 'Fee: ',
  netShort: 'Net: ',
  bankTitle: 'Bank Account',
  bankName: 'SBI •••• 4821',
  /** ⚠ Clipped in all three exports ("IFSC: SBIN0("); built in full and wrapped. */
  bankSub: 'Primary Savings · IFSC: SBIN0001048',
  manage: 'Manage',
  utr: 'UTR Details',
  note: 'Money is sent to your bank account every day through standard bank transfer.',
};

/**
 * ⚠ CONFLICT 2 — "Total Before Fees", yet each breakdown sums to NET:
 *   356: 28,500 + 32,000 + 18,000 = 78,500 = Net (Total Billed 85,000)
 *   357: 36,000 + 38,500 + 19,700 = 94,200 = Net (Total Billed 1,02,000)
 *   358: 98,000 + 1,08,400 + 59,000 = 2,65,400 = Net (Total Billed 2,86,500)
 * The drawn bars are each row's share of that net total.
 * ⚠ CONFLICT 3 — Platform Fee ≈ 7.6% of Total Billed; every payment row is 10%.
 */
export const WALLET_PERIODS: WalletPeriod[] = [
  {
    // design/356 — a 406px export (1.000 px/pt); its layout matches 357.
    id: 'month',
    label: 'This Month',
    filter: false,
    available: '₹24,850',
    tiles: [
      { label: 'Total Earned', icon: 'earned', value: '₹78,500', sub: 'All services' },
      { label: 'Pending', icon: 'pending', value: '₹9,200', sub: '2 clearances' },
      { label: 'Paid Out', icon: 'paid', value: '₹44,450' },
    ],
    breakdown: [
      { icon: 'consult', title: 'Consultations', sub: '14 sessions', value: '₹28,500', share: 28500 / 78500 },
      { icon: 'draft', title: 'Legal Drafting', sub: '8 completed', value: '₹32,000', share: 32000 / 78500 },
      { icon: 'court', title: 'Court Hearings', sub: '3 attended', value: '₹18,000', share: 18000 / 78500 },
      { icon: 'advisory', title: 'Advisory', sub: '0 active', value: '₹0', share: 0 },
    ],
    billed: '₹85,000',
    platformFee: '-₹6,500',
    // ⚠ design/356 draws the row's own label as its value. Built as drawn.
    taxes: 'Taxes & Extra Charges',
    net: '₹78,500',
    payments: [
      { initials: 'RS', name: 'Rahul Sharma', status: 'Paid', statusTone: 'green', service: 'Legal Notice', date: '18 Sep 2026', gross: '₹3,500', fee: '-₹350', net: '₹3,150' },
      { initials: 'AS', name: 'Ananya Singh', status: 'Pending', statusTone: 'cream', service: 'Legal Advice', date: '17 Sep 2026', gross: '₹2,000', fee: '-₹200', net: '₹1,800' },
      { initials: 'RM', name: 'Rohan Mehta', status: 'Processing', statusTone: 'tile', service: 'Property Search', date: '16 Sep 2026', gross: '₹4,500', fee: '-₹450', net: '₹4,050' },
    ],
    transfer: {
      icon: 'sync',
      title: 'Recent Transfer',
      pill: 'On the Way',
      pillTone: 'peach',
      amount: '₹18,200',
      // ⚠ CONFLICT 7 — the 1048 suffix again (DC-2026-1048, HCR-2026-1048…).
      ref: 'Ref: PAY-2026-1048-SBI',
    },
    note: false,
  },
  {
    // design/357
    id: 'last',
    label: 'Last Month',
    filter: true,
    available: '₹12,400',
    tiles: [
      { label: 'Total Earned', icon: 'earned', value: '₹94,200', sub: 'Completed' },
      { label: 'Pending', icon: 'pending', value: '₹3,100', sub: '1 clearance' },
      // ⚠ Paid Out ₹78,700, while the Last Month Payout below is ₹42,500.
      { label: 'Paid Out', icon: 'paid', value: '₹78,700', sub: 'To account', subGreen: true },
    ],
    breakdown: [
      { icon: 'consult', title: 'Consultations', sub: '18 sessions', value: '₹36,000', share: 36000 / 94200 },
      { icon: 'draft', title: 'Legal Drafting', sub: '10 completed', value: '₹38,500', share: 38500 / 94200 },
      { icon: 'court', title: 'Court Hearings', sub: '4 attended', value: '₹19,700', share: 19700 / 94200 },
      { icon: 'advisory', title: 'Advisory', sub: '0 active', value: '₹0', share: 0 },
    ],
    billed: '₹1,02,000',
    platformFee: '-₹7,800',
    taxes: '₹0',
    net: '₹94,200',
    payments: [
      { initials: 'VR', name: 'Vikramaditya Rao', status: 'Paid', statusTone: 'green', service: 'Legal Notice', date: '28 Aug 2026', gross: '₹4,000', fee: '-₹400', net: '₹3,600' },
      { initials: 'SR', name: 'Sunita Reddy', status: 'Paid', statusTone: 'green', service: 'Property Search', date: '24 Aug 2026', gross: '₹5,000', fee: '-₹500', net: '₹4,500' },
      { initials: 'KM', name: 'Kabir Malhotra', status: 'Paid', statusTone: 'green', service: 'Legal Advice', date: '19 Aug 2026', gross: '₹3,000', fee: '-₹300', net: '₹2,700' },
    ],
    transfer: {
      icon: 'check',
      title: 'Last Month Payout',
      pill: 'Settled',
      pillTone: 'green',
      pillDot: true,
      amount: '₹42,500',
      ref: 'Ref: PAY-2026-0892-SBI',
    },
    note: true,
    greyFirstChip: true,
  },
  {
    // design/358
    id: 'year',
    label: 'This Year',
    filter: true,
    available: '₹31,250',
    tiles: [
      // ⚠ CONFLICT 9 — "₹2,65,400" wraps to two lines inside its tile in the
      // export ("₹2,65, / 400"); it is built at the drawn size and wraps.
      // ⚠ "3-month total" under This Year.
      { label: 'Total Earned', icon: 'earned', value: '₹2,65,400', sub: '3-month total' },
      { label: 'Pending', icon: 'pending', value: '₹14,800', sub: '3 clearances' },
      { label: 'Paid Out', icon: 'paid', value: '₹2,19,350', sub: 'To account', subGreen: true },
    ],
    breakdown: [
      { icon: 'consult', title: 'Consultations', sub: '48 sessions', value: '₹98,000', share: 98000 / 265400 },
      { icon: 'draft', title: 'Legal Drafting', sub: '26 completed', value: '₹1,08,400', share: 108400 / 265400 },
      { icon: 'court', title: 'Court Hearings', sub: '11 attended', value: '₹59,000', share: 59000 / 265400 },
      { icon: 'advisory', title: 'Advisory', sub: '0 active', value: '₹0', share: 0 },
    ],
    billed: '₹2,86,500',
    platformFee: '-₹21,100',
    taxes: '₹0.00',
    net: '₹2,65,400',
    payments: [
      { initials: 'AD', name: 'Anita Deshmukh', status: 'Paid', statusTone: 'green', service: 'Legal Notice', date: '14 Aug 2026', gross: '₹4,500', fee: '-₹450', net: '₹4,050' },
      { initials: 'RK', name: 'Rajesh Kothari', status: 'Paid', statusTone: 'green', service: 'Commercial Fraud', date: '02 Aug 2026', gross: '₹6,000', fee: '-₹600', net: '₹5,400' },
      { initials: 'MK', name: 'Meera Krishnan', status: 'Paid', statusTone: 'green', service: 'Property Search', date: '18 Jul 2026', gross: '₹5,500', fee: '-₹550', net: '₹4,950' },
    ],
    transfer: {
      icon: 'sync',
      title: 'Latest Transfer · 6 batches',
      // ⚠ "across 3 months" under This Year.
      sub: '₹2,19,350 disbursed across 3 months',
      pill: 'Completed',
      pillTone: 'green',
      amount: '₹35,000',
      ref: 'Ref: PAY-2026-0914-SBI',
    },
    note: true,
  },
];
