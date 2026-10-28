import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
import { useDeliveryModel } from '../../features/legal-notice/useDeliveryModel';
// Designs 440 and 441: one destination, rendered by shipment state.
export default function DeliveryView() {
  const model = useDeliveryModel();
  return <NoticeDeliveryScreen {...model} />;
}
