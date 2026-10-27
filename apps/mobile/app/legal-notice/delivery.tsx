import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
import { useDeliveryModel } from '../../features/legal-notice/useDeliveryModel';
export function DeliveryView() {
  const model = useDeliveryModel();
  return <NoticeDeliveryScreen  {...model} />;
}
export default DeliveryView;
