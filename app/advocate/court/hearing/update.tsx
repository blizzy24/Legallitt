import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtHearingUpdate } from '../../../../constants/theme';
import { COURT_HEARING_UPDATE } from '../../../../data/advocateCourt';

// Advocate — hearing update (design/390). Measured at 1.000 px/pt on a 2x upscale.
// No drawn control leads here (389's Start Hearing is unscoped). Save Hearing Update opens 391.

export default function AdvocateCourtHearingUpdateScreen() {
  return <CourtScreen spec={COURT_HEARING_UPDATE} tokens={advCourtHearingUpdate} />;
}
