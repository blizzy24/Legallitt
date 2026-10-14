import CourtPaymentFlow from '../../../components/CourtPaymentFlow';

// High Court — service fee payment (designs 296 → 297 → 298). The body is
// components/CourtPaymentFlow; read its header for conflict 2 (₹40,680).
// The success step is the REPLACEMENT design/298 (`hero`).
//
// ⚠ CROSS-SERVICE STEP: design/298's "Start Tracking" is followed, in the
// design numbering, by design/299 — a DISTRICT COURT "Request Submitted"
// screen (DC-2026-1048, District Court, Indore) after a High Court payment.
// Wired that way, as the only next screen the batch draws; flagged.
export default function HighCourtPaymentScreen() {
  return (
    <CourtPaymentFlow
      base="/services/high-court/payment"
      next="/services/district-court/request-submitted"
      backHref="/services/high-court/pricing"
      hero
    />
  );
}
