import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtAccepted } from '../../../constants/theme';
import { COURT_ACCEPTED } from '../../../data/advocateCourt';

// Advocate — client accepted (design/371). Measured at 1.000 px/pt on a 2x
// upscale. Also the second state of 370's switcher. design/372 is a second,
// different drawing of this state: app/advocate/court/client-accepted-2.tsx.

export default function AdvocateCourtClientAcceptedScreen() {
  return <CourtScreen spec={COURT_ACCEPTED} tokens={advCourtAccepted} />;
}
