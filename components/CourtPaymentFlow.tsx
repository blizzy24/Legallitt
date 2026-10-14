import { useLocalSearchParams, type Href } from 'expo-router';

import CompletePaymentScreen from './CompletePaymentScreen';
import PaymentSuccessScreen from './PaymentSuccessScreen';
import ScanPayScreen from './ScanPayScreen';
import { HC_PAYMENT, HC_SCAN_PAY, HC_SUCCESS, SERVICE_PAYMENT } from '../data/highCourt';

// ─────────────────────────────────────────────────────────────────────────────
// THE ONE HIGH COURT / DISTRICT COURT PAYMENT — designs 296 → 297 → 298, drawn
// again as 315/316/317, 322/323/324 and 331/332/333, pixel-identical apart from
// 324's button.
//
// ⚠⚠ CONFLICT 2 — BUILT EXACTLY AS DRAWN, AWAITING CLIENT CORRECTION. Do NOT
// "fix" this by wiring real fees. Every caller lands on Service Fee ₹34,999,
// GST 18% ₹379, Total ₹40,680:
//  · 18% of ₹34,999 is ₹6,300, not ₹379;
//  · ₹34,999 + ₹379 = ₹35,378, not ₹40,680;
//  · the ₹850 process fee, ₹3,500 court fee and ₹1,500 change-advocate fee all
//    lead to this same ₹40,680 screen (the ₹250 courier fee does not — designs
//    307/308 are the courier's own ₹290 screens, reused unchanged).
// One component serves every caller. Since the 14 Oct re-issue the service-fee
// caller has its own record, SERVICE_PAYMENT (₹29,631 / ₹379 / ₹40,680, bar
// ₹35,000 — still broken, see its comment); every other caller keeps HC_PAYMENT.
//
// ⚠ The success step says "₹1377 has been received" and "Your forensic analysis
// request has been submitted", with #PSR739482 — conflict 3.
//
// STATIC, NOT WIRED: all payment, the QR (a drawn glyph, not a scannable code)
// and the "Waiting for payment…" spinner, which polls nothing. As in the Legal
// Notice flow the Scan & Pay step moves on to success after a pause.
//
// ⚠ SPLIT BY CALLER (client instruction, 14 Oct). The re-issued exports draw
// the service-fee success (design/298) with a new layout — `hero` — while the
// court-fee (317) and pending-case (333) successes were re-issued unchanged.
// Only the service-fee callers pass `hero`.
//
// The three steps share one route per caller, selected by ?step=; the caller's
// route passes `next` (where the success button goes) and `receipt` (324's
// "View Receipt" label) through the query.
// ─────────────────────────────────────────────────────────────────────────────

export default function CourtPaymentFlow({
  base,
  next,
  receipt = false,
  hero = false,
  backHref,
}: {
  /** This caller's payment route, e.g. /services/high-court/payment. */
  base: string;
  /** Where the success button goes. */
  next: string;
  /** design/324: the success button reads "View Receipt". */
  receipt?: boolean;
  /** The service-fee caller: the re-issued 296 values (SERVICE_PAYMENT) and the
   *  replacement 298 success layout. Every other caller keeps HC_PAYMENT. */
  hero?: boolean;
  backHref: string;
}) {
  const { step } = useLocalSearchParams<{ step?: string }>();

  if (step === 'scan') {
    return (
      <ScanPayScreen
        service={HC_SCAN_PAY.service}
        amount={HC_SCAN_PAY.amount}
        successHref={base as Href}
        query="step=done"
      />
    );
  }
  if (step === 'done') {
    const d = receipt ? { ...HC_SUCCESS, cta: HC_SUCCESS.ctaReceipt } : HC_SUCCESS;
    return <PaymentSuccessScreen d={d} ctaHref={next as Href} tick hero={hero} />;
  }
  return <CompletePaymentScreen d={hero ? SERVICE_PAYMENT : HC_PAYMENT} payHref={`${base}?step=scan` as Href} backHref={backHref as Href} />;
}
