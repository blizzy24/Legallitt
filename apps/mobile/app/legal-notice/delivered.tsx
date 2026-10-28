import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
import { useDeliveryModel } from '../../features/legal-notice/useDeliveryModel';
// Thin alias of delivery for the fixture demo's flow map, which lands here for
// design 441. In API mode the shipment decides the state exactly as on delivery.
export default function DeliveredView() {
  const model = useDeliveryModel(true);
  return <NoticeDeliveryScreen {...model} />;
}
