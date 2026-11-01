import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
import { useDeliveryModel } from '../../features/legal-notice/useDeliveryModel';
// Design 440. Once the shipment is delivered it offers the route to 441.
export default function DeliveryView() {
  const model = useDeliveryModel('delivery');
  return <NoticeScreenFeedback error={model.error}><NoticeDeliveryScreen {...model} /></NoticeScreenFeedback>;
}
