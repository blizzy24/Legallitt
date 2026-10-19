import CourtPaymentFlow from '../../../../components/CourtPaymentFlow';

// High Court pending case — payment (designs 331 → 332 → 333, pixel-identical
// to 296 → 297 → 298). The body is components/CourtPaymentFlow; read its
// header for conflict 2 (₹40,680). The success step opens design/334 (Case
// Sent for Verification).
export default function HighCourtPendingPaymentScreen() {
  return (
    <CourtPaymentFlow
      base="/services/high-court/pending/payment"
      next="/services/high-court/pending/verification"
      backHref="/services/high-court/pending/details"
    />
  );
}
