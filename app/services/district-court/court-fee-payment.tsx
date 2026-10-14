import CourtPaymentFlow from '../../../components/CourtPaymentFlow';

// District Court — court fee payment (designs 315 → 316 → 317, pixel-identical
// to 296 → 297 → 298). The body is components/CourtPaymentFlow; read its header
// for conflict 2: "Pay Court Fee (₹3,500)" on design/314 lands on ₹40,680.
//
// ⚠ CROSS-SERVICE STEP: design/317's button is followed, in the design
// numbering, by design/318 — a HIGH COURT "Review Before Filing" screen.
// Wired that way, as the only next screen the batch draws; flagged.
export default function DistrictCourtCourtFeePaymentScreen() {
  return (
    <CourtPaymentFlow
      base="/services/district-court/court-fee-payment"
      next="/services/high-court/review-filing"
      backHref="/services/district-court/court-fee"
    />
  );
}
