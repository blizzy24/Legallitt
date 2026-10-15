import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtFeeCreate } from '../../../../constants/theme';
import { COURT_FEE_CREATE } from '../../../../data/advocateCourt';

// Advocate — create court fee request, District Court (design/380). Measured
// at 1.000 px/pt on a 2x upscale. ⚠ Send Court Fee Request is unscoped and
// goes nowhere; the client preview is static sample content.

export default function AdvocateCourtFeeCreateScreen() {
  return <CourtScreen spec={COURT_FEE_CREATE} tokens={advCourtFeeCreate} />;
}
