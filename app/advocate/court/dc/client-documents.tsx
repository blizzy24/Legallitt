import { CourtScreen } from '../../../../components/court/CourtKit';
import { advCourtDcDocuments } from '../../../../constants/theme';
import { COURT_DC_CLIENT_DOCUMENTS } from '../../../../data/advocateCourt';

// Advocate — client documents. Reached from Accept Request on 398. (design/399).

export default function AdvocateCourtDcClientDocumentsScreen() {
  return <CourtScreen spec={COURT_DC_CLIENT_DOCUMENTS} tokens={advCourtDcDocuments} />;
}
