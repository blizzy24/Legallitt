import { SwitchedCourtScreen } from '../../../components/court/CourtKit';
import { advCourtRequest } from '../../../constants/theme';
import { COURT_REQUEST } from '../../../data/advocateCourt';

// Advocate — High Court request (design/363). Measured at 1.000 px/pt on a 2x
// upscale. The drawn "STATE MODE" switcher ships: Before Accept is the design,
// Request Accepted reuses its layout with drawn copy (see COURT_REQUEST).
// Reached from the High Court and District Court cards on the Cases tab.

export default function AdvocateCourtRequestScreen() {
  return <SwitchedCourtScreen specs={COURT_REQUEST} tokens={[advCourtRequest, advCourtRequest]} />;
}
