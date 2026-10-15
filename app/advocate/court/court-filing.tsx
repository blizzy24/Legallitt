import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtFiling } from '../../../constants/theme';
import { COURT_FILING } from '../../../data/advocateCourt';

// Advocate — court filing (design/378). Measured at 1.000 px/pt on a 2x
// upscale. Reached from Continue on 383. ⚠ Mark as Filed is unscoped: nothing
// is filed, and nothing drawn leads on from here (see the spec).

export default function AdvocateCourtFilingScreen() {
  return <CourtScreen spec={COURT_FILING} tokens={advCourtFiling} />;
}
