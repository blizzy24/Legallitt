import PreviewStep from '../../components/PreviewStep';
import {PaymentDetailLive} from '../../features/account/Payments';
import {DATA_SOURCE} from '../../lib/data-source';

// Payment Details (D-18, profile-10) with the D-19 receipt.
export default function PaymentDetailScreen() {
  return DATA_SOURCE === 'api' ? <PaymentDetailLive/> : <PreviewStep header="Payment Details" service="Payments" />;
}
