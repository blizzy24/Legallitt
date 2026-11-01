import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import { useAdvocateNoticeModel } from "../../../../features/legal-notice/useAdvocateNoticeModel";
import { useLocalSearchParams, type Href } from 'expo-router';

import PaymentSuccessScreen from '../../../../components/PaymentSuccessScreen';
import { CO_SUCCESS } from '../../../../data/courier';
import { ADV_NOTICE_PAYMENT } from '../../../../data/advocateSide';

// Advocate — document delivery paid (design/198). Pixel-identical to the
// courier's design/279, so it is the same PaymentSuccessScreen. As there, the
// drawn ₹1377 / #PSR739482 / "forensic analysis" are replaced by this payment's
// own amount, reference and service (the entering flow's, 17 Oct). Start
// Tracking opens the shipment (design/199).
export default function AdvocateNoticePaidScreen() {
  const model = useAdvocateNoticeModel('paid');
  const payment = model.data.ADV_NOTICE_PAYMENT;
  const d = {
    ...CO_SUCCESS,
    refValue: payment.ref,
    successBody: CO_SUCCESS.successBody.replace(/₹[\d,]+/, payment.total.replace(/\/-$/, '')),
    successBody2: CO_SUCCESS.successBody2.replace('forensic analysis', 'document delivery'),
  };
  return <NoticeScreenFeedback error={model.error}><PaymentSuccessScreen d={d} ctaHref={model.courierHref()} /></NoticeScreenFeedback>;
}
