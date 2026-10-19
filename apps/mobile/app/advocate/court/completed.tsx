import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtCompleted } from '../../../constants/theme';
import { COURT_COMPLETED } from '../../../data/advocateCourt';

// Advocate — design/395. Measured at 1.000 px/pt on a 2x upscale.

export default function AdvocateCourtCompletedScreen() {
  return <CourtScreen spec={COURT_COMPLETED} tokens={advCourtCompleted} />;
}
