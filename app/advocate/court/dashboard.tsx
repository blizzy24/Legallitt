import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtDashboard } from '../../../constants/theme';
import { COURT_DASHBOARD } from '../../../data/advocateCourt';

// Advocate — design/396. Measured at 1.000 px/pt on a 2x upscale.

export default function AdvocateCourtDashboardScreen() {
  return <CourtScreen spec={COURT_DASHBOARD} tokens={advCourtDashboard} />;
}
