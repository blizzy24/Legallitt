import { CourtScreen } from '../../../components/court/CourtKit';
import { advCourtConfirmFiling } from '../../../constants/theme';
import { COURT_CONFIRM_FILING } from '../../../data/advocateCourt';

// Advocate — confirm court filing (design/379). Measured at 1.000 px/pt on a
// 2x upscale. Save Filing Details opens 384 (navigation only).

export default function AdvocateCourtConfirmFilingScreen() {
  return <CourtScreen spec={COURT_CONFIRM_FILING} tokens={advCourtConfirmFiling} />;
}
