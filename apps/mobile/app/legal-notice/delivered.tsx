import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import NoticeDeliveryScreen from '../../components/NoticeDeliveryScreen';
// design/441 — client delivery confirmation.
function FixtureDelivered() { return <NoticeDeliveryScreen delivered/>; }

// The deployed fixture path remains unchanged; API mode is explicit.
export default function Delivered() {
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="delivered" /> : <FixtureDelivered />;
}
