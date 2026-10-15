import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtHearingAdd } from '../../../../constants/theme';
import { COURT_HEARING_ADD } from '../../../../data/advocateCourt';

// Advocate — add first hearing (design/387). Measured at 1.000 px/pt on a 2x upscale.
// Reached from Add First Hearing on 384; Save First Hearing opens 388. Commence Session is unscoped.

export default function AdvocateCourtHearingAddScreen() {
  return <CourtScreen spec={COURT_HEARING_ADD} tokens={advCourtHearingAdd} />;
}
