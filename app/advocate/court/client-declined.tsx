import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtDeclined } from '../../../constants/theme';
import { COURT_DECLINED } from '../../../data/advocateCourt';

// Advocate — client declined (design/373). Measured at 1.000 px/pt on a 2x
// upscale. ⚠ A District Court screen inside the High Court flow (conflict 9).

export default function AdvocateCourtClientDeclinedScreen() {
  return <CourtScreen spec={COURT_DECLINED} tokens={advCourtDeclined} />;
}
