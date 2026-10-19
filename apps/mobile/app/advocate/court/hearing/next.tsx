import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtNextHearing } from '../../../../constants/theme';
import { COURT_NEXT_HEARING } from '../../../../data/advocateCourt';

// Advocate — next hearing (design/392). Measured at 1.000 px/pt on a 2x upscale.
// Reached from Save & Send Update on 391. Save Next Hearing opens 396 (navigation only).

export default function AdvocateCourtNextHearingScreen() {
  return <CourtScreen spec={COURT_NEXT_HEARING} tokens={advCourtNextHearing} />;
}
