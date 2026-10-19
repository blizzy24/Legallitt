import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtAccepted2 } from '../../../constants/theme';
import { COURT_ACCEPTED_2 } from '../../../data/advocateCourt';

// Advocate — client accepted, second drawing (design/372). Measured at 1.000
// px/pt on a 2x upscale. ⚠ A different drawing of 371's state (see
// COURT_ACCEPTED_2); built as drawn. No drawn control leads here.

export default function AdvocateCourtClientAccepted2Screen() {
  return <CourtScreen spec={COURT_ACCEPTED_2} tokens={advCourtAccepted2} />;
}
