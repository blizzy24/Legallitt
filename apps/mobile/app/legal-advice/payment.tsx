import { useLocalSearchParams } from 'expo-router';
import { useLegalAdvice } from '../../context/legalAdvice';

import ScanPayScreen from '../../components/ScanPayScreen';
import { LA_PAYMENT_SERVICE, laConsultType, type LaConsultTypeId, LA_REQUEST_ID } from '../../data/legalAdvice';

// Reuse Legal Notice designs 29–30, with Legal Advice's own payment data.
export default function LegalAdvicePaymentScreen() {
  const { form } = useLegalAdvice();
  const { consultType } = useLocalSearchParams<{ consultType?: LaConsultTypeId }>();
  const consultation = laConsultType(consultType ?? form.consultType);
  const amount = consultation.choosePrice;
  const service = `${LA_PAYMENT_SERVICE} (${consultation.title})`;
  const query = new URLSearchParams({
    service,
    consultType: consultation.id,
    amount: String(amount),
    ref: LA_REQUEST_ID,
    next: '/legal-advice/confirmed',
  }).toString();
  return (
    <ScanPayScreen
      service={service}
      amount={amount}
      requestId={LA_REQUEST_ID}
      backHref="/legal-advice/review"
      successHref="/legal-notice/success"
      query={query}
      hold
    />
  );
}
