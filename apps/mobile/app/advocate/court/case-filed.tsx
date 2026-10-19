import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtCaseFiled } from '../../../constants/theme';
import { COURT_CASE_FILED } from '../../../data/advocateCourt';

// Advocate — case filed (design/384). Measured at 1.000 px/pt on a 2x upscale.
// Reached from Save Filing Details on 379; Add First Hearing opens 387.

export default function AdvocateCourtCaseFiledScreen() {
  return <CourtScreen spec={COURT_CASE_FILED} tokens={advCourtCaseFiled} />;
}
