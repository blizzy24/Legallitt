import { DC_SERVICE_PAY } from '../../../data/courtFees';
import CourtPaymentFlow from '../../../components/CourtPaymentFlow';

// District Court — service fee payment after Submit Request (design/344).
// The body is components/CourtPaymentFlow with the service-fee record and the
// replacement design/298 success (`hero`), as for the High Court service fee.
//
// ⚠ 344 says "No payment is taken right now … payable only upon advocate
// confirmation", yet the exports put this payment after it; and its amounts
// (₹29,631 / ₹40,680 / bar ₹35,000) match neither of 343's ₹25,000 / ₹35,000.
// Wired as drawn; reported, not resolved. Success continues to design/299.
export default function DistrictCourtPaymentScreen() {
  return (
    <CourtPaymentFlow
      fee={DC_SERVICE_PAY}
      base="/services/district-court/payment"
      next="/services/district-court/request-submitted"
      backHref="/services/district-court/review"
      hero
    />
  );
}
