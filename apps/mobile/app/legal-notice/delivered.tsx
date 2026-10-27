import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
import { useDeliveryModel } from '../../features/legal-notice/useDeliveryModel';
export function DeliveredView() {
  const model = useDeliveryModel();
  return <NoticeDeliveryScreen delivered {...model} />;
}
export default DeliveredView;
