import { useDemoWait } from '../../../hooks/useDemoAdvance';
import { SwitchedCourtScreen } from '../../../components/court/CourtKit';
import { advCourtAccepted, advCourtWaiting } from '../../../constants/theme';
import { COURT_WAITING_STATES } from '../../../data/advocateCourt';

// Advocate — waiting for the client (design/370). Measured at 1.000 px/pt on a
// 2x upscale. The drawn switcher ships: Waiting for Client is 370, Client
// Accepted is 371 (also its own route, client-accepted).

const TOKENS = [advCourtWaiting, advCourtAccepted];

export default function AdvocateCourtWaitingScreen() {
  // DEMO: Waiting for Client moves on to Client Accepted (371) after 5 seconds.
  useDemoWait();
  return <SwitchedCourtScreen specs={COURT_WAITING_STATES} tokens={TOKENS} />;
}
