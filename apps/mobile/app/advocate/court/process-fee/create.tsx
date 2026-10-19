import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtProcessFee } from '../../../../constants/theme';
import { COURT_PROCESS_FEE } from '../../../../data/advocateCourt';

// Advocate — process fee request, District Court (design/385). Measured at
// 1.000 px/pt on a 2x upscale. ⚠ Send Process Fee Request is unscoped; the
// client preview is static sample content.

export default function AdvocateCourtProcessFeeScreen() {
  return <CourtScreen spec={COURT_PROCESS_FEE} tokens={advCourtProcessFee} />;
}
