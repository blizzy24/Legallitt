import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtProcessFeeDone } from '../../../../constants/theme';
import { COURT_PROCESS_FEE_DONE } from '../../../../data/advocateCourt';

// Advocate — process fee completed, District Court (design/386). Measured at
// 1.000 px/pt on a 2x upscale. 385's layout after payment; Back to Case goes
// back. ⚠ The receipt upload, View and Replace are unscoped.

export default function AdvocateCourtProcessFeeDoneScreen() {
  return <CourtScreen spec={COURT_PROCESS_FEE_DONE} tokens={advCourtProcessFeeDone} />;
}
