import ScanPayScreen from '../../components/ScanPayScreen';
import { LA_PAYMENT_SERVICE, LA_PAYMENT_TOTAL, LA_REQUEST_ID } from '../../data/legalAdvice';

// Reuse Legal Notice designs 29–30, with Legal Advice's own payment data.
export default function LegalAdvicePaymentScreen() {
  const query = new URLSearchParams({
    service: LA_PAYMENT_SERVICE,
    amount: String(LA_PAYMENT_TOTAL),
    ref: LA_REQUEST_ID,
    next: '/legal-advice/confirmed',
  }).toString();
  return (
    <ScanPayScreen
      service={LA_PAYMENT_SERVICE}
      amount={LA_PAYMENT_TOTAL}
      requestId={LA_REQUEST_ID}
      backHref="/legal-advice/review"
      successHref="/legal-notice/success"
      query={query}
      hold
    />
  );
}
