import { DC_CHANGE_PAY } from '../../../data/courtFees';
import CourtPaymentFlow from '../../../components/CourtPaymentFlow';

// District Court — change-advocate fee payment. The batch draws no payment
// screens of its own for the ₹12,000 change fee (design/329); like every other
// fee it lands on the shared ₹40,680 flow — components/CourtPaymentFlow,
// conflict 2.
//
// ⚠ No drawn screen follows a change request. The success button opens
// design/335 (Case Completed), the last District Court screen — flagged, not
// drawn as such.
export default function DistrictCourtChangeAdvocatePaymentScreen() {
  return (
    <CourtPaymentFlow
      fee={DC_CHANGE_PAY}
      base="/services/district-court/change-advocate-payment"
      next="/services/district-court/case-completed"
      backHref="/services/district-court/change-advocate"
    />
  );
}
