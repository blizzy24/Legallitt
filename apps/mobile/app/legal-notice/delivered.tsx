import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
import { useDeliveryModel } from '../../features/legal-notice/useDeliveryModel';
// Design 441, reached from 440's View Delivery Confirmation (or the fixture flow map).
export default function DeliveredView() {
  const model = useDeliveryModel('delivered');
  return <NoticeScreenFeedback error={model.error}><NoticeDeliveryScreen {...model} /></NoticeScreenFeedback>;
}
