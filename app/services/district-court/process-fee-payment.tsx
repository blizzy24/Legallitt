import { DC_PROCESS_FEE_PAY } from '../../../data/courtFees';
import CourtPaymentFlow from '../../../components/CourtPaymentFlow';

// District Court — process fee payment (designs 322 → 323 → 324). The body is
// components/CourtPaymentFlow; read its header for conflict 2: "Pay Process
// Fee (₹850)" on design/321 lands on ₹40,680. design/324 differs from 298 only
// in its button — "View Receipt" — hence `receipt`; it opens design/325.
export default function DistrictCourtProcessFeePaymentScreen() {
  return (
    <CourtPaymentFlow
      fee={DC_PROCESS_FEE_PAY}
      base="/services/district-court/process-fee-payment"
      next="/services/district-court/process-fee-receipt"
      receipt
      backHref="/services/district-court/process-fee"
    />
  );
}
