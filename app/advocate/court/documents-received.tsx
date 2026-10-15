import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtDocsReceived } from '../../../constants/theme';
import { COURT_DOCS_RECEIVED } from '../../../data/advocateCourt';

// Advocate — documents received (design/376). Measured at 1.000 px/pt on a
// 2x upscale. Reached from Confirm Received on 375; Open Case opens 377.

export default function AdvocateCourtDocsReceivedScreen() {
  return <CourtScreen spec={COURT_DOCS_RECEIVED} tokens={advCourtDocsReceived} />;
}
