import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import TrackingScreen from './tracking';
// design/437: the complete client decision view, following design/32.
export function NoticeDecisionView() { return <TrackingScreen decision />; }

// The deployed fixture path remains unchanged; API mode is explicit.
export default function NoticeDecision() {
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="decision" /> : <NoticeDecisionView />;
}
