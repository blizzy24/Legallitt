import ScanPayScreen from '../../components/ScanPayScreen';
import {router,type Href} from 'expo-router';
import { FIR_PAYMENT_SERVICE, FIR_PAYMENT_TOTAL, FIR_REQUEST } from '../../data/fir';

// Reuse Legal Notice designs 29–30. Placeholder pricing is documented in data/fir.
function FixtureFirPaymentScreen() {
  const query = new URLSearchParams({
    service: FIR_PAYMENT_SERVICE,
    amount: String(FIR_PAYMENT_TOTAL),
    ref: FIR_REQUEST.requestId,
    next: '/fir/submitted',
  }).toString();
  return (
    <ScanPayScreen
      service={FIR_PAYMENT_SERVICE}
      amount={FIR_PAYMENT_TOTAL}
      requestId={FIR_REQUEST.requestId}
      backHref="/fir/step5"
      successHref="/legal-notice/success"
      query={query}
      hold
      onPayment={()=>router.replace(`/legal-notice/success?${query}` as Href)}
    />
  );
}
import FirClient from '../../features/fir/FirClient';
import {DATA_SOURCE} from '../../lib/data-source';
export default function LiveFirScreen() { return DATA_SOURCE === 'api' ? <FirClient/> : <FixtureFirPaymentScreen/>; }
