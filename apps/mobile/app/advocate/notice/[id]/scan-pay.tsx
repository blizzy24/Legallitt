import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { useLocalSearchParams, type Href } from 'expo-router';

import ScanPayScreen from '../../../../components/ScanPayScreen';
import { CO_SCAN_PAY } from '../../../../data/courier';
import { ADV_NOTICE_PAYMENT } from '../../../../data/advocateSide';

// Advocate — document delivery Scan & Pay (design/197). Pixel-identical to the
// courier's design/278, so it is the same ScanPayScreen, held like the courier's
// (the QR moves on when tapped; demo mode moves on after the shared wait). The
// amount is the delivery payment's own (design/196, ₹290); the QR's "Legal
// Notice" label is drawn.
export default function AdvocateNoticeScanPayScreen() {
  const model = useAdvocateNoticeModel('scan-pay');
  return <NoticeScreenFeedback error={model.error}><ScanPayScreen service={CO_SCAN_PAY.service} amount={model.total}
    successHref={model.path('paid')}
    backHref={model.path('payment')} onPayment={model.onPay}
    paymentReady={!model.api || (!model.controller.loading && model.total !== null)} hold /></NoticeScreenFeedback>;
}
