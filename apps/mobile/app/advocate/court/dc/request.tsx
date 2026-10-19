import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtDcRequest } from '../../../../constants/theme';
import { COURT_DC_REQUEST } from '../../../../data/advocateCourt';

// Advocate — District Court request details. Reached from the Cases tab District Court card. (design/398).

export default function AdvocateCourtDcRequestScreen() {
  return <CourtScreen spec={COURT_DC_REQUEST} tokens={advCourtDcRequest} />;
}
