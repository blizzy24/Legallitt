import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
// design/440 — client notice in transit.
export function DeliveryView() { return <NoticeDeliveryScreen/>; }

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Delivery() {
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="delivery" /> : <DeliveryView />;
}
