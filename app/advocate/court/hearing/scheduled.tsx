import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtHearingScheduled } from '../../../../constants/theme';
import { COURT_HEARING_SCHEDULED } from '../../../../data/advocateCourt';

// Advocate — first hearing scheduled (design/388). Measured at 1.000 px/pt on a 2x upscale.
// Reached from Save First Hearing on 387; View First Hearing opens 389. Commence Session is unscoped.

export default function AdvocateCourtHearingScheduledScreen() {
  return <CourtScreen spec={COURT_HEARING_SCHEDULED} tokens={advCourtHearingScheduled} />;
}
