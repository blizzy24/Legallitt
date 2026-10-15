import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtPreparation } from '../../../constants/theme';
import { COURT_PREPARATION } from '../../../data/advocateCourt';

// Advocate — case preparation (design/377). Measured at 1.000 px/pt on a 2x
// upscale. Reached from Open Case on 376. ⚠ Continue is drawn disabled and the
// tasks are static, so nothing leads on from here (see the spec).

export default function AdvocateCourtPreparationScreen() {
  return <CourtScreen spec={COURT_PREPARATION} tokens={advCourtPreparation} />;
}
