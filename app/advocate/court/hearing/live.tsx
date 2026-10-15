import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtHearingLive } from '../../../../constants/theme';
import { COURT_HEARING_LIVE } from '../../../../data/advocateCourt';

// Advocate — today's hearing (design/389). Measured at 1.000 px/pt on a 2x upscale.
// Reached from View First Hearing on 388. Start Hearing and Preview Live Hearing Mode are unscoped.

export default function AdvocateCourtHearingLiveScreen() {
  return <CourtScreen spec={COURT_HEARING_LIVE} tokens={advCourtHearingLive} />;
}
