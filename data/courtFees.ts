import type { CourtFee } from '../components/CourtPaymentFlow';
import { DC_CHANGE, DC_COURT_FEE, DC_PROCESS_FEE, DC_REVIEW, DC_SUBMITTED } from './districtCourt';
import { HC_CHAT, HC_PRICING } from './highCourt';

// Each court payment's fee, taken from the screen that enters it (client
// instruction, 17 Oct: "fees, references and amounts come from the entering
// flow"). components/CourtPaymentFlow shows these in place of the 296 template
// (₹34,999 / ₹379 / ₹40,680). Only values those screens draw are used; none adds
// GST or a line the entering screen does not show. The High Court pending-case
// payment (330) draws no fee, so it keeps the template.

/** "₹3,500" → 3500. */
const rupees = (s: string) => Number(s.replace(/[^\d]/g, ''));

/** design/314 → 315: the court fee. */
export const DC_COURT_FEE_PAY: CourtFee = {
  service: DC_COURT_FEE.title,
  ref: DC_SUBMITTED.id,
  lines: [{ label: DC_COURT_FEE.boxRows[0][0], value: DC_COURT_FEE.boxRows[0][1] }],
  total: DC_COURT_FEE.amount,
  amount: rupees(DC_COURT_FEE.amount),
};

/** design/321 → 322: the process fee, with its drawn ₹0 portal line. */
export const DC_PROCESS_FEE_PAY: CourtFee = {
  service: DC_PROCESS_FEE.title,
  ref: DC_SUBMITTED.id,
  lines: DC_PROCESS_FEE.boxRows.filter((r) => !('total' in r)).map((r) => ({ label: r.label, value: r.value })),
  total: DC_PROCESS_FEE.amount,
  amount: rupees(DC_PROCESS_FEE.amount),
};

/** design/329 → 331: the change-advocate fee (re-issued ₹12,000). */
export const DC_CHANGE_PAY: CourtFee = {
  service: 'Change Advocate Fee',
  ref: DC_SUBMITTED.id,
  lines: [{ label: DC_CHANGE.feeSub, value: DC_CHANGE.fee }],
  total: DC_CHANGE.fee,
  amount: rupees(DC_CHANGE.fee),
};

/** design/344 → 296: the District Court service fee, the review's Total Estimated. */
export const DC_SERVICE_PAY: CourtFee = {
  service: DC_REVIEW.sumRows[0][1],
  ref: DC_SUBMITTED.id,
  lines: [{ label: DC_REVIEW.svcTitle, value: DC_REVIEW.svcPrice }],
  total: DC_REVIEW.totalPrice,
  amount: rupees(DC_REVIEW.totalPrice),
};

/** design/295 → 296: the High Court service fee, for the tier chosen on 295. */
export function hcServicePay(tierId?: string): CourtFee {
  const tier = HC_PRICING.tiers.find((x) => x.id === tierId) ?? HC_PRICING.tiers.find((x) => x.id === HC_PRICING.initial) ?? HC_PRICING.tiers[0];
  return {
    service: HC_PRICING.feeRows.service[1],
    ref: HC_CHAT.ctxId,
    lines: [{ label: HC_PRICING.feeRows.base, value: tier.price }],
    total: tier.price,
    amount: rupees(tier.price),
  };
}
