import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtPreFiling } from '../../../constants/theme';
import { COURT_PRE_FILING } from '../../../data/advocateCourt';

// Advocate — pre-filing review (design/382). Measured at 1.000 px/pt on a 2x
// upscale. ⚠ Send Revised Documents is unscoped; 383 (the client's approval)
// is its own route.

export default function AdvocateCourtPreFilingScreen() {
  return <CourtScreen spec={COURT_PRE_FILING} tokens={advCourtPreFiling} />;
}
