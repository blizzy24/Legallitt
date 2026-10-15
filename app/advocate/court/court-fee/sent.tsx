import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtFeeSent } from '../../../../constants/theme';
import { COURT_FEE_SENT } from '../../../../data/advocateCourt';

// Advocate — court fee request sent, District Court (design/381). Measured at
// 1.000 px/pt on a 2x upscale. ⚠ No drawn control leads here (380's send is
// unscoped); Back to Case goes back.

export default function AdvocateCourtFeeSentScreen() {
  return <CourtScreen spec={COURT_FEE_SENT} tokens={advCourtFeeSent} />;
}
