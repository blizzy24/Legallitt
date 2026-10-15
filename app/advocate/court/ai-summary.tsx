import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtAiSummary } from '../../../constants/theme';
import { COURT_AI_SUMMARY } from '../../../data/advocateCourt';

// Advocate — AI case summary (design/364). Measured at 1.000 px/pt on a 2x
// upscale. ⚠⚠ UNSCOPED — every AI surface here is drawn copy; see the spec.
// Reached from Accept Case on the High Court request (363).

export default function AdvocateCourtAiSummaryScreen() {
  return <CourtScreen spec={COURT_AI_SUMMARY} tokens={advCourtAiSummary} />;
}
